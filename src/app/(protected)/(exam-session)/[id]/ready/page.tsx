'use client';

import { use } from 'react';

import { useRouter } from 'next/navigation';

import { SECTIONS } from '@/lib/exam/sections';

import { Button } from '@/components/ui/Button';

export default function ReadyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-xl font-semibold">시험 준비가 완료되었습니다</h1>
      <p className="text-sm text-gray-600">
        시작 버튼을 누르면 시험이 시작됩니다.
      </p>
      <Button
        onClick={() =>
          router.push(`/${sessionId}/testing/${SECTIONS[0].moduleId}/intro`)
        }
      >
        시험 시작
      </Button>
    </main>
  );
}
