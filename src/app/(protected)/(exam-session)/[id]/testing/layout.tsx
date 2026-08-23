'use client';

import { use } from 'react';

import { CameraStreamProvider } from '@/providers/CameraStreamProvider';

import { ProctorGuard } from '@/components/proctor/ProctorGuard';
import { WebcamMonitor } from '@/components/proctor/WebcamMonitor';

// 시험 진행(intro·문항) 화면 전역에 프록토링 마운트. 여기 [id] = examSessionId.
// ready(examId)·finish는 감싸지 않는다.
export default function TestingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: examSessionId } = use(params);

  return (
    // 카메라 스트림을 한 번만 취득해 셀프뷰·분석이 공유(중복 getUserMedia 제거).
    <CameraStreamProvider>
      <WebcamMonitor examSessionId={examSessionId} />
      <ProctorGuard examSessionId={examSessionId} />
      {children}
    </CameraStreamProvider>
  );
}
