'use client';

import { use } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getReport } from '@/lib/api/result';

import { Skeleton } from '@/components/ui/Skeleton';

// 영역 키 → 표시 라벨.
const AREA_LABEL: Record<string, string> = {
  content_task: '내용 및 과제 수행',
  language_use: '언어 사용',
  delivery: '전달력',
};

export default function ResultPage({
  params,
}: {
  params: Promise<{ examResultId: string }>;
}) {
  const { examResultId } = use(params);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['report', examResultId],
    queryFn: () => getReport(examResultId),
    retry: false,
  });

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-14">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
        <p className="text-body-lg text-icon-70">
          리포트를 불러올 수 없습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-14">
      {/* 헤더: 등급 + 회차/응시자 */}
      <header className="flex flex-col gap-2">
        <p className="text-body-sm text-icon-70">
          {data.roundName} · {data.candidateName}
        </p>
        <div className="flex items-end gap-3">
          <span className="text-title-lg text-icon-90">{data.finalGrade}</span>
          <span className="text-body-sm text-icon-50">
            상위 {data.percentile}% (참고용)
          </span>
        </div>
      </header>

      {/* 영역별 점수 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-title-sm text-icon-90">영역별 점수</h2>
        <ul className="flex flex-col gap-2">
          {data.domainScores.map((d) => (
            <li key={d.area} className="flex items-center gap-3">
              <span className="w-32 text-body-md text-icon-70">
                {AREA_LABEL[d.area] ?? d.area}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-20">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${d.score}%` }}
                />
              </div>
              <span className="w-12 text-right text-body-md text-icon-90">
                {d.score}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 문항별 결과 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-title-sm text-icon-90">문항별 결과</h2>
        <ul className="flex flex-col gap-4">
          {data.tasks.map((t, i) => (
            <li
              key={t.questionId}
              className="flex flex-col gap-2 rounded-8 border border-neutral-30 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-body-md text-icon-90">문항 {i + 1}</span>
                {t.skipped && (
                  <span className="text-body-sm text-icon-50">건너뜀</span>
                )}
              </div>
              {t.response && (
                <p className="text-body-sm text-icon-70">{t.response}</p>
              )}
              {t.requiredPoints && (
                <ul className="flex flex-col gap-1">
                  {t.requiredPoints.map((p, j) => (
                    <li key={j} className="text-body-sm text-icon-70">
                      {p.met ? '✓' : '✗'} {p.description}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* 부정행위 로그 */}
      {data.violations.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-title-sm text-icon-90">모니터링 기록</h2>
          <ul className="flex flex-col gap-1">
            {data.violations.map((v, i) => (
              <li
                key={i}
                className="flex justify-between text-body-sm text-icon-70"
              >
                <span>
                  {v.eventType} ({v.severity})
                </span>
                <span>{v.count}회</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
