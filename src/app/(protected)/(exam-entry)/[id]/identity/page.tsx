'use client';

import { use } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import IcCheckGreen from '@/app/assets/icons/icon_check_green.svg';

import { getErrorMessage } from '@/lib/api/client';

import { useIdentityVerify } from '@/hooks/identity/useIdentityVerify';

import { useSessionStore } from '@/store/sessionStore';

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
  const { uploadIdCard } = useIdentityVerify(examId);
  const idCardPath = useSessionStore((state) => state.idCardPath);

  // 파일 선택 시 upload-url 발급 → Storage 직접 업로드. 성공하면 스토어에 path 저장.
  const handleIdUpload = (file: File) => {
    uploadIdCard.mutate(file);
  };

  const handleNext = () => {
    router.push(`/${examId}/face-check`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 프로그레스 바 */}
      <StepHeader step={0} />

      <main className="mx-auto flex flex-1 flex-col items-center px-6 pt-10">
        {/* 헤더 */}
        <header className="flex flex-col items-center gap-3 text-center mb-10">
          <h1 className="text-title-lg text-icon-90">
            Upload a photo of your ID
          </h1>
          <p className="text-title-md font-normal text-icon-50">
            Please upload your passport, alien
            <br /> registration card, or residence card.
          </p>
        </header>

        {/* ID 카드 업로더 */}
        <IdCardUpload onUpload={handleIdUpload} />

        {/* 업로드 중 텍스트 */}
        {uploadIdCard.isPending && (
          <div className="flex h-13 w-full max-w-122 items-center justify-center gap-2 rounded-lg bg-neutral-20 px-5 py-4 text-lg text-icon-90 mt-7">
            Uploading...
          </div>
        )}

        {/* 완료 텍스트 */}
        {idCardPath && !uploadIdCard.isPending && (
          <div className="flex h-13 w-full max-w-122 items-center justify-center gap-2 rounded-lg px-5 py-4 text-lg mt-7 bg-success-10 text-success">
            <Image src={IcCheckGreen} sizes="20" alt="" />
            Done
          </div>
        )}

        {/* 업로드 실패 에러 메세지 */}
        {uploadIdCard.isError && (
          <p className="text-body-sm text-error mt-5">
            {getErrorMessage(uploadIdCard.error) ||
              '업로드에 실패했습니다. 다시 시도해주세요.'}
          </p>
        )}
      </main>

      {/* 버튼 푸터 섹션 */}
      <footer>
        <NextStepButton
          onClick={handleNext}
          disabled={!idCardPath || uploadIdCard.isPending}
          label="Next"
        />
      </footer>
    </div>
  );
}
