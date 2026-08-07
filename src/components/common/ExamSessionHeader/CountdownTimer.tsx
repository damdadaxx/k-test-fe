'use client';

import { useEffect } from 'react';

import Image from 'next/image';

import IcClock from '@/app/assets/icons/icon_clock.svg';

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

  // 매 초 최신 값을 zustand getState()로 직접 읽어서 감소시킨다.
  // remainingSeconds를 의존성에 넣으면 틱마다 setInterval이 재생성돼서 낭비였음.
  useEffect(() => {
    const timer = setInterval(() => {
      const current = useExamStore.getState().remainingSeconds;
      if (current <= 0) return;
      useExamStore.getState().setRemainingSeconds(current - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-[12px]">
      <Image src={IcClock} alt="" width={32} height={32} />

      <span className="text-title-md font-bold text-icon-90">
        {formatTime(remainingSeconds)}
      </span>
      <span className="text-badge-md font-normal text-[#6b7280]">
        이번 문제 남은 시간
      </span>
    </div>
  );
}
