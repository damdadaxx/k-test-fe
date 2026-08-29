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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      onClick={handleBackdropClick}
    >
      <div className={cn('rounded-xl bg-white p-(--space-32)', className)}>
        {children}
      </div>
    </div>
  );
}
