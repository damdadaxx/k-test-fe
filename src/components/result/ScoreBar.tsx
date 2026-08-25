import { cn } from '@/lib/utils/cn';

const SEGMENT_COUNT = 5;

// score(0~100)를 5칸 세그먼트 중 채워진 칸 수로 환산해 보여준다.
// filledClassName: 영역별로 진하기가 다른 피그마 스펙(Task=icon-80, Language=icon-70, Delivery=icon-30) 반영용.
export function ScoreBar({
  score,
  filledClassName = 'bg-icon-80',
}: {
  score: number;
  filledClassName?: string;
}) {
  const filled = Math.round((score / 100) * SEGMENT_COUNT);

  return (
    <div className="flex h-3 w-full gap-1">
      {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-full flex-1 rounded-full',
            i < filled ? filledClassName : 'bg-neutral-30',
          )}
        />
      ))}
    </div>
  );
}
