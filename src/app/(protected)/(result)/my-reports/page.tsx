'use client';

import type { MyExamItem } from '@/types/exam';

import { isChromiumBrowser } from '@/lib/utils/browserSupport';
import { cn } from '@/lib/utils/cn';

import { useModal } from '@/providers/ModalProvider';

import { useMyExams, useResumeExamSession } from '@/hooks/exam/useExams';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalBase } from '@/components/common/Modal/ModalBase';
import { PageHeader } from '@/components/common/PageHeader';
import { GradeBadge } from '@/components/result/GradeBadge';
import { Skeleton } from '@/components/ui/Skeleton';

// 2025.08.15 형태(피그마 스펙).
function formatDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

// Grade 칸: 채점 완료면 배지, 실격/차단/만료면 상태 텍스트, 그 외(진행중/채점중)엔 비움.
function GradeCell({ item }: { item: MyExamItem }) {
  if (item.examResultId && item.finalGrade) {
    return <GradeBadge grade={item.finalGrade} size={40} />;
  }
  if (item.sessionStatus === 'DISQUALIFIED') {
    return <p className="text-body-md font-bold text-icon-90">Disqualified</p>;
  }
  if (item.sessionStatus === 'BLOCKED') {
    return <p className="text-body-md font-bold text-icon-90">Blocked</p>;
  }
  if (item.sessionStatus === 'EXPIRED') {
    return <p className="text-body-md font-bold text-icon-90">Expired</p>;
  }
  return null;
}

// Report 칸: 리포트 준비되면 View Report, 진행중이면 Resume Test(useResumeExamSession으로
// 여기서 바로 재개 — 랜딩 경유 안 함), 제출됐지만 채점 전이면 Scoring... 비활성, 실격이면
// View Detail(채점 자체가 없어 examResultId는 영구 null이라 대신 violations 상세로),
// 그 외(차단/만료)엔 실제로 볼 게 없어서 비움.
function ReportCell({ item }: { item: MyExamItem }) {
  const { openModal, closeModal } = useModal();
  const { resume, isPending } = useResumeExamSession();

  // 랜딩 TakeTestButton과 동일한 이유(듀얼모니터 감지가 Chromium 전용 API 의존)로
  // 재개도 Chromium 계열에서만 허용.
  const handleResume = () => {
    if (!isChromiumBrowser()) {
      openModal(
        <ModalBase
          onClose={closeModal}
          className="flex w-149.5 max-w-full flex-col items-center gap-7 text-center"
        >
          <p className="text-title-lg tracking-[-0.64px] text-icon-90">
            Unsupported Browser
          </p>
          <p className="text-body-md text-icon-90">
            This test only works on{' '}
            <span className="font-bold">
              Chrome, Edge, Brave, Opera, or Vivaldi.
            </span>{' '}
            Please switch to one of these browsers to continue.
          </p>
          <ButtonPrimary width={180} onClick={closeModal}>
            Back
          </ButtonPrimary>
        </ModalBase>,
      );
      return;
    }
    resume((message) => {
      openModal(
        <ModalBase
          onClose={closeModal}
          className="flex w-90 flex-col items-center gap-6 text-center"
        >
          <p className="text-body-lg text-primary">{message}</p>
          <ButtonPrimary width={140} onClick={closeModal}>
            Confirm
          </ButtonPrimary>
        </ModalBase>,
      );
    });
  };

  if (item.examResultId) {
    return (
      <ButtonPrimary
        variant="line"
        size="sm"
        width={140}
        as="link"
        href={`/report/${item.examResultId}`}
      >
        View Report
      </ButtonPrimary>
    );
  }
  if (item.sessionStatus === 'INPROGRESS') {
    return (
      <ButtonPrimary
        size="sm"
        width={140}
        onClick={handleResume}
        disabled={isPending}
      >
        {isPending ? 'Resuming...' : 'Resume Test'}
      </ButtonPrimary>
    );
  }
  if (item.sessionStatus === 'SUBMITTED') {
    return (
      <ButtonPrimary variant="line" size="sm" width={140} disabled>
        Scoring...
      </ButtonPrimary>
    );
  }
  if (item.sessionStatus === 'DISQUALIFIED') {
    return (
      <ButtonPrimary
        variant="line"
        size="sm"
        width={140}
        as="link"
        href={`/violations/${item.examSessionId}`}
      >
        View Detail
      </ButtonPrimary>
    );
  }
  return null;
}

// 시험 종류는 실제로 하나뿐이라 평소엔 고정 문구, 실격 행만 피그마 샘플대로 사유를 보여준다.
function testTypeLabel(item: MyExamItem) {
  if (item.sessionStatus === 'DISQUALIFIED') return 'cheat on the test';
  return 'K-TEST Korean Proficiency';
}

function ExamRow({ item, isLast }: { item: MyExamItem; isLast: boolean }) {
  return (
    <div
      className={`flex w-full items-center min-h-[88px] gap-5 px-8 py-5 ${isLast ? '' : 'border-b border-neutral-30'}`}
    >
      <p className="w-37.5 shrink-0 text-body-md text-icon-50">
        {formatDate(item.startedAt)}
      </p>
      <p className="flex-1 min-w-0 text-body-md font-bold text-icon-90">
        {testTypeLabel(item)}
      </p>
      <div className="flex w-30 shrink-0 items-center justify-center">
        <GradeCell item={item} />
      </div>
      <div className="flex w-37.5 shrink-0 items-center justify-end">
        <ReportCell item={item} />
      </div>
    </div>
  );
}

export default function MyReportsPage() {
  const { data, isLoading, isError } = useMyExams();

  return (
    <div className="flex min-h-screen flex-col items-center bg-page-bg">
      <PageHeader />

      <main className="flex w-full pt-32 pb-20">
        <div
          className={cn(
            'max-w-[1200px] flex w-full flex-col items-start m-auto gap-4 px-6',
            'desktop:px-0',
          )}
        >
          <p className="text-title-md tracking-[-0.48px] text-icon-90">
            Test History
          </p>

          <div className="flex w-full flex-col overflow-hidden rounded-8 border border-neutral-30 bg-white">
            <div className="flex w-full items-center gap-5 border-b border-neutral-30 bg-[#f9fafb] px-8 py-4.5 text-body-md font-bold text-icon-50">
              <p className="w-37.5 shrink-0">Date</p>
              <p className="flex-1 min-w-0">Test Type</p>
              <p className="w-30 shrink-0 text-center">Grade</p>
              <p className="w-37.5 shrink-0 text-right">Report</p>
            </div>

            {isLoading && (
              <div className="flex flex-col gap-2 p-8">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            )}

            {isError && (
              <p className="p-8 text-body-md text-icon-70">
                Failed to load your test history.
              </p>
            )}

            {data && data.length === 0 && (
              <p className="p-8 text-body-md text-icon-70">
                No tests taken yet.
              </p>
            )}

            {data?.map((item, i) => (
              <ExamRow
                key={item.examSessionId}
                item={item}
                isLast={i === data.length - 1}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
