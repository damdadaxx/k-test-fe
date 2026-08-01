import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'info';
}

export function Toast({ message, variant = 'info' }: ToastProps) {
  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 -translate-x-1/2 rounded-md px-4 py-2 text-sm text-white shadow-lg',
        variant === 'success' && 'bg-green-600',
        variant === 'error' && 'bg-red-600',
        variant === 'info' && 'bg-gray-800',
      )}
    >
      {message}
    </div>
  );
}
