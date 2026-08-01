'use client';

import { clsx } from 'clsx';

export function MicButton({
  isRecording,
  onToggle,
}: {
  isRecording: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md transition-colors',
        isRecording ? 'bg-red-500' : 'bg-yellow-400 text-black',
      )}
    >
      {isRecording ? '정지' : '녹음'}
    </button>
  );
}
