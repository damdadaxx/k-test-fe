import Image from 'next/image';
import Link from 'next/link';

import IcCheckedCircleLg from '@/app/assets/icons/icon_check_green_lg.svg';
import ImgLogo from '@/app/assets/images/img_logo.svg';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';

// TODO(기획 변경 대기 · 디자이너 확정 전): 이전 기획은 제출 즉시 리포트로 자동 이동
// (진행바로 /mypage 폴링 → /report/{examResultId} 리다이렉트)이었다. 리포트 생성이 최대 5분
// 걸릴 수 있어, "시험 완료 안내 + 마이페이지 유도"로 방향 변경(리포트 준비 시 이메일로 링크 발송).
// 이전 방식의 폴링/리다이렉트 컴포넌트는 @/components/result/ResultProgress 에 보존(현재 미사용).
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

          {/* TODO: 마이페이지(내 시험 현황) 라우트 생기면 교체(현재 /exams). */}
          <ButtonPrimary
            variant="line"
            size="sm"
            width={140}
            as="link"
            href="/exams"
          >
            Mypage
          </ButtonPrimary>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-14">
        {/* Success Card (Figma node 40000645:22475 기반, 진행바→안내 버튼으로 변경) */}
        <div className="flex w-[680px] max-w-full flex-col items-center rounded-[24px] bg-white p-12 drop-shadow-[0px_8px_12px_rgba(0,0,0,0.03)]">
          {/* 성공 아이콘 배지 */}
          <Image src={IcCheckedCircleLg} width="60" height="60" alt="" />

          {/* 완료 안내 */}
          <p className="pb-3 pt-6 text-title-md tracking-[-0.48px] text-icon-90">
            시험이 완료되었습니다!
          </p>

          <p className="max-w-[460px] pb-8 text-center text-body-md tracking-[-0.16px] text-icon-70">
            리포트가 생성되면 가입하신 이메일로 안내와 링크를 보내드립니다.{' '}
            <br /> 마이페이지에서도 결과를 확인하실 수 있습니다.
          </p>

          {/* TODO: 마이페이지(내 시험 현황) 라우트 생기면 교체(현재 /exams). */}
          <ButtonPrimary width={200} as="link" href="/exams">
            마이페이지로 이동
          </ButtonPrimary>
        </div>
      </main>
    </div>
  );
}
