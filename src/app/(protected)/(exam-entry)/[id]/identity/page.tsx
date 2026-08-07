'use client';

import { use, useState } from 'react';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils/cn';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { IdCardUpload } from '@/components/identity/IdCardUpload';
import StepHeader from '@/components/identity/StepHeader';

export default function IdentityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = use(params);
  const router = useRouter();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idConfirmed, setIdConfirmed] = useState(false);

  // ponytail: 인증 API 연동 전, 플로우 확인용으로 업로드 시 바로 Done 처리.
  // API 붙이면 uploadIdCard.mutate로 되돌릴 것.
  const handleIdUpload = (file: File) => {
    setIdFile(file);
    setIdConfirmed(true);
  };

  const handleNext = () => {
    router.push(`/${examId}/face-check`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StepHeader step={0} />

      <main className="mx-auto flex flex-1 flex-col items-center gap-8 px-6 pt-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-title-lg text-icon-90">
            Upload a photo of your ID
          </h1>
          <p className="text-title-md font-normal text-icon-50">
            Please upload your passport, alien registration card, or residence
            card.
          </p>
        </div>
        <IdCardUpload onUpload={handleIdUpload} />
        {idFile && (
          <div
            className={cn(
              'flex h-13 w-full max-w-122 items-center justify-center gap-2 rounded-lg px-5 py-4 text-lg',
              'bg-[#e6ffe2] text-[#3adb21]',
            )}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10l4 4 8-8"
                stroke="#3adb21"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Done
          </div>
        )}
      </main>

      <NextStepButton
        onClick={handleNext}
        disabled={!idConfirmed}
        label="Next"
      />
    </div>
  );
}
