import { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

// TODO: 추후 삭제
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-yellow-400 text-black hover:bg-yellow-300',
        variant === 'secondary' &&
          'bg-gray-100 text-gray-900 hover:bg-gray-200',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        className,
      )}
      {...props}
    />
  );
}
