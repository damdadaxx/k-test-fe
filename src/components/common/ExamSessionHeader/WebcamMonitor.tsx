'use client';

import { useEffect, useRef } from 'react';

import { useCameraStream } from '@/components/proctor/CameraStreamProvider';

// 헤더 실시간 셀프뷰. 카메라는 CameraStreamProvider가 취득한 공유 스트림을 사용
// (프레임 분석 WebcamMonitor와 하나의 getUserMedia를 공유).
export function WebcamMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = useCameraStream();

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="size-full object-cover"
    />
  );
}
