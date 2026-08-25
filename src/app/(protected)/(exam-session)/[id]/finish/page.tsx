'use client';

import { use, useEffect, useRef } from 'react';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import IcCheckedCircleLg from '@/app/assets/icons/icon_check_green_lg.svg';

import { getMyExams } from '@/lib/api/exam';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { PageHeader } from '@/components/common/PageHeader';

// 채점은 보통 즉시 끝나지만 혹시 지연될 수 있어 examResultId가 나올 때까지 짧게 폴링.
// 최대 대기 후에도 안 나오면 폴링만 멈추고(계속 "View Report" 비활성) 새로고침으로 재확인.
const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 60000;

export default function FinishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examSessionId } = use(params);
  // 폴링 시작 시각(마운트 시 1회) — 최대 대기시간 판단 기준. ref 초기화는 effect에서(렌더는 순수해야 함).
  const startedAtRef = useRef<number | null>(null);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);
  const { data: myExams } = useQuery({
    queryKey: ['my-exams'],
    queryFn: getMyExams,
    refetchInterval: (query) => {
      const ready = query.state.data?.some(
        (e) => e.examSessionId === examSessionId && e.examResultId,
      );
      if (ready) return false;
      const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
      return elapsed < MAX_WAIT_MS ? POLL_INTERVAL_MS : false;
    },
  });
  const examResultId =
    myExams?.find((e) => e.examSessionId === examSessionId)?.examResultId ??
    null;

  return (
    <div className="flex min-h-screen flex-col bg-page-bg">
      <PageHeader />

      <main className="flex flex-1 items-center justify-center px-6 pt-20 pb-14">
        {/* Success Card (Figma node 40000645:22475) */}
        <div className="flex w-[680px] max-w-full flex-col items-center rounded-[24px] bg-white p-12 drop-shadow-[0px_8px_12px_rgba(0,0,0,0.03)]">
          {/* 성공 아이콘 배지 */}
          <Image src={IcCheckedCircleLg} width="60" height="60" alt="" />

          {/* 완료 안내 */}
          <p className="pb-3 pt-6 text-title-md tracking-[-0.48px] text-icon-90">
            You&rsquo;re all done!
          </p>

          <p className="max-w-115 pb-8 text-center text-body-md tracking-[-0.16px] text-icon-70">
            Once the report is generated, we will send an announcement and link
            to your registered email. <br />
            You can also check the results in My Reports.
          </p>

          {examResultId ? (
            <ButtonPrimary
              width={200}
              as="link"
              href={`/report/${examResultId}`}
            >
              View Report
            </ButtonPrimary>
          ) : (
            <ButtonPrimary width={200} disabled>
              Scoring...
            </ButtonPrimary>
          )}
        </div>
      </main>
    </div>
  );
}
