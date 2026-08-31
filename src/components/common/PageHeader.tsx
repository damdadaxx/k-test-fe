'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ImgLogo from '@/app/assets/images/img_logo.svg';

import { cn } from '@/lib/utils/cn';

import { useModal } from '@/providers/ModalProvider';

import { useAuthToken } from '@/hooks/auth/useAuthToken';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalLogin } from '@/components/common/Modal/ModalLogin';
import { MyReportsMenuButton } from '@/components/common/MyReportsMenuButton';

// 응시 화면(exam-session/exam-entry) 제외한 모든 페이지 공용 헤더. 스크롤해도 고정
// (h-20만큼 콘텐츠에 상단 여백 필요). 비로그인이면 Log In/Sign Up —
// /signup 페이지 자신에서는 Sign Up 링크는 숨김(랜딩 Header의 기존 예외 그대로).
// 로그인 상태면 어느 페이지든 My Reports 드롭다운(랜딩 포함) — 로그아웃은 그 안에 있음.
export function PageHeader() {
  const pathname = usePathname();
  const { openModal, closeModal } = useModal();
  const token = useAuthToken();
  const isResolved = token !== undefined;
  const isLoggedIn = Boolean(token);

  return (
    <header className="fixed top-0 left-0 z-10 h-20 w-full border-b border-neutral-30 bg-white">
      <div
        className={cn(
          'max-w-[1440px] flex items-center justify-between h-full px-6 m-auto',
          'tablet:px-30',
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={ImgLogo}
            width={112}
            height={24}
            alt="K-TEST Logo"
            priority
          />
        </Link>

        {!isResolved ? null : isLoggedIn ? (
          <MyReportsMenuButton />
        ) : (
          <nav className="flex items-center gap-5">
            <ButtonPrimary
              variant="line"
              size="sm"
              width={140}
              onClick={() => openModal(<ModalLogin onClose={closeModal} />)}
            >
              Log In
            </ButtonPrimary>
            {pathname !== '/signup' && (
              <ButtonPrimary href="/signup" as="link" size="sm" width={140}>
                Sign Up
              </ButtonPrimary>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
