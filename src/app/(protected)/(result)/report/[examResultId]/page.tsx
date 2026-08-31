'use client';

import { use } from 'react';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import ImgLogo from '@/app/assets/images/img_logo.svg';

import type { QuestionPart, ReportDomainScore, ReportTask } from '@/types/exam';

import { getReport } from '@/lib/api/result';
import { SECTIONS } from '@/lib/exam/sections';
import { cn } from '@/lib/utils/cn';

import { PageHeader } from '@/components/common/PageHeader';
import { GradeBadge } from '@/components/result/GradeBadge';
import { ScoreBar } from '@/components/result/ScoreBar';
import { TaskFeedbackCard } from '@/components/result/TaskFeedbackCard';
import { Skeleton } from '@/components/ui/Skeleton';

// 영역 키 → 표시 라벨(리포트는 영문).
const AREA_LABEL: Record<string, string> = {
  content_task: 'Task Completion',
  language_use: 'Language Use',
  delivery: 'Delivery & Pronunciation',
};

// 영역별 점수 바 진하기(피그마 스펙 — 영역마다 톤이 다름).
const AREA_SHADE: Record<string, string> = {
  content_task: 'bg-icon-80',
  language_use: 'bg-icon-70',
  delivery: 'bg-icon-30',
};

// 피그마 스펙: 3개 영역 행은 점수와 무관하게 항상 고정 노출(전부 0점이어도 빈 바로 표시).
// 채점 결과에 특정 영역이 아예 안 왔을 때(예: 전부 스킵된 응시) 그 행이 통째로 사라지는 걸 막는다.
function withFixedAreas(domainScores: ReportDomainScore[]) {
  return Object.keys(AREA_LABEL).map(
    (area) => domainScores.find((d) => d.area === area) ?? { area, score: 0 },
  );
}

// part → 섹션 카드 제목. SECTIONS(lib/exam/sections)와 같은 순서로 그룹핑해 번호를 매긴다.
const PART_LABEL: Record<QuestionPart, string> = {
  SITUATION_DESCRIPTION: 'Speak About the Photo',
  READ_AND_EXPLAIN: 'Read and Explain',
  ANSWER_QUESTION: 'Answer the Question',
};

// tasks를 SECTIONS 순서(상황묘사→읽고설명→질문답변)로 그룹핑해 "SECTION n-m" 라벨을 붙인다.
function withSectionLabels(tasks: ReportTask[]) {
  const counters: Partial<Record<QuestionPart, number>> = {};
  return [...tasks]
    .sort(
      (a, b) =>
        SECTIONS.findIndex((s) => s.part === a.part) -
        SECTIONS.findIndex((s) => s.part === b.part),
    )
    .map((task) => {
      const sectionIndex = SECTIONS.findIndex((s) => s.part === task.part);
      const itemIndex = (counters[task.part] = (counters[task.part] ?? 0) + 1);
      return {
        task,
        sectionLabel: `SECTION ${sectionIndex + 1}-${itemIndex}`,
        partLabel: PART_LABEL[task.part],
      };
    });
}

function DomainScoreRow({ domain }: { domain: ReportDomainScore }) {
  const total = 5;
  const filled = Math.round((domain.score / 100) * total);
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between whitespace-nowrap text-body-sm text-primary">
        <p>{AREA_LABEL[domain.area] ?? domain.area}</p>
        <p>
          {filled} / {total}
        </p>
      </div>
      <ScoreBar
        score={domain.score}
        filledClassName={AREA_SHADE[domain.area] ?? 'bg-icon-80'}
      />
    </div>
  );
}

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
      <main className="flex min-h-screen flex-col items-center gap-5 bg-page-bg">
        <PageHeader />
        <div className="flex w-full max-w-250 flex-col gap-4 px-6 pt-20">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page-bg px-6">
        <p className="text-body-lg text-icon-70">
          리포트를 불러올 수 없습니다.
        </p>
      </main>
    );
  }

  const sectioned = withSectionLabels(data.tasks);

  return (
    <main
      className={cn(
        'flex min-h-screen flex-col items-center gap-5 bg-page-bg px-6',
        'tablet:px-0',
      )}
    >
      <PageHeader />

      {/* 증명서 형태 리포트 카드 — 고정 헤더 높이(h-20)만큼 상단 여백 */}
      <div className="mt-25 mb-25 flex w-full max-w-250 flex-col gap-8 rounded-16 bg-white px-16 py-14">
        <div className="flex w-full items-center justify-between">
          <Image
            src={ImgLogo}
            width={112}
            height={24}
            alt="K-TEST Logo"
            priority
          />
          <p className="text-body-sm text-icon-90">OFFICIAL REPORT</p>
        </div>

        <hr className="w-full border-t border-neutral-30" />

        <p className="text-title-md tracking-[-0.48px] text-icon-90">
          {data.candidateName}
        </p>

        {/* 종합 점수 */}
        <div className="flex w-full flex-col gap-8">
          <p className="w-full text-title-sm text-icon-90">Overall Score</p>
          <div className="flex w-full items-center justify-between">
            <div className="flex w-50 shrink-0 items-center justify-center">
              <GradeBadge grade={data.finalGrade} />
            </div>
            <div className="flex w-full max-w-[635px] flex-col gap-5">
              {withFixedAreas(data.domainScores).map((d) => (
                <DomainScoreRow key={d.area} domain={d} />
              ))}
            </div>
          </div>
        </div>

        {/* 문항별 결과 */}
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-1">
            <p className="text-title-sm text-icon-90">Task-by-Task Results</p>
            <p className="text-body-sm text-icon-50">
              Each task has required points. This shows which ones your response
              covered.
            </p>
          </div>
          <div className="flex w-full flex-col gap-4">
            {sectioned.map(({ task, sectionLabel, partLabel }) => (
              <TaskFeedbackCard
                key={task.questionId}
                sectionLabel={sectionLabel}
                partLabel={partLabel}
                task={task}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
