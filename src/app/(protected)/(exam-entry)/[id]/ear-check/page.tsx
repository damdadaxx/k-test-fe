'use client';

import { use } from 'react';

import { useRouter } from 'next/navigation';

import { useEarDetection } from '@/hooks/identity/useEarDetection';

import { useSessionStore } from '@/store/sessionStore';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import {
  EarCapture,
  type EarDetectionOutcome,
} from '@/components/identity/EarCapture';
import StepHeader from '@/components/identity/StepHeader';

// ponytail: 백엔드 이어폰탐지 vendor 다운 시 개발용 우회. .env NEXT_PUBLIC_SKIP_EAR_DETECT=true.
// PDF상 이어폰 감지는 "현재 안 해도 응시 가능"이라 우회해도 플로우 자연스러움.
const SKIP_EAR_DETECT = process.env.NEXT_PUBLIC_SKIP_EAR_DETECT === 'true';

export default function EarCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = use(params);
  const router = useRouter();
  const earDetection = useEarDetection(examId);
  const earCheckVerified = useSessionStore((state) => state.earCheckVerified);
  const setEarCheckVerified = useSessionStore(
    (state) => state.setEarCheckVerified,
  );

  // 양쪽 귀 blob → earphone/detect. earphoneDetected거나 inspectionComplete:false(자세
  // 문제로 판정 불완전)면 EarCapture가 재촬영으로 되돌린다. 통과(둘 다 만족)면 훅
  // onSuccess가 earCheckVerified=true로 세워 Next를 연다.
  const handleDetect = async (
    leftEarImage: Blob,
    rightEarImage: Blob,
  ): Promise<EarDetectionOutcome> => {
    if (SKIP_EAR_DETECT) {
      setEarCheckVerified(true);
      return { earphoneDetected: false, inspectionComplete: true, message: '' };
    }
    return earDetection.mutateAsync({ leftEarImage, rightEarImage });
  };

  // 본인인증 완료 → 준비 화면으로. 세션은 랜딩(Take Test)에서 이미 생성됨 —
  // examId(=examSessionId)를 그대로 넘겨 /ready에서 캘리브레이션 후 같은 세션으로 진입.
  const handleNext = () => {
    router.push(`/${examId}/ready`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StepHeader step={earCheckVerified ? 3 : 2} />

      <main className="mx-auto flex flex-1 flex-col items-center gap-8 px-6 pt-10">
        <EarCapture onDetect={handleDetect} />
      </main>

      <NextStepButton
        onClick={handleNext}
        disabled={!earCheckVerified}
        label="Next"
      />
    </div>
  );
}
