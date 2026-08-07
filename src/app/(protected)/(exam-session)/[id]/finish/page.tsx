import Image from 'next/image';
import Link from 'next/link';

import ImgLogo from '@/app/assets/images/img_logo.svg';
import ImgResult from '@/app/assets/images/img_result.png';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';

// 임시 퍼블리싱: 리포트 카드 UI를 직접 만드는 대신 디자인 캡처 이미지 한 장으로 대체.
export default function FinishPage() {
  return (
    <div className="flex min-h-screen flex-col bg-page-bg">
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

          {/* TODO: 실제 마이페이지 라우트 생기면 그쪽으로 교체 */}
          <ButtonPrimary
            variant="line"
            size="sm"
            width={140}
            as="link"
            href="/exams"
          >
            마이페이지
          </ButtonPrimary>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center py-14">
        <Image src={ImgResult} alt="시험 결과 리포트" />
      </main>
    </div>
  );
}
