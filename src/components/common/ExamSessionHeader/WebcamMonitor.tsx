'use client';

import { useEffect, useRef } from 'react';

import { useProctorStore } from '@/store/proctorStore';

export function WebcamMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const setWebcamActive = useProctorStore((state) => state.setWebcamActive);

  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setWebcamActive(true);
      })
      .catch(() => setWebcamActive(false));

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      setWebcamActive(false);
    };
  }, [setWebcamActive]);

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
