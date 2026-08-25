'use client';

// TODO: 파일 위치 변경 -> /providers
import { createContext, useContext, useEffect, useState } from 'react';

import { PROCTOR_DISABLED } from '@/lib/proctor/config';
import { getUserMedia } from '@/lib/utils/getUserMedia';

// 시험 화면(testing)에서 카메라 스트림을 한 번만 취득해 공유한다.
// 셀프뷰(ExamSessionHeader/WebcamMonitor)와 프레임 분석(proctor/WebcamMonitor)이
// 각자 getUserMedia 하던 걸 하나로 합쳐 카메라 중복 취득을 없앤다.
// 주의: 앱 전역 프로바이더가 아니라 **testing 레이아웃에서만 마운트**되는 라우트 스코프 프로바이더.
const CameraStreamContext = createContext<MediaStream | null>(null);

export const useCameraStream = () => useContext(CameraStreamContext);

export function CameraStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (PROCTOR_DISABLED) return;
    let cancelled = false;
    let acquired: MediaStream | null = null;

    getUserMedia({ video: true })
      .then((ms) => {
        if (cancelled) {
          ms.getTracks().forEach((t) => t.stop());
          return;
        }
        acquired = ms;
        setStream(ms);
      })
      .catch(() => {
        // 카메라 거부/실패 — 셀프뷰·분석 모두 스트림 없이 진행(각 컴포넌트가 처리).
      });

    return () => {
      cancelled = true;
      acquired?.getTracks().forEach((t) => t.stop());
      setStream(null);
    };
  }, []);

  return (
    <CameraStreamContext.Provider value={stream}>
      {children}
    </CameraStreamContext.Provider>
  );
}
