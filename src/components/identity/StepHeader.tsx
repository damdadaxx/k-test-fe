'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import IcArrowLeft from '@/app/assets/icons/icon_arrow_left.svg';

import ProgressBar from '@/components/common/ProgressBar/ProgressBar';

const TOTAL_STEPS = 3;

export default function StepHeader({ step }: { step: 0 | 1 | 2 | 3 }) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-10 px-[120px] py-4">
      <button
        className="cursor-pointer"
        type="button"
        onClick={() => router.back()}
      >
        <Image src={IcArrowLeft} alt="뒤로가기" width={32} height={32} />
      </button>
      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />
    </header>
  );
}
