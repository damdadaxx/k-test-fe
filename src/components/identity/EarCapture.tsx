'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import IcEarGuide from '@/app/assets/icons/icon_ear_guide.svg';

import { getErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

import ErrorDisplay from '@/components/common/Display/ErrorDisplay';

const ALIGN_DELAY_MS = 4000;
const CAPTURED_HOLD_MS = 1200;
const DIM_OVERLAY_MS = 2000;
// 이어폰 감지 시 "Earphones detected" 노출 후 이 시간 뒤 스캔 처음(얼굴인식_05)으로 리셋.
const DETECTED_RESET_MS = 3000;

type Side = 'right' | 'left';
type Phase =
  | 'idle'
  | 'aligning'
  | 'notVisible'
  | 'captured'
  | 'verifying'
  | 'detected'
  | 'notDetected'
  | 'error';

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-8 bg-neutral-20 px-5 py-4 text-lg text-icon-90">
      {children}
    </div>
  );
}

// 기본 에셋은 왼쪽 귀 모양이라, 오른쪽 귀일 때만 180도 회전 + 상하반전.
function EarGuide({ side }: { side: Side }) {
  return (
    <Image
      src={IcEarGuide}
      alt=""
      className={cn(
        'absolute left-[90px] top-[57px] h-[215px] w-[147px]',
        side === 'right' && '[transform:rotate(180deg)_scaleY(-1)]',
      )}
    />
  );
}

// 귀가 프레임에 안 잡힐 때 고개를 돌리라고 안내하는 가이드 (원+십자선+화살표로 단순화).
function TurnHeadGuide() {
  return (
    <div className="absolute left-1/2 top-1/2 size-50 -translate-x-1/2 -translate-y-1/2">
      <div className="absolute inset-0 rounded-full border-2 border-white" />
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/70" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-white">
        ↻
      </span>
    </div>
  );
}

// onDetect: 양쪽 귀 blob을 넘겨 이어폰 감지를 수행하고 earphoneDetected 여부를 돌려준다.
export function EarCapture({
  onDetect,
}: {
  onDetect: (leftEarImage: Blob, rightEarImage: Blob) => Promise<boolean>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDetectRef = useRef(onDetect);
  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [side, setSide] = useState<Side>('right');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDim, setShowDim] = useState(false);
  const blobsRef = useRef<{ right?: Blob; left?: Blob }>({});

  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setPhase('aligning');
      })
      .catch(() => {
        setErrorMessage(
          '카메라를 사용할 수 없습니다. 카메라 권한을 확인해주세요.',
        );
        setPhase('error');
      });

    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);

  // 정렬/재정렬 안내 진입 시 DIM_OVERLAY_MS 동안만 어둡게, 그 뒤 촬영 전까지는 원래대로.
  useEffect(() => {
    if (phase !== 'aligning' && phase !== 'notVisible') return;

    const raf = requestAnimationFrame(() => setShowDim(true));
    const timer = setTimeout(() => setShowDim(false), DIM_OVERLAY_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'aligning') return;

    const timer = setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // HAVE_CURRENT_DATA(2) 미만이면 프레임을 못 받고 있는 상태 — 카메라에
      // 귀가 안 잡혔다고 보고 재정렬 안내로 보낸다 (실제 인식 실패의 유일한 관측 가능 신호).
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
        setPhase('notVisible');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) blobsRef.current[side] = blob;
      }, 'image/jpeg');

      setPhase('captured');
    }, ALIGN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [phase, side]);

  useEffect(() => {
    if (phase === 'notVisible') {
      const timer = setTimeout(() => setPhase('aligning'), ALIGN_DELAY_MS);
      return () => clearTimeout(timer);
    }

    if (phase !== 'captured') return;

    const timer = setTimeout(() => {
      if (side === 'right') {
        setSide('left');
        setPhase('aligning');
        return;
      }

      // 양쪽 귀 캡처 완료 → 이어폰 감지 단계로.
      setPhase('verifying');
    }, CAPTURED_HOLD_MS);

    return () => clearTimeout(timer);
  }, [phase, side]);

  // 양쪽 귀 blob으로 실제 이어폰 감지 → 착용됨(detected) / 미착용(notDetected) 분기.
  useEffect(() => {
    if (phase !== 'verifying') return;

    let cancelled = false;
    const run = async () => {
      const { left, right } = blobsRef.current;
      if (!left || !right) {
        if (!cancelled) {
          setErrorMessage(
            '귀 이미지를 캡처하지 못했습니다. 다시 시도해주세요.',
          );
          setPhase('error');
        }
        return;
      }
      try {
        const detected = await onDetectRef.current(left, right);
        if (cancelled) return;
        setPhase(detected ? 'detected' : 'notDetected');
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          getErrorMessage(
            error,
            '이어폰 감지에 실패했습니다. 다시 시도해주세요.',
          ),
        );
        setPhase('error');
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [phase]);

  // 이어폰 착용 감지 → 안내 후 스캔 처음(오른쪽 귀)으로 리셋해 재촬영 유도.
  useEffect(() => {
    if (phase !== 'detected') return;

    const timer = setTimeout(() => {
      blobsRef.current = {};
      setSide('right');
      setPhase('aligning');
    }, DETECTED_RESET_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'idle') return null;

  if (phase === 'error') {
    return (
      <ErrorDisplay
        message={errorMessage}
        onClick={() => {
          blobsRef.current = {};
          setSide('right');
          setErrorMessage('');
          setPhase('aligning');
        }}
      />
    );
  }

  const label = side === 'right' ? 'right' : 'left';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusPill>
        {phase === 'aligning' && `Show your ${label} ear to the webcam.`}
        {phase === 'notVisible' && `Turn your head to show your ${label} ear.`}
        {phase === 'captured' && 'Scan and photo capture complete'}
        {phase === 'verifying' && 'Verifying...'}
        {phase === 'detected' && 'Earphones detected'}
        {phase === 'notDetected' && 'No earphones detected'}
      </StatusPill>

      <div className="relative size-82 overflow-hidden rounded-2xl border-4 border-icon-90">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={cn(
            'size-full object-cover transition-[filter] duration-500',
            phase !== 'aligning' && phase !== 'notVisible' && 'blur-sm',
          )}
        />
        <div
          className={cn(
            'absolute inset-0 transition-colors duration-500',
            phase === 'aligning' || phase === 'notVisible'
              ? showDim
                ? 'bg-black/65'
                : 'bg-transparent'
              : 'bg-black/50',
          )}
        />
        <canvas ref={canvasRef} className="hidden" />

        {phase === 'aligning' && <EarGuide side={side} />}
        {phase === 'notVisible' && <TurnHeadGuide />}
        {phase === 'verifying' && (
          <span className="absolute left-1/2 top-1/2 size-50 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-success">
            <span className="absolute inset-0 animate-ping rounded-full border-2 border-success" />
          </span>
        )}
        {phase === 'detected' && (
          <span className="absolute left-1/2 top-1/2 flex size-23 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-error">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        {(phase === 'captured' || phase === 'notDetected') && (
          <span className="absolute left-1/2 top-1/2 flex size-23 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-success">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
