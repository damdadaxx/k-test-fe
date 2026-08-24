'use client';

import { useRef } from 'react';

import { useRouter } from 'next/navigation';

import { getErrorMessage } from '@/lib/api/client';
import { SECTIONS } from '@/lib/exam/sections';

import { useCurrentSession, useStartExamSession } from '@/hooks/exam/useExams';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import Header from '@/components/landing/Header';
import { Skeleton } from '@/components/ui/Skeleton';

// 회차 개념 제거 — 홈은 "진행중 세션 유무"만 보고 단일 버튼으로 응시/이어서.
export default function ExamsPage() {
  const router = useRouter();
  const { data: current, isLoading } = useCurrentSession();
  const startSession = useStartExamSession();
  const isSubmittingRef = useRef(false);

  // 시작/재개: POST /exam-sessions → verified면 시험으로, 아니면 본인인증부터.
  const handleStart = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startSession.mutate(undefined, {
      onSuccess: (data) => {
        if (data.verified) {
          router.push(
            `/${data.examSessionId}/testing/${SECTIONS[0].moduleId}/intro`,
          );
        } else {
          router.push(`/${data.examSessionId}/identity`);
        }
      },
      onSettled: () => {
        isSubmittingRef.current = false;
      },
    });
  };

  const hasCurrent = current?.status === 'INPROGRESS';

  return (
    <main>
      <Header />

      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24">
        <h1 className="text-title-lg text-primary">시험 응시</h1>
        <p className="text-body-sm mt-2 text-center text-icon-50">
          버튼을 누르면 본인인증 후 시험이 시작됩니다.
        </p>

        <div className="mt-10 w-full max-w-sm">
          {isLoading ? (
            <Skeleton className="h-14 w-full rounded-lg" />
          ) : (
            <ButtonPrimary
              width="full"
              onClick={handleStart}
              disabled={startSession.isPending}
            >
              {hasCurrent ? '이어서 풀기' : '응시하기'}
            </ButtonPrimary>
          )}

          {startSession.isError && (
            <p className="text-body-sm mt-3 text-center text-error">
              {getErrorMessage(
                startSession.error,
                '시험을 시작할 수 없습니다.',
              )}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
