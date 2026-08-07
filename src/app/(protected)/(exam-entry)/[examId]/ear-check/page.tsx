'use client';

import { use } from 'react';

import { useRouter } from 'next/navigation';

import { useEarDetection } from '@/hooks/useEarDetection';

import { EarCapture } from '@/components/identity/EarCapture';

export default function EarCheckPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const earDetection = useEarDetection();

  const handleCapture = (base64: string) => {
    earDetection.mutate(
      { sessionId, earImage: base64 },
      { onSuccess: () => router.push(`/${sessionId}/ready`) },
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-xl font-semibold">귀 촬영 (이어폰 탐지)</h1>
      <EarCapture onCapture={handleCapture} />
    </main>
  );
}
