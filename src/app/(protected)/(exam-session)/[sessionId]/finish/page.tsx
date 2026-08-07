'use client';

import { use, useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { submitTest } from '@/lib/api/exam';

export default function FinishPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const submit = useMutation({
    mutationFn: () => submitTest(sessionId),
    onSuccess: () => router.push(`/${sessionId}`),
  });

  useEffect(() => {
    submit.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-xl font-semibold">시험이 제출되고 있습니다</h1>
      <p className="text-sm text-gray-600">잠시만 기다려주세요.</p>
    </main>
  );
}
