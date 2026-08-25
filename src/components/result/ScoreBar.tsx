import { cn } from '@/lib/utils/cn';

const SEGMENT_COUNT = 5;

// score(0~100)를 5칸 세그먼트 중 채워진 칸 수로 환산해 보여준다.
export function ScoreBar({ score }: { score: number }) {
  const filled = Math.round((score / 100) * SEGMENT_COUNT);

  return (
    <div className="flex h-3 w-full gap-1">
      {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-full flex-1 rounded-full',
            i < filled ? 'bg-icon-80' : 'bg-neutral-30',
          )}
        />
      ))}
    </div>
  );
}
