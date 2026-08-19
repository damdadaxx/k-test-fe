'use client';

import { use } from 'react';

import { useRouter } from 'next/navigation';

import { getErrorMessage } from '@/lib/api/client';

import { useModal } from '@/providers/ModalProvider';

import { useStartExamSession } from '@/hooks/exam/useExams';
import { useEarDetection } from '@/hooks/identity/useEarDetection';

import { useSessionStore } from '@/store/sessionStore';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import { ModalBase } from '@/components/common/Modal/ModalBase';
import { EarCapture } from '@/components/identity/EarCapture';
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
  const { openModal, closeModal } = useModal();
  const earDetection = useEarDetection(examId);
  const startSession = useStartExamSession();
  const earCheckVerified = useSessionStore((state) => state.earCheckVerified);
  const setEarCheckVerified = useSessionStore(
    (state) => state.setEarCheckVerified,
  );

  // 양쪽 귀 blob → earphone/detect. earphoneDetected면 EarCapture가 재촬영으로 되돌린다.
  // 미착용이면 훅 onSuccess가 earCheckVerified=true로 세워 Next를 연다.
  const handleDetect = async (leftEarImage: Blob, rightEarImage: Blob) => {
    if (SKIP_EAR_DETECT) {
      setEarCheckVerified(true);
      return false;
    }
    const result = await earDetection.mutateAsync({
      leftEarImage,
      rightEarImage,
    });
    return result.earphoneDetected;
  };

  // [시험 시작] — POST /exams/:id/sessions. 응답 examSessionId로 세션 라우트 진입.
  // 재접속 차단(403)·종료된 시험(409) 등으로 실패하면 안내 모달 후 회차 목록으로 돌려보낸다.
  const handleNext = async () => {
    try {
      const session = await startSession.mutateAsync(examId);
      router.push(`/${session.id}/ready`);
    } catch (error) {
      const message = getErrorMessage(error, '시험을 시작할 수 없습니다.');
      const backToExams = () => {
        closeModal();
        router.replace('/exams');
      };
      openModal(
        <ModalBase
          onClose={backToExams}
          className="flex w-90 flex-col items-center gap-6 text-center"
        >
          <p className="text-body-lg text-primary">{message}</p>
          <ButtonPrimary width={140} onClick={backToExams}>
            확인
          </ButtonPrimary>
        </ModalBase>,
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StepHeader step={earCheckVerified ? 3 : 2} />

      <main className="mx-auto flex flex-1 flex-col items-center gap-8 px-6 pt-10">
        <EarCapture onDetect={handleDetect} />
      </main>

      <NextStepButton
        onClick={handleNext}
        disabled={!earCheckVerified || startSession.isPending}
        label="Next"
      />
    </div>
  );
}
