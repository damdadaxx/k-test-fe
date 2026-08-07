import { SECTIONS } from '@/lib/exam/sections';

export function SectionCard({
  sectionIndex,
  title,
  questionCount,
  answerSeconds,
}: {
  sectionIndex: number;
  title: string;
  questionCount: number;
  answerSeconds: number;
}) {
  const minutes = Math.floor(answerSeconds / 60);
  const seconds = answerSeconds % 60;
  const timeLimit = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 rounded-[20px] bg-white p-15 shadow-sm">
      <div className="rounded-full bg-primary px-(--space-16) py-(--space-12) text-badge-sm text-white">
        SECTION {sectionIndex + 1}
      </div>

      <div className="flex items-start gap-1">
        {SECTIONS.map((_, i) => (
          <div
            key={i}
            className={
              i === sectionIndex
                ? 'h-3 w-10 rounded bg-primary'
                : 'h-3 w-10 rounded bg-neutral-30'
            }
          />
        ))}
      </div>

      <p className="text-title-md text-icon-90">{title}</p>

      <div className="flex items-center w-[284px] min-h-[85px] divide-x divide-neutral-30 rounded-8 border border-neutral-30 text-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 h-full px-(--space-16)">
          <p className="text-base text-icon-50">문제 수</p>
          <p className="text-title-sm text-icon-90">{questionCount}개</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 h-full px-(--space-16)">
          <p className="text-base text-icon-50">문제당 제한시간</p>
          <p className="text-title-sm text-icon-90">{timeLimit}</p>
        </div>
      </div>
    </div>
  );
}
