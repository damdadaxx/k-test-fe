'use client';

import { useBlockBackNavigation } from '@/hooks/exam/useBlockBackNavigation';

// 시험 세션(ready·testing·finish) 전역: 응시 중 뒤로가기 차단.
// 캘리브레이션(/ready) ~ 결과 조회(/finish)까지 페이지 이동은 버튼(replace)으로만.
export default function ExamSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useBlockBackNavigation();
  return <>{children}</>;
}
