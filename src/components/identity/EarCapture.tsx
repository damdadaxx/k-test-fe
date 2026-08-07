'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import IcEarGuide from '@/app/assets/icons/icon_ear_guide.svg';

import { cn } from '@/lib/utils/cn';

// ponytail: 실제 귀 인식 API 없음 — 정해진 시간 지나면 무조건 통과 처리.
// 검증 API 붙으면 자동전환 대신 실제 인식 신호로 트리거하고, 실패 시 notVisible로 보낼 것.
const ALIGN_DELAY_MS = 4000;
const CAPTURED_HOLD_MS = 1200;
const DIM_OVERLAY_MS = 2000;

type Side = 'right' | 'left';
type Phase = 'idle' | 'aligning' | 'notVisible' | 'captured' | 'done' | 'error';

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

export function EarCapture({
  onCapture,
}: {
  onCapture: (leftEarImage: Blob, rightEarImage: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCaptureRef = useRef(onCapture);
  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

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

      setPhase('done');
      const { right, left } = blobsRef.current;
      if (right && left) onCaptureRef.current(left, right);
    }, CAPTURED_HOLD_MS);

    return () => clearTimeout(timer);
  }, [phase, side]);

  if (phase === 'idle') return null;

  if (phase === 'error') {
    return <p className="text-center text-sm text-red-500">{errorMessage}</p>;
  }

  const label = side === 'right' ? 'right' : 'left';

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusPill>
        {phase === 'aligning' && `Show your ${label} ear to the webcam.`}
        {phase === 'notVisible' && `Turn your head to show your ${label} ear.`}
        {phase === 'captured' && 'Scan and photo capture complete'}
        {phase === 'done' && 'Scan complete.'}
      </StatusPill>

      <div className="relative size-82 overflow-hidden rounded-2xl border-4 border-icon-90">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={cn(
            'size-full object-cover transition-[filter] duration-500',
            (phase === 'captured' || phase === 'done') && 'blur-sm',
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
        {(phase === 'captured' || phase === 'done') && (
          <span className="absolute left-1/2 top-1/2 flex size-23 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-green-500">
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
