'use client';

import { useRef } from 'react';

import { useRouter } from 'next/navigation';

import type { ExamListItem, SessionStatus } from '@/types/exam';

import { getErrorMessage } from '@/lib/api/client';

import { useApplyExam, useExams, useMyExams } from '@/hooks/exam/useExams';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import Header from '@/components/landing/Header';
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

// 정원 마감처럼 신청 시점에만 알 수 있는 사유를 빼면, 신청 가능 여부는
// applicationOpenAt/applicationCloseAt만 보고 클릭 전에 미리 판단할 수 있다.
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

type Action = 'apply' | 'continue' | null;

// statusMap: examId → sessionStatus(null=신청만 하고 미시작). has()가 false면 미신청.
// 신청 여부 + 세션 상태로 버튼 라벨/활성/동작을 결정한다.
function getButtonState(
  exam: ExamListItem,
  statusMap: Map<string, SessionStatus | null>,
): { label: string; disabled: boolean; action: Action } {
  const applied = statusMap.has(exam.id);
  const status = applied ? statusMap.get(exam.id) : undefined;

  if (status === 'SUBMITTED')
    return { label: '응시완료', disabled: true, action: null };
  if (status === 'EXPIRED')
    return { label: '시간초과', disabled: true, action: null };
  if (status === 'BLOCKED')
    return { label: '응시제한', disabled: true, action: null };
  if (status === 'INPROGRESS')
    return { label: '이어서 풀기', disabled: false, action: 'continue' };

  // 미신청 또는 신청만 하고 미시작(null): 신청 접수 기간 기준으로 판단.
  const { applicable, label } = getApplicationLabel(exam);
  return {
    label,
    disabled: !applicable,
    action: applied ? 'continue' : 'apply',
  };
}

export default function ExamsPage() {
  const router = useRouter();
  const { data: exams, isLoading } = useExams();
  const { data: myExams, isLoading: isMyLoading } = useMyExams();
  const applyExam = useApplyExam();
  // isPending은 mutate() 이후 리렌더가 돌아야 반영되므로, 그 사이 짧은 틈의 연속
  // 클릭을 ref로 즉시 막는다.
  const isSubmittingRef = useRef(false);

  const statusMap = new Map(
    (myExams ?? []).map((item) => [item.examId, item.sessionStatus] as const),
  );

  const availableExams = (exams ?? []).filter((exam) => exam.status === 'OPEN');

  const handleSelect = (examId: string, action: Action) => {
    // 이미 신청한 회차는 재신청 없이 바로 본인인증으로 진행.
    if (action === 'continue') {
      router.push(`/${examId}/identity`);
      return;
    }
    if (action !== 'apply') return;

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    applyExam.mutate(examId, {
      onSuccess: () => router.push(`/${examId}/identity`),
      onError: (error) => {
        // 목록 로드~클릭 사이 레이스로 이미 신청된 경우엔 그냥 진행한다.
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
          {(isLoading || isMyLoading) &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}

          {!isLoading && !isMyLoading && availableExams.length === 0 && (
            <p className="text-body-sm text-icon-50">
              오늘 응시 가능한 시험이 없습니다.
            </p>
          )}

          {applyErrorMessage && (
            <p className="text-body-sm text-red-500">{applyErrorMessage}</p>
          )}

          {!isLoading &&
            !isMyLoading &&
            availableExams.map((exam) => {
              const { label, disabled, action } = getButtonState(
                exam,
                statusMap,
              );

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
                  <ButtonPrimary
                    width={140}
                    onClick={() => handleSelect(exam.id, action)}
                    disabled={disabled || applyExam.isPending}
                  >
                    {label}
                  </ButtonPrimary>
                </div>
              );
            })}
        </div>
      </section>
    </main>
  );
}
