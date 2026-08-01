'use client';

import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';

export function EarCapture({
  onCapture,
}: {
  onCapture: (base64: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      stream = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    });

    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg'));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-gray-600">
        귀가 잘 보이도록 카메라에 맞춰주세요 (이어폰 착용 여부 확인)
      </p>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full max-w-sm rounded-md"
      />
      <canvas ref={canvasRef} className="hidden" />
      <Button onClick={handleCapture}>귀 촬영하기</Button>
    </div>
  );
}
