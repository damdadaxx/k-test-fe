'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import ImgFacialVerification from '@/app/assets/images/img_facial_verification.svg';

import { getErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

import ErrorDisplay from '@/components/common/Display/ErrorDisplay';

// 프레임에 얼굴이 맞춰졌다고 보고 자동 캡처하기까지의 시간.
const ALIGN_DELAY_MS = 4000;
const DIM_OVERLAY_MS = 2000;

type Phase = 'idle' | 'aligning' | 'verifying' | 'complete' | 'error';

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-8 bg-neutral-20 px-5 py-4 text-lg text-icon-90">
      {children}
    </div>
  );
}

// onVerify: 캡처한 얼굴 blob을 넘겨 신분증-얼굴 대조를 수행하고 matched 여부를 돌려준다.
export function WebcamCapture({
  onVerify,
}: {
  onVerify: (faceBlob: Blob) => Promise<boolean>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onVerifyRef = useRef(onVerify);
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkVisible, setCheckVisible] = useState(false);
  const [showDim, setShowDim] = useState(false);
  const faceBlobRef = useRef<Blob | null>(null);

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
          'Camera cannot be used. Please check camera permissions',
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
      if (!video || !canvas) {
        setErrorMessage('Failed to capture face. Please try again.');
        setPhase('error');
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      // toBlob는 비동기라, blob이 준비된 뒤에 verifying으로 넘어가야 대조에 넘길 게 있다.
      canvas.toBlob((blob) => {
        faceBlobRef.current = blob;
        setPhase('verifying');
      }, 'image/jpeg');
    }, ALIGN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  // 캡처한 얼굴로 실제 대조 요청. matched면 complete, 아니면 error로 재촬영 유도.
  useEffect(() => {
    if (phase !== 'verifying') return;

    let cancelled = false;
    const run = async () => {
      const blob = faceBlobRef.current;
      if (!blob) {
        if (!cancelled) {
          setErrorMessage('Failed to capture face. Please try again.');
          setPhase('error');
        }
        return;
      }
      try {
        const matched = await onVerifyRef.current(blob);
        if (cancelled) return;
        if (matched) {
          setPhase('complete');
        } else {
          setErrorMessage(
            'Face does not match the ID. Please try again with better lighting.',
          );
          setPhase('error');
        }
      } catch (error) {
        if (cancelled) return;
        // 409 등 백엔드 비즈니스 오류는 사용자에게 보여줘도 되는 message로 내려온다.
        setErrorMessage(getErrorMessage(error, 'Verification failed.'));
        setPhase('error');
      }
    };
    run();

    return () => {
      cancelled = true;
    };
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
          Please remove hats, glasses, and masks
        </p>
        <Image src={ImgFacialVerification} alt="" className="mt-5 size-82" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <ErrorDisplay
        message={errorMessage}
        onClick={() => {
          faceBlobRef.current = null;
          setErrorMessage('');
          setPhase('aligning');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* 안내 문구 */}
      <StatusPill>
        {phase === 'aligning' && 'Align your face within the frame'}
        {phase === 'verifying' && 'Verifying...'}
        {phase === 'complete' && 'ID verification complete'}
      </StatusPill>

      {/* 웹캠 섹션 */}
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
              'absolute left-1/2 top-1/2 flex size-23 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-success transition-all duration-300 ease-out',
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
          <span className="absolute left-1/2 top-1/2 size-50 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-success">
            {phase === 'verifying' && (
              <span className="absolute inset-0 animate-ping rounded-full border-2 border-success" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
