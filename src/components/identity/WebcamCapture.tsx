'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

// ponytail: 실제 얼굴 검증 API 없음 — 정해진 시간 지나면 무조건 통과 처리.
// 검증 API 붙으면 ALIGN_DELAY_MS 자동전환 대신 실제 얼굴 인식 신호로 트리거하고,
// verifying은 실제 응답 기다리다 실패 시 error phase로 보낼 것.
const ALIGN_DELAY_MS = 4000;
const VERIFY_DELAY_MS = 1500;
const DIM_OVERLAY_MS = 2000;

type Phase = 'idle' | 'aligning' | 'verifying' | 'complete' | 'error';

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-8 bg-neutral-20 px-5 py-4 text-lg text-icon-90">
      {children}
    </div>
  );
}

export function WebcamCapture({ onCapture }: { onCapture: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCaptureRef = useRef(onCapture);
  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkVisible, setCheckVisible] = useState(false);
  const [showDim, setShowDim] = useState(false);

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

  // aligning 진입 시 DIM_OVERLAY_MS 동안만 어둡게, 그 뒤 촬영 전까지는 원래대로.
  useEffect(() => {
    if (phase !== 'aligning') return;

    const raf = requestAnimationFrame(() => setShowDim(true));
    const timer = setTimeout(() => setShowDim(false), DIM_OVERLAY_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [phase]);

  // 얼굴이 프레임에 맞춰지면(=aligning 진입) ALIGN_DELAY_MS 후 자동으로 캡처.
  useEffect(() => {
    if (phase !== 'aligning') return;

    const timer = setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
      }
      setPhase('verifying');
    }, ALIGN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'verifying') return;

    const timer = setTimeout(() => {
      setPhase('complete');
      onCaptureRef.current();
    }, VERIFY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  // 체크마크가 뙇 나타나지 않고 살짝 커지면서 나타나도록.
  useEffect(() => {
    if (phase !== 'complete') return;
    const raf = requestAnimationFrame(() => setCheckVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-title-lg text-icon-90">
          Let&apos;s take a photo for facial verification
        </h1>
        <p className="text-title-md font-normal text-icon-50">
          Please remove hats, glasses, and masks.
        </p>
        <div className="relative mt-5 size-82">
          <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-green-500" />
          <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-green-500" />
          <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-green-500" />
          <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-green-500" />
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return <p className="text-center text-sm text-red-500">{errorMessage}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusPill>
        {phase === 'aligning' && 'Align your face within the frame'}
        {phase === 'verifying' && 'Verifying...'}
        {phase === 'complete' && 'Scan and photo capture complete'}
      </StatusPill>

      <div className="relative size-82 overflow-hidden rounded-2xl border-4 border-icon-90">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={cn(
            'size-full object-cover transition-[filter] duration-500',
            phase !== 'aligning' && 'blur-sm',
          )}
        />
        <div
          className={cn(
            'absolute inset-0 transition-colors duration-500',
            phase === 'aligning'
              ? showDim
                ? 'bg-black/65'
                : 'bg-transparent'
              : 'bg-black/50',
          )}
        />
        <canvas ref={canvasRef} className="hidden" />

        {phase === 'complete' ? (
          <span
            className={cn(
              'absolute left-1/2 top-1/2 flex size-23 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-green-500 transition-all duration-300 ease-out',
              checkVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            )}
          >
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
        ) : (
          <span className="absolute left-1/2 top-1/2 size-50 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-500">
            {phase === 'verifying' && (
              <span className="absolute inset-0 animate-ping rounded-full border-2 border-green-500" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
