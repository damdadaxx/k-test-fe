import { SECTIONS } from '@/lib/exam/sections';

function formatMinSec(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function SectionCard({
  sectionIndex,
  title,
  questionRange,
  prepSeconds,
  answerSeconds,
}: {
  sectionIndex: number;
  title: string;
  questionRange: string;
  prepSeconds: number;
  answerSeconds: number;
}) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 rounded-20 bg-white p-15">
      <div className="rounded-full bg-primary px-(--space-16) py-(--space-12) text-badge-sm text-white">
        SECTION {sectionIndex + 1}
      </div>

      <div className="flex items-start gap-1">
        {SECTIONS.map((_, i) => (
          <div
            key={i}
            className={
              i === sectionIndex
                ? 'h-3 w-10 rounded-4 bg-primary'
                : 'h-3 w-10 rounded-4 bg-neutral-30'
            }
          />
        ))}
      </div>

      <p className="text-title-md text-icon-90">{title}</p>

      <div className="flex divide-x divide-neutral-30 rounded-8 border border-neutral-30 text-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-(--space-16) py-(--space-16) min-w-[135px] min-h-[85px]">
          <p className="text-badge-sm text-icon-50">문제 수</p>
          <p className="text-title-sm text-icon-90">{questionRange}</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-(--space-16) py-(--space-16) min-w-[135px] min-h-[85px]">
          <p className="text-badge-sm text-icon-50">문제당 준비시간</p>
          <p className="text-title-sm text-icon-90">
            {formatMinSec(prepSeconds)}
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-(--space-16) py-(--space-16) min-w-[135px] min-h-[85px]">
          <p className="text-badge-sm text-icon-50">문제당 응답시간</p>
          <p className="text-title-sm text-icon-90">
            {formatMinSec(answerSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
}
