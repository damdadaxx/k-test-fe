'use client';

import { use, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useIdCardUpload, useFaceVerify } from '@/hooks/useIdentityVerify';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { IdCardUpload } from '@/components/identity/IdCardUpload';
import { WebcamCapture } from '@/components/identity/WebcamCapture';

export default function IdentityPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<'id' | 'face'>('id');

  const idCardUpload = useIdCardUpload();
  const faceVerify = useFaceVerify();

  const handleIdUpload = (base64: string) => {
    idCardUpload.mutate(
      { sessionId, image: base64 },
      { onSuccess: () => setStep('face') },
    );
  };

  const handleFaceCapture = (base64: string) => {
    faceVerify.mutate(
      { sessionId, faceImage: base64 },
      { onSuccess: () => router.push(`/${sessionId}/ear-check`) },
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-xl font-semibold">본인 인증</h1>
      {step === 'id' ? (
        <IdCardUpload onUpload={handleIdUpload} />
      ) : (
        <WebcamCapture onCapture={handleFaceCapture} />
      )}
      <NextStepButton onClick={() => {}} disabled />
    </main>
  );
}
