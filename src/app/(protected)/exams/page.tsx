'use client';

import { useRef } from 'react';

import { useRouter } from 'next/navigation';

import type { ExamListItem } from '@/types/exam';

import { getErrorMessage } from '@/lib/api/client';

import { useApplyExam, useExams } from '@/hooks/exam/useExams';

import Header from '@/components/landing/Header';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 정원 마감처럼 신청 시점에만 알 수 있는 사유(applicantCount는 일반 유저에게
// 안 내려옴)를 빼면, 신청 가능 여부는 applicationOpenAt/applicationCloseAt만
// 보고 클릭 전에 미리 판단할 수 있다.
function getApplicationLabel(exam: ExamListItem): {
  applicable: boolean;
  label: string;
} {
  const now = Date.now();
  const opensAt = new Date(exam.applicationOpenAt).getTime();
  const closesAt = new Date(exam.applicationCloseAt).getTime();

  if (now < opensAt) return { applicable: false, label: '오픈 예정' };
  if (now > closesAt) return { applicable: false, label: '신청 마감' };
  return { applicable: true, label: '응시하기' };
}

export default function ExamsPage() {
  const router = useRouter();
  const { data: exams, isLoading } = useExams();
  const applyExam = useApplyExam();
  // isPending은 mutate() 이후 리렌더가 돌아야 반영되므로, 그 사이의 아주 짧은
  // 틈에 연속 클릭이 들어오면 두 번 다 통과할 수 있음 — ref로 즉시(렌더 대기
  // 없이) 재진입을 막는다.
  const isSubmittingRef = useRef(false);

  const availableExams = (exams ?? []).filter((exam) => exam.status === 'OPEN');

  const handleApply = (examId: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    applyExam.mutate(examId, {
      onSuccess: () => router.push(`/${examId}/identity`),
      onError: (error) => {
        // 정원 마감처럼 클릭 전엔 알 수 없던 사유로 막힌 경우만 여기로 옴.
        // "이미 신청함"이면 안전하게 진행, 그 외엔 아래 에러 메시지로 노출.
        if (getErrorMessage(error).includes('이미')) {
          router.push(`/${examId}/identity`);
        }
      },
      onSettled: () => {
        isSubmittingRef.current = false;
      },
    });
  };

  const applyErrorMessage =
    applyExam.isError && !getErrorMessage(applyExam.error).includes('이미')
      ? getErrorMessage(applyExam.error) || '신청에 실패했습니다.'
      : null;

  return (
    <main>
      <Header />

      <section className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-title-lg text-primary">오늘 응시 가능한 시험</h1>
        <p className="text-body-sm mt-1 text-icon-50">
          아래 목록에서 시험을 선택하면 본인인증부터 시작합니다.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}

          {!isLoading && availableExams.length === 0 && (
            <p className="text-body-sm text-icon-50">
              오늘 응시 가능한 시험이 없습니다.
            </p>
          )}

          {applyErrorMessage && (
            <p className="text-body-sm text-red-500">{applyErrorMessage}</p>
          )}

          {availableExams.map((exam) => {
            const { applicable, label } = getApplicationLabel(exam);

            return (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-lg border border-neutral-30 bg-white px-5 py-4"
              >
                <div>
                  <p className="text-body-md font-semibold text-primary">
                    {exam.roundName}
                  </p>
                  <p className="text-body-sm text-icon-50">
                    {formatDateTime(exam.openAt)} ~{' '}
                    {formatDateTime(exam.closeAt)}
                  </p>
                </div>
                <Button
                  onClick={() => handleApply(exam.id)}
                  disabled={!applicable || applyExam.isPending}
                >
                  {label}
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
