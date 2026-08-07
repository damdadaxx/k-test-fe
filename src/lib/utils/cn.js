import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** twMerge
 * - 같은 그룹의 Tailwind 클래스가 중복되면 나중 값만 남기고 앞의 값을 지워줌
 * - (예: cn('bg-red-500', 'bg-blue-500') => 'bg-blue-500')
 * - 기본 twMerge는 globals.css의 커스텀 text-title-lg 같은 폰트 토큰을 모르고
 * text 컬러 클래스와 같은 그룹으로 잘못 인식해 지워버리므로, font-size 그룹을 직접 등록해줌
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'body-sm',
            'body-md',
            'title-sm',
            'title-md',
            'title-lg',
            'badge-md',
            'button-md',
            'button-lg',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
