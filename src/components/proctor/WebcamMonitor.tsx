'use client';

import { useEffect, useRef } from 'react';

import { analyzeFrame, getClipUploadUrl, linkClip } from '@/lib/api/monitoring';
import { PROCTOR_DISABLED } from '@/lib/proctor/config';
import { captureVideoFrame } from '@/lib/utils/captureVideoFrame';
import { uploadToSignedUrl } from '@/lib/utils/uploadToSignedUrl';

import { useCameraStream } from '@/providers/CameraStreamProvider';
import { useModal } from '@/providers/ModalProvider';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalBase } from '@/components/common/Modal/ModalBase';

// 웹캠 프레임 주기 전송. 결정 근거·비용 레버는 docs/planning/05-proctoring-monitoring.md 참고.
// - 기본 10s, env로 조절. severity>=LOW 응답 오면 일정시간 5s로 가속(adaptive).
// - 프레임은 640px/jpeg 0.7로 축소해 업로드/Storage 비용 절감.
// - 탭 숨김(document.hidden)이면 스킵. 동일인 검사(runIdentityCheck)는 희소 호출.
const BASE_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_PROCTOR_INTERVAL_MS ?? 10000,
);
const FAST_INTERVAL_MS = 5000;
// 가속 유지 시간: 마지막 위반 감지 후 이 시간 동안 FAST로.
const FAST_WINDOW_MS = 30000;
// 동일인 검사 주기(프레임 순번 기준). 예: 6프레임마다 1회(기본 10s면 ~1분).
const IDENTITY_CHECK_EVERY = 6;
// createClip 이벤트 시 녹화할 클립 길이.
// ponytail: pre-roll 버퍼 없이 감지 "이후"만 녹화(전후 중 후만). before 컨텍스트가 필요해지면
// 링 버퍼(webm 헤더 청크 유지)로 업그레이드.
const CLIP_DURATION_MS = 6000;

