'use client';

import { useRouter } from 'next/navigation';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';

// 임시 퍼블리싱: 문항별 답안은 이미 각자 /answer로 제출 완료된 상태라
// 별도의 "시험 최종 제출" API 없이 완료 화면만 보여준다.
export default function FinishPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-title-lg">제출 완료</h1>
      <p className="text-body-md text-gray-600 mb-[32px]">
        모든 문항의 답안이 제출되었습니다. 수고하셨습니다.
      </p>
      <ButtonPrimary width={120} onClick={() => router.push('/')}>
        홈으로
      </ButtonPrimary>
    </main>
  );
}
