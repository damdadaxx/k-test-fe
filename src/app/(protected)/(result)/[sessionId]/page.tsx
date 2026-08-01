'use client';

import { use } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getResult } from '@/lib/api/result';

import { Skeleton } from '@/components/ui/Skeleton';

export default function ResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { data, isLoading } = useQuery({
    queryKey: ['result', sessionId],
    queryFn: () => getResult(sessionId),
  });

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-32" />
        <ul className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-10" />
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-xl font-semibold">시험 결과</h1>
      <p className="text-2xl font-bold">{data?.totalScore ?? '-'}점</p>
      <ul className="space-y-2">
        {data?.moduleScores.map((module) => (
          <li key={module.moduleId} className="flex justify-between text-sm">
            <span>{module.title}</span>
            <span>{module.score}점</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