/** 시험 세션 레이아웃에 전역 마운트. 시작 시 웹캠 스트림 확보 + 프레임 전송 루프 시작. */
export function WebcamMonitor({
  examSessionId,
  intervalMs = BASE_INTERVAL_MS,
}: {
  examSessionId: string;
  intervalMs?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // 카메라 스트림은 CameraStreamProvider가 한 번만 취득해 공유(중복 getUserMedia 제거).
  const stream = useCameraStream();
  const { openModal, closeModal } = useModal();

  // 렌더 유발 없이 유지되는 루프 상태. 시작 시각은 effect에서 세팅(렌더 중 Date.now()는 impure).
  const startedAtRef = useRef(0);
  const sequenceRef = useRef(0);
  const fastUntilRef = useRef(0);
  // 클립은 한 번에 하나만 녹화(중복 createClip 시 새 이벤트는 건너뜀).
  const clipBusyRef = useRef(false);
  // identityCheckRequested:true인데 identityCheckExecuted:false로 오면(얼굴 0명/여러 명)
  // 동일인 검사가 실제로는 안 된 것 — 다음 프레임에 바로 재시도(6프레임 주기 기다리지 않음).
  const retryIdentityCheckRef = useRef(false);
  // 시연용: 휴대폰 감지 경고는 세션당 1번만(반복 감지돼도 다시 안 띄움).
  // TODO(project_phone_detection_modal_pending 메모): 기획자 답변 오면 빈도 정책 다시 확정.
  const phoneWarnedRef = useRef(false);

  useEffect(() => {
    if (PROCTOR_DISABLED || !stream) return;
    startedAtRef.current = Date.now();
    // 이 effect 실행에 국한된 취소 플래그/타이머 — StrictMode 이중 마운트 시 루프가 겹치지 않게.
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // MediaStream을 CLIP_DURATION_MS 동안 녹화해 하나의 webm Blob으로.
    const recordClip = (src: MediaStream): Promise<Blob | null> =>
      new Promise((resolve) => {
        let recorder: MediaRecorder;

        try {
          recorder = new MediaRecorder(src, { mimeType: 'video/webm' });
        } catch {
          resolve(null);
          return;
        }

        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () =>
          resolve(
            chunks.length
              ? new Blob(chunks, { type: recorder.mimeType })
              : null,
          );

        recorder.start();
        setTimeout(
          () => recorder.state !== 'inactive' && recorder.stop(),
          CLIP_DURATION_MS,
        );
      });

    // createClip 이벤트: 클립 녹화 → 업로드 URL 발급 → signedUrl 업로드 → 이벤트 연결 (05 C흐름).
    // 루프를 막지 않도록 tick에서 await하지 않고 분리 실행. 실패해도 시험 진행 방해 안 함.
    const handleClip = async (eventId: string) => {
      if (clipBusyRef.current || !stream) return;
      clipBusyRef.current = true;

      try {
        const clip = await recordClip(stream);
        if (!clip || cancelled) return;

        const contentType = (clip.type || 'video/webm').split(';')[0];
        const { path, signedUrl } = await getClipUploadUrl(
          examSessionId,
          eventId,
          contentType,
        );
        await uploadToSignedUrl(signedUrl, clip, contentType);

        if (cancelled) return;

        await linkClip(examSessionId, eventId, path);
      } catch (err) {
        console.warn('[WebcamMonitor] clip 업로드 실패:', err);
      } finally {
        clipBusyRef.current = false;
      }
    };

    const scheduleNext = () => {
      if (cancelled) return;
      const fast = Date.now() < fastUntilRef.current;
      timer = setTimeout(tick, fast ? FAST_INTERVAL_MS : intervalMs);
    };

    const tick = async () => {
      if (cancelled) return;
      // 탭 숨김이면 분석 스킵(검은 프레임 무의미, 탭 이탈은 violations로 별도 신고).
      if (document.hidden) {
        scheduleNext();
        return;
      }

      try {
        const frame = await captureVideoFrame(videoRef.current);

        if (frame) {
          sequenceRef.current += 1;
          const seq = sequenceRef.current;
          const runIdentityCheck =
            retryIdentityCheckRef.current || seq % IDENTITY_CHECK_EVERY === 1;
          const res = await analyzeFrame(examSessionId, frame, {
            capturedAt: new Date().toISOString(),
            elapsedMs: Date.now() - startedAtRef.current,
            captureSequence: seq,
            runIdentityCheck,
          });
          retryIdentityCheckRef.current =
            res.identityCheckRequested && !res.identityCheckExecuted;

          // 시연용: 휴대폰 감지 시 세션당 1번만 경고 모달. 문구는 백엔드가 준 그대로.
          if (!phoneWarnedRef.current) {
            const phoneEvent = res.recordedEvents.find(
              (e) => e.eventType === 'PHONE_DETECTED',
            );
            if (phoneEvent) {
              phoneWarnedRef.current = true;
              openModal(
                <ModalBase
                  onClose={closeModal}
                  className="flex w-90 flex-col items-center gap-6 text-center"
                >
                  <p className="text-body-lg text-primary">
                    {phoneEvent.meta.message ?? 'A phone was detected.'}
                  </p>
                  <ButtonPrimary width={140} onClick={closeModal}>
                    Confirm
                  </ButtonPrimary>
                </ModalBase>,
              );
            }
          }

          // 위반 감지되면 잠시 가속.
          if (res.severity !== 'NORMAL') {
            fastUntilRef.current = Date.now() + FAST_WINDOW_MS;
          }
          // createClip 신호면 해당 이벤트의 영상 클립을 녹화·업로드(루프와 분리 실행).
          const clipEventId = res.createClip
            ? res.recordedEvents[0]?.id
            : undefined;
          if (clipEventId) void handleClip(clipEventId);
        }
      } catch (err) {
        // analyze는 실패해도 시험을 막지 않는 게 원칙. 로그만 남기고 다음 주기로.
        console.warn('[WebcamMonitor] analyze 실패:', err);
      }

      scheduleNext();
    };

    // 공유 스트림을 캡처용 비디오에 연결하고 루프 시작. 스트림 정지는 Provider가 담당.
    if (videoRef.current) videoRef.current.srcObject = stream;
    scheduleNext();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [examSessionId, intervalMs, stream, openModal, closeModal]);

  // 화면에 안 보이는 캡처 전용 비디오.
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="pointer-events-none fixed size-px opacity-0"
    />
  );
}
