'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ImgLogo from '@/app/assets/images/img_logo.svg';

import { useModal } from '@/providers/ModalProvider';

import { signOut } from '@/hooks/auth/useAuth';
import { useAuthToken } from '@/hooks/auth/useAuthToken';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalLogin } from '@/components/common/Modal/ModalLogin';

export default function Header() {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const token = useAuthToken();
  const isLoggedIn = Boolean(token);

  const handleSignOut = () => {
    signOut();
    router.replace('/');
  };

  return (
    <header className="border-b border-neutral-30 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={ImgLogo}
            width={112}
            height={24}
            alt="K-TEST Logo Image"
          />
        </Link>

        <nav className="flex items-center gap-5">
          {isLoggedIn ? (
            <ButtonPrimary
              variant="line"
              size="sm"
              width={140}
              onClick={handleSignOut}
            >
              Sign Out
            </ButtonPrimary>
          ) : (
            <>
              <ButtonPrimary
                variant="line"
                size="sm"
                width={140}
                onClick={() =>
                  openModal(
                    <ModalLogin onClose={closeModal} />,
                    'flex w-110 flex-col gap-6',
                  )
                }
              >
                Log In
              </ButtonPrimary>
              <ButtonPrimary href="/signup" as="link" size="sm" width={140}>
                Sing Up
              </ButtonPrimary>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
