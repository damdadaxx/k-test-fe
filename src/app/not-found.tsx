'use client';

import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { PageHeader } from '@/components/common/PageHeader';

// Figma 40001083:6738 "error-404-page" — "404"/"Page Not Found" 텍스트만 Outfit 지정, 본문은 Pretendard 그대로.
const outfit = Outfit({ subsets: ['latin'], weight: ['700', '900'] });

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center bg-page-bg">
      <PageHeader />

      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-10 px-6 pt-20 pb-30">
        <div className="flex w-140 max-w-full flex-col items-center gap-4 text-center">
          <p
            className={`${outfit.className} text-[140px] leading-none font-black tracking-[-4px] text-neutral-30`}
          >
            404
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className={`${outfit.className} text-title-lg text-icon-90`}>
              Page Not Found
            </p>
            <p className="text-body-md leading-[1.6] text-icon-50">
              The page you are looking for does not exist, has been moved, or is
              temporarily unavailable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ButtonPrimary width={140} as="link" href="/">
            Go to Home
          </ButtonPrimary>
          <ButtonPrimary
            width={129}
            variant="line"
            onClick={() => router.back()}
          >
            Go Back
          </ButtonPrimary>
        </div>
      </main>
    </div>
  );
}
