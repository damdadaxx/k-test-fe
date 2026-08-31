import { getViolationInfo } from '@/lib/exam/violationLabels';

// Figma 40001144:11079 — 사유 배지(종류+횟수) + 평문 설명. 실격 상세(violations) 전용.
export function ViolationRow({
  eventType,
  count,
}: {
  eventType: string;
  count: number;
}) {
  const info = getViolationInfo(eventType);

  return (
    <div className="flex items-center gap-2">
      <div className="flex shrink-0 items-center gap-2 rounded-full bg-error-10 px-2 py-1">
        <span className="text-body-sm text-error uppercase">{info.label}</span>
        <span className="h-3.5 w-px bg-error opacity-30" />
        <span className="text-body-sm text-error">X{count}</span>
      </div>
      <p className="text-body-sm text-primary">{info.message(count)}</p>
    </div>
  );
}
