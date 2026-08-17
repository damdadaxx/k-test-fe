'use client';

import Image from 'next/image';

import IcX from '@/app/assets/icons/icon_x.svg';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalBase } from '@/components/common/Modal/ModalBase';

export type TermsModalProps = {
  onClose: () => void;
  onAgree: () => void;
};

export function TermsModalShell({
  title,
  onClose,
  onAgree,
  children,
}: {
  title: string;
  onClose: () => void;
  onAgree: () => void;
  children: React.ReactNode;
}) {
  return (
    <ModalBase
      onClose={onClose}
      // ModalBase가 기본으로 입히는 박스 스타일(rounded-xl bg-white p-32)을 지우고
      // 이 모달들의 자체 shell 스타일(고정 크기 720x800, 헤더/바디/푸터 구조)만 쓰도록 함
      className="rounded-none bg-transparent p-0 shadow-none"
    >
      <div className="flex h-200 w-180 flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_12px_32px_-8px_rgba(0,0,0,0.1)]">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-30 px-6 py-5">
          <p className="text-title-md text-icon-90">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-20"
          >
            <Image src={IcX} alt="close" width={18} height={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {children}
        </div>

        <div className="shrink-0 border-t border-neutral-30 px-6 pt-5 pb-6">
          <ButtonPrimary type="button" onClick={onAgree}>
            Agree and Continue
          </ButtonPrimary>
        </div>
      </div>
    </ModalBase>
  );
}
