'use client';

import { motion } from 'framer-motion';

const BAR_COUNT = 24;

export function RecordingWaveform() {
  return (
    <div
      className="flex h-[35px] items-center justify-center gap-[3px] mt-[33px] mb-[20px]"
      role="status"
      aria-label="녹음 중"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
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
      ))}
    </div>
  );
}
