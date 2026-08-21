'use client';

import { motion } from 'framer-motion';

// 재생 중엔 녹음 파형(RecordingWaveform)과 동일한 모션으로 막대가 움직이고,
// 정지 상태에선 고정 높이 막대로 표시.
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-[35px] w-[458px] items-center justify-center gap-[3px]">
      {Array.from({ length: 48 }).map((_, i) =>
        active ? (
          <motion.span
            key={i}
            className="w-[4px] rounded-full bg-primary"
            initial={{ height: 4 }}
            animate={{ height: [4, 4 + ((i * 7) % 32), 4] }}
            transition={{
              duration: 0.6 + (i % 5) * 0.1,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              delay: (i % 6) * 0.08,
            }}
          />
        ) : (
          <span
            key={i}
            className="w-[4px] rounded-full bg-neutral-30"
            style={{ height: 4 + ((i * 7) % 32) }}
          />
        ),
      )}
    </div>
  );
}

/** Section3 - 질문에 대답하기 문제 섹션 (질문 오디오 플레이어. 재생 버튼 + 파형, 일시정지 없음) */
export function SoundPlayer({
  playing,
  disabled,
  onPlay,
}: {
  playing: boolean;
  disabled: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="flex w-[566px] items-center gap-5 rounded-xl bg-white p-4 mt-[10.5556vw]">
      <button
        type="button"
        onClick={onPlay}
        disabled={disabled}
        aria-label="질문 듣기"
        className="flex items-center justify-center rounded-lg bg-icon-90 p-4 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <Waveform active={playing} />
    </div>
  );
}
