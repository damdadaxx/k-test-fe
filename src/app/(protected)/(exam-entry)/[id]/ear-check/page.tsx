'use client';

import { use, useState } from 'react';

import { useRouter } from 'next/navigation';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { EarCapture } from '@/components/identity/EarCapture';
import StepHeader from '@/components/identity/StepHeader';

export default function EarCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = use(params);
  const router = useRouter();
  const [earCaptured, setEarCaptured] = useState(false);

  // ponytail: 인증 API 연동 전, 플로우 확인용으로 촬영 완료 시 Next 버튼만 활성화.
  // API 붙이면 earDetection.mutate → startExamSession.mutate로 되돌리고,
  // 실제 발급된 session id로 이동할 것 (지금은 examId를 그대로 씀).
  const handleEarCapture = () => {
    setEarCaptured(true);
  };

  const handleNext = () => {
    router.push(`/6/testing/1/intro`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StepHeader step={earCaptured ? 3 : 2} />

      <main className="mx-auto flex flex-1 flex-col items-center gap-8 px-6 pt-10">
        <EarCapture onCapture={handleEarCapture} />
      </main>

      <NextStepButton
        onClick={handleNext}
        disabled={!earCaptured}
        label="Next"
      />
    </div>
  );
}
