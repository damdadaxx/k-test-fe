'use client';

import { useRouter } from 'next/navigation';

import { getErrorMessage } from '@/lib/api/client';
import { getSessionQuestions } from '@/lib/api/exam';
import { SECTIONS, getResumeQuestion } from '@/lib/exam/sections';

import { useModal } from '@/providers/ModalProvider';

import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { useCurrentSession, useStartExamSession } from '@/hooks/exam/useExams';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import ButtonSecondary from '@/components/common/Button/ButtonSecondary';
import { ModalBase } from '@/components/common/Modal/ModalBase';
import { ModalLogin } from '@/components/common/Modal/ModalLogin';

// 시험 응시 시작 진입점(랜딩의 유일한 응시 버튼).
// 미로그인이면 로그인 모달. 로그인 상태면:
//   - 진행중(INPROGRESS) 세션이 있으면 새로 시작하지 않고 안내 모달 후 그 세션으로 복귀
//     (백엔드가 INPROGRESS 세션 존재 시 새 세션 생성을 막음 — 3시간 지나면 스케줄러가 자동 종료).
//   - 그 외(세션 없음/SUBMITTED/EXPIRED/BLOCKED/DISQUALIFIED)는 항상 새 세션 생성 가능.
export function TakeTestButton() {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const token = useAuthToken();
  const { data: current, isLoading: isCurrentLoading } = useCurrentSession(
    Boolean(token),
  );
  const startSession = useStartExamSession();

  const showErrorModal = (message: string) => {
    openModal(
      <ModalBase
        onClose={closeModal}
        className="flex w-90 flex-col items-center gap-6 text-center"
      >
        <p className="text-body-lg text-primary">{message}</p>
        <ButtonPrimary width={140} onClick={closeModal}>
          Confirm
        </ButtonPrimary>
      </ModalBase>,
    );
  };

  const startNewSession = () => {
    if (startSession.isPending) return;
    startSession.mutate(undefined, {
      onSuccess: (data) => {
        router.push(
          data.verified
            ? `/${data.examSessionId}/testing/${SECTIONS[0].moduleId}/intro`
            : `/${data.examSessionId}/identity`,
        );
      },
      onError: (error) => {
        showErrorModal(
          getErrorMessage(error, 'This test is currently unavailable.'),
        );
      },
    });
  };

  // verified 안 됐으면 본인인증부터, 됐으면 마지막 미답 문항으로 바로.
  const resumeSession = async (sessionId: string, verified: boolean) => {
    closeModal();
    if (!verified) {
      router.push(`/${sessionId}/identity`);
      return;
    }
    const questions = await getSessionQuestions(sessionId);
    const target = getResumeQuestion(questions);
    router.push(
      target
        ? `/${sessionId}/testing/${target.moduleId}/${target.questionId}`
        : `/${sessionId}/testing/${SECTIONS[0].moduleId}/intro`,
    );
  };

  const handleClick = () => {
    if (!token) {
      openModal(<ModalLogin onClose={closeModal} />);
      return;
    }
    // current-session 조회 끝나기 전엔 대기 — 안 그러면 INPROGRESS 안내를 건너뛰고
    // 바로 새 세션 생성으로 빠질 수 있다(백엔드가 그 요청을 거부해도 조용히 묻힘).
    if (isCurrentLoading) return;
    if (current?.status === 'INPROGRESS') {
      openModal(
        <ModalBase
          onClose={closeModal}
          className="flex w-90 flex-col items-center gap-6 text-center"
        >
          <p className="text-body-lg text-primary">
            You can apply for a new test after finishing your current test.
          </p>
          <div className="flex w-full gap-3">
            <ButtonSecondary onClick={closeModal}>Cancel</ButtonSecondary>
            <ButtonPrimary
              onClick={() => resumeSession(current.id, current.verified)}
            >
              Resume Test
            </ButtonPrimary>
          </div>
        </ModalBase>,
      );
      return;
    }
    startNewSession();
  };

  return (
    <ButtonPrimary
      onClick={handleClick}
      disabled={startSession.isPending || (Boolean(token) && isCurrentLoading)}
    >
      Take Test
    </ButtonPrimary>
  );
}
