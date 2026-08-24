'use client';

import { use, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { getExamSession } from '@/lib/api/exam';
import { calibrateGaze } from '@/lib/api/identity';
import { SECTIONS } from '@/lib/exam/sections';
import { PROCTOR_DISABLED } from '@/lib/proctor/config';
import { captureVideoFrame } from '@/lib/utils/captureVideoFrame';

import { useModal } from '@/providers/ModalProvider';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import LoadingDisplay from '@/components/common/Display/LoadingDisplay';
import { ModalBase } from '@/components/common/Modal/ModalBase';

// 점 응시 5초 → 5초 카운트다운(5→1) → 시험 진입 (Figma 시험 시작전 플로우).
const DOT_SECONDS = 5;
const COUNTDOWN_START = 5;

// ponytail: 개발용 우회. 값이 있으면 로그인·본인인증 안 거치고 이 세션 id로 바로 진입.
// .env NEXT_PUBLIC_DEV_SESSION_ID=<INPROGRESS 세션 id>. 운영에선 비워둘 것.
const DEV_SESSION_ID = process.env.NEXT_PUBLIC_DEV_SESSION_ID;

export default function ReadyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 여기 [id] = examSessionId. 세션은 랜딩(Take Test)에서 이미 생성됨 —
  // /ready는 세션을 새로 시작하지 않고 캘리브레이션 후 이 id로 시험에 진입만 한다.
  const { id: sessionId } = use(params);
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  // 시험 진입은 절대 두 번 일어나면 안 된다(카운트다운 재실행 방지) — ref로 1회 보장.
  const startedRef = useRef(false);
  // null = 점 응시 단계, 숫자 = 카운트다운 남은 초.
  const [count, setCount] = useState<number | null>(null);

  // 시선 캘리브레이션용: 카운트다운 동안 캡처한 중앙 응시 이미지들.
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const calibrationImagesRef = useRef<Blob[]>([]);

  // 중앙 응시 프레임 1장 캡처해 캘리브레이션 이미지 배열에 담는다.
  const captureCalibrationFrame = async () => {
    const blob = await captureVideoFrame(videoRef.current);
    if (blob) calibrationImagesRef.current.push(blob);
  };

  // 본인인증 미완료 안내 → 확인 시 본인인증 처음부터 다시.
  const showNotVerifiedModal = () => {
    const backToIdentity = () => {
      closeModal();
      router.replace(`/${sessionId}/identity`);
    };
    openModal(
      <ModalBase
        onClose={backToIdentity}
        className="flex w-90 flex-col items-center gap-6 text-center"
      >
        <p className="text-body-lg text-primary">
          본인인증이 아직 완료되지 않았습니다. 본인인증을 다시 진행해주세요.
        </p>
        <ButtonPrimary width={140} onClick={backToIdentity}>
          확인
        </ButtonPrimary>
      </ModalBase>,
    );
  };

  // 카운트다운이 끝나면(0) 시선 캘리브레이션 → verified 확인 → 시험 진입.
  const enterTestOnce = async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    // 시선 캘리브레이션(선택 기능): 캡처한 이미지가 있으면 전송. 실패해도 시험은 진행(best-effort).
    const images = calibrationImagesRef.current;
    if (!PROCTOR_DISABLED && images.length > 0) {
      try {
        await calibrateGaze(sessionId, images);
      } catch {
        // 캘리브레이션 실패는 시선 판정 정확도만 낮출 뿐 시험 진입을 막지 않는다.
      }
    }

    if (DEV_SESSION_ID) {
      router.replace(
        `/${DEV_SESSION_ID}/testing/${SECTIONS[0].moduleId}/intro`,
      );
      return;
    }

    // testing 진입은 verified 된 세션만 — 본인인증/이어폰이 실제로 끝났는지 여기서 최종 확인.
    try {
      const session = await getExamSession(sessionId);
      if (session.verified) {
        router.replace(`/${sessionId}/testing/${SECTIONS[0].moduleId}/intro`);
        return;
      }
    } catch {
      // 세션 상태 조회 실패 — verified 미확인 상태와 동일하게 처리(안전 우선).
    }
    showNotVerifiedModal();
  };

  // 시선 캘리브레이션용 웹캠 확보(카운트다운 동안 중앙 응시 이미지 캡처). 운영에선 PROCTOR_DISABLED=false.
  useEffect(() => {
    if (PROCTOR_DISABLED) return;

    let cancelled = false;

    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (cancelled) return;
        // 요청은 1회만. 거부/실패 시 안내만 하고 시험은 그대로 진행(캘리브레이션은 best-effort).
        openModal(
          <ModalBase
            onClose={closeModal}
            className="flex w-90 flex-col items-center gap-6 text-center"
          >
            <p className="text-body-lg text-primary">
              시험을 시작하기 위해 카메라와 마이크 권한이 필요합니다. 원활한
              진행을 위해 권한을 허용해 주세요.
            </p>
            <ButtonPrimary width={140} onClick={closeModal}>
              확인
            </ButtonPrimary>
          </ModalBase>,
        );
      }
    };

    // 카메라 요청은 1회만(재요청 없음).
    void requestCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      closeModal();
    };
  }, [openModal, closeModal]);

  // 점 응시 화면을 DOT_SECONDS 동안 보여준 뒤 카운트다운 시작.
  useEffect(() => {
    const timer = setTimeout(
      () => setCount(COUNTDOWN_START),
      DOT_SECONDS * 1000,
    );
    return () => clearTimeout(timer);
  }, []);

  // 카운트다운: 1초마다 감소하며 중앙 응시 프레임 캡처, 0에 닿으면 캘리브레이션+시험 진입.
  useEffect(() => {
    if (count === null) return;
    if (count <= 0) {
      void enterTestOnce();
      return;
    }
    void captureCalibrationFrame();
    const timer = setTimeout(() => setCount((prev) => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const isDot = count === null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 시선 캘리브레이션 캡처용(화면엔 안 보임). */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="pointer-events-none fixed size-px opacity-0"
      />
      <main className="relative flex flex-1 flex-col items-center">
        <p className="mt-[52px] text-title-lg tracking-[-0.64px] text-icon-90">
          {isDot
            ? 'Preparation is complete. Please look at the dot below.'
            : 'The test will now begin.'}
        </p>

        {isDot ? (
          <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        ) : count === 0 ? (
          // 카운트 종료 → 캘리브레이션 전송 대기 로딩.
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LoadingDisplay fullHeight={false} />
          </div>
        ) : (
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] font-bold tracking-[-2px] text-black">
            {count}
          </p>
        )}
      </main>
    </div>
  );
}
