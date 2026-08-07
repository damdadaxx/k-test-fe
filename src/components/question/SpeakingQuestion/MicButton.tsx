'use client';

import Image from 'next/image';

import IcMicrophone from '@/app/assets/icons/icon_microphone.svg';

import ButtonSecondary from '@/components/common/Button/ButtonSecondary';

export type RecordPhase = 'idle' | 'locked' | 'ready' | 'submitted';

interface MicButtonProps {
  phase: RecordPhase;
  onStart: () => void;
  onSubmit: () => void;
}

export function MicButton({ phase, onStart, onSubmit }: MicButtonProps) {
  if (phase === 'idle') {
    return (
      <ButtonSecondary
        onClick={onStart}
        icon={<Image src={IcMicrophone} alt="" width={24} height={24} />}
        className="mt-5 w-auto min-w-64.25"
      >
        클릭해 녹음하세요
      </ButtonSecondary>
    );
  }

  if (phase === 'locked') {
    return (
      <button
        type="button"
        disabled
        className="flex items-center justify-center min-w-[257px] gap-[8px] mt-[20px] rounded-[8px] border border-icon-30 bg-white px-[24px] py-[20px] text-button-lg text-icon-50 cursor-not-allowed"
      >
        30초 후에 제출하세요
      </button>
    );
  }

  // TODO: 답변 제출 클릭 시 disabled 처리하기
  return (
    <ButtonSecondary onClick={onSubmit} className="mt-5 w-auto min-w-64.25">
      답변 제출
    </ButtonSecondary>
  );
}
