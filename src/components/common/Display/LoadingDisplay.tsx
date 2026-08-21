import { cn } from '@/lib/utils/cn';

interface LoadingDisplayProps {
  size?: number;
  className?: string;
  fullHeight?: boolean;
}

/**
 * 로딩 스피너
 * @param size 스피너 크기(px), 기본 60
 * @param className wrapper 추가 클래스
 * @param fullHeight true면 min-h-[350px] 중앙 배치, false면 인라인(버튼 등)
 */
export default function LoadingDisplay({
  size = 60,
  className,
  fullHeight = true,
}: LoadingDisplayProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullHeight ? 'min-h-[350px] w-full' : 'h-fit w-fit',
        className,
      )}
    >
      <span
        role="status"
        aria-label="로딩 중"
        className="inline-block animate-spin rounded-full border-4 border-neutral-30 border-t-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
