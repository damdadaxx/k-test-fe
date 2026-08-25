'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import IcSignOut from '@/app/assets/icons/icon_sign_out.svg';
import IcUser from '@/app/assets/icons/icon_user.svg';

import { signOut } from '@/hooks/auth/useAuth';
import { usePopoverDismiss } from '@/hooks/ui/usePopoverDismiss';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';

// 헤더의 "Mypage" 버튼 — 누르면 My page/Logout 드롭다운 메뉴가 뜬다(피그마 Header state=Logout).
// TODO: 마이페이지(내 시험 현황) 라우트 생기면 "/"를 그걸로 교체.
export function MypageMenuButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  usePopoverDismiss(rootRef, isOpen, () => setIsOpen(false));

  return (
    <div ref={rootRef} className="relative">
      <ButtonPrimary
        variant="line"
        size="sm"
        width={140}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Mypage
      </ButtonPrimary>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-35 overflow-hidden rounded-8 border border-neutral-30 bg-white py-2 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex h-14 w-full items-center gap-2 px-3 text-body-md tracking-[-0.16px] text-icon-90 hover:bg-neutral-20"
          >
            <Image src={IcUser} alt="" width={20} height={20} />
            My page
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              signOut();
              router.replace('/');
            }}
            className="flex h-14 w-full items-center gap-2 px-3 text-body-md tracking-[-0.16px] text-error hover:bg-neutral-20 cursor-pointer"
          >
            <Image src={IcSignOut} alt="" width={20} height={20} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
