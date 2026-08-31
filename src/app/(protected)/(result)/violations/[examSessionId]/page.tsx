'use client';

import { use } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getViolationSummary } from '@/lib/api/result';
import { cn } from '@/lib/utils/cn';

import { PageHeader } from '@/components/common/PageHeader';
import { ViolationRow } from '@/components/result/ViolationRow';
import { Skeleton } from '@/components/ui/Skeleton';

// eventType별로 묶어 횟수를 합산한다. 백엔드가 같은 eventType을 severity별로 쪼개
// count와 함께 여러 건으로 주므로, 건수(1)가 아니라 count를 더해야 한다.
function groupByEventType(violations: { eventType: string; count: number }[]) {
  const counts = new Map<string, number>();
  for (const { eventType, count } of violations) {
    counts.set(eventType, (counts.get(eventType) ?? 0) + count);
  }
  return [...counts.entries()];
}

export default function ViolationsPage({
  params,
}: {
  params: Promise<{ examSessionId: string }>;
}) {
  const { examSessionId } = use(params);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['violation-summary', examSessionId],
    queryFn: () => getViolationSummary(examSessionId),
    retry: false,
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center gap-5 bg-page-bg">
        <PageHeader />
        <div className="flex w-full max-w-250 flex-col gap-4 px-6 pt-20">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page-bg px-6">
        <p className="text-body-lg text-icon-70">
          부정행위 내역을 불러올 수 없습니다.
        </p>
      </main>
    );
  }

  const grouped = groupByEventType(data.violations);

  return (
    <main
      className={cn(
        'flex min-h-screen flex-col items-center gap-5 bg-page-bg px-6',
        'tablet:px-0',
      )}
    >
      <PageHeader />

      {/* 증명서 형태 카드 (Figma 40001144:10743) — 고정 헤더 높이(h-20)만큼 상단 여백 */}
      <div className="mt-25 mb-25 flex w-full max-w-250 flex-col gap-8 rounded-16 bg-white px-16 py-14">
        <p className="text-title-md tracking-[-0.48px] text-icon-90">
          {data.candidateName}
        </p>

        <div className="flex w-full flex-col gap-3">
          <p className="text-title-sm text-icon-90">Test Voided</p>
          <p className="text-body-md text-icon-90">
            This test could not be scored. The following activity was detected
            during your session and violates the exam rules. As a result, this
            attempt has been voided and no grade is issued.
          </p>

          <div className="flex w-full flex-col gap-3 rounded-xl border border-neutral-30 p-5">
            {grouped.length > 0 ? (
              grouped.map(([eventType, count]) => (
                <ViolationRow
                  key={eventType}
                  eventType={eventType}
                  count={count}
                />
              ))
            ) : (
              <p className="text-body-sm text-icon-50">
                No violation details available.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
