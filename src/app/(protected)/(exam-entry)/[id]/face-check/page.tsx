'use client';

import { use, useState } from 'react';

import { useRouter } from 'next/navigation';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import StepHeader from '@/components/identity/StepHeader';
import { WebcamCapture } from '@/components/identity/WebcamCapture';

export default function FaceCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = use(params);
  const router = useRouter();
  const [faceCaptured, setFaceCaptured] = useState(false);

  // ponytail: 인증 API 연동 전, 플로우 확인용으로 촬영 완료 시 바로 다음 단계로 넘김.
  // API 붙이면 verifyFace.mutate로 되돌릴 것.
  const handleFaceCapture = () => {
    setFaceCaptured(true);
  };

  const handleNext = () => {
    router.push(`/${examId}/ear-check`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StepHeader step={1} />

      <main className="mx-auto flex flex-1 flex-col items-center gap-8 px-6 pt-10">
        <WebcamCapture onCapture={handleFaceCapture} />
      </main>

      <NextStepButton
        onClick={handleNext}
        disabled={!faceCaptured}
        label="Next"
      />
    </div>
  );
}
