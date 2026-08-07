'use client';

import { useEffect } from 'react';

import { cn } from '@/lib/utils/cn';

type ModalBaseProps = {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function ModalBase({ onClose, children, className }: ModalBaseProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
      )}
      onClick={onClose}
    >
      <div
        className={cn('rounded-xl bg-white p-(--space-32)', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
