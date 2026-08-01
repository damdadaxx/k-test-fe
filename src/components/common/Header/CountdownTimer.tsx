'use client';

import { useEffect } from 'react';

import { useExamStore } from '@/store/examStore';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function CountdownTimer() {
  const remainingSeconds = useExamStore((state) => state.remainingSeconds);
  const setRemainingSeconds = useExamStore(
    (state) => state.setRemainingSeconds,
  );

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds(Math.max(remainingSeconds - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds, setRemainingSeconds]);

  return (
    <span className="font-mono text-sm font-semibold">
      {formatTime(remainingSeconds)}
    </span>
  );
}
