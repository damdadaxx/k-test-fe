'use client';

import { use } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import ImgDualMonitorNotice from '@/app/assets/images/img_dual_monitors.svg';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';

// 캘리브레이션(/ready) 진입 전 잠깐 보여주는 안내 화면 (Figma 40001272:8056).
// 여기 [id] = examSessionId — 세션은 이미 생성돼있어 만들지 않고 다음 단계로만 넘어간다.
export default function DualMonitorNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const handleNext = () => {
    router.push(`/${sessionId}/ready`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 flex-col items-center">
        <div className="mt-39 flex flex-col items-center gap-3 text-center">
          <p className="text-title-lg tracking-[-0.64px] text-icon-90">
            You can&rsquo;t use dual monitors during the test.
          </p>
          <p className="text-title-md font-normal text-icon-50">
            Please disconnect the second monitor and use a single display.
          </p>
        </div>

        <Image
          src={ImgDualMonitorNotice}
          alt=""
          className="mt-25 h-auto w-full max-w-187"
        />
      </main>

      <NextStepButton onClick={handleNext} label="Next" />
    </div>
  );
}
