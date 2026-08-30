'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { getErrorMessage } from '@/lib/api/client';
import { getSessionQuestions } from '@/lib/api/exam';
import { SECTIONS, getResumeQuestion } from '@/lib/exam/sections';
import { isChromiumBrowser } from '@/lib/utils/browserSupport';

import { useModal } from '@/providers/ModalProvider';

import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { useCurrentSession, useStartExamSession } from '@/hooks/exam/useExams';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalBase } from '@/components/common/Modal/ModalBase';
import { ModalLogin } from '@/components/common/Modal/ModalLogin';

// 시험 응시 시작 진입점(랜딩의 유일한 응시 버튼).
// 크로미움 계열(Chrome/Edge/Brave/Opera/Vivaldi) 아니면 안내 모달만 띄우고 막는다(기획 변경).
// 미로그인이면 로그인 모달. 로그인 상태면:
//   - 진행중(INPROGRESS) 세션이 있으면 확인 모달을 먼저 보여줌(POST /exam-sessions 자체는
//     INPROGRESS여도 거부하지 않고 그 세션을 그대로 돌려주지만(재개), 반복 재접속 3회째부턴
//     403이라 사용자 확인 없이 자동 재개하지 않음).
//     단, verified:false(본인인증 전, 즉 진행률 0 확정)면 모달 없이 바로 본인인증으로 보낸다
//     (백엔드 확인: 재진행 여부 구분은 verified로 충분 — 본인인증만 하고 나간 경우까지는
//     "진행 중인 시험 있음" 모달을 보여줘도 무방하다는 결론).
//   - 그 외(세션 없음/SUBMITTED/EXPIRED/BLOCKED/DISQUALIFIED)는 항상 새 세션 생성 가능.
export function TakeTestButton() {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const token = useAuthToken();
  const { data: current, isLoading: isCurrentLoading } = useCurrentSession(
    Boolean(token),
  );
  const startSession = useStartExamSession();
  const queryClient = useQueryClient();
  // POST /exam-sessions 직후엔 세션 상태가 바로 바뀔 수 있어서(새로 생성/BLOCKED 전환 등)
  // 캐시된 current-session을 다음 클릭 전에 반드시 최신화해둔다(기본 staleTime 60초라 방치하면 stale).
  const invalidateCurrentSession = () =>
    queryClient.invalidateQueries({ queryKey: ['current-session'] });

  // 듀얼모니터 감지가 크로미움 계열 API에 의존해 다른 브라우저는 응시 자체를 막는다(Figma 40001152:11504).
  const showUnsupportedBrowserModal = () => {
    openModal(
      <ModalBase
        onClose={closeModal}
        className="flex w-149.5 max-w-full flex-col items-center gap-7 text-center"
      >
        <p className="text-title-lg tracking-[-0.64px] text-icon-90">
          Unsupported Browser
        </p>
        <p className="text-body-md text-icon-90">
          This test only works on{' '}
          <span className="font-bold">
            Chrome, Edge, Brave, Opera, or Vivaldi.
          </span>{' '}
          Please switch to one of these browsers to continue.
        </p>
        <ButtonPrimary width={180} onClick={closeModal}>
          Back
        </ButtonPrimary>
      </ModalBase>,
    );
  };

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
      onSettled: invalidateCurrentSession,
    });
  };

  // 재개도 POST /exam-sessions를 다시 호출한다(진행중이면 그 세션을 그대로 돌려줌) —
  // GET current의 examSessionId를 직접 써서 이동하면 재접속 남용 방지 카운트가 안 세워진다.
  const resumeSession = () => {
    closeModal();
    if (startSession.isPending) return;

    startSession.mutate(undefined, {
      onSuccess: async (data) => {
        if (!data.verified) {
          router.push(`/${data.examSessionId}/identity`);
          return;
        }

        const questions = await getSessionQuestions(data.examSessionId);
        const target = getResumeQuestion(questions);
        if (target) {
          router.push(
            `/${data.examSessionId}/testing/${target.moduleId}/${target.questionId}`,
          );
        } else if (questions.length > 0) {
          // 문항이 전부 답변/스킵됐는데(정상이면 마지막 처리 때 자동 finalize) 아직
          // INPROGRESS인 드문 경우 — 1번 문항으로 되돌리면 이미 낸 답까지 다시 풀게
          // 되므로, finish로 보내 결과(examResultId) 대기/재확인하게 한다.
          router.push(`/${data.examSessionId}/finish`);
        } else {
          router.push(
            `/${data.examSessionId}/testing/${SECTIONS[0].moduleId}/intro`,
          );
        }
      },
      onError: (error) => {
        showErrorModal(
          getErrorMessage(error, 'This test is currently unavailable.'),
        );
      },
      onSettled: invalidateCurrentSession,
    });
  };

  const handleClick = () => {
    if (!isChromiumBrowser()) {
      showUnsupportedBrowserModal();
      return;
    }
    if (!token) {
      openModal(<ModalLogin onClose={closeModal} />);
      return;
    }
    // current-session 조회 끝나기 전엔 대기 — 안 그러면 INPROGRESS 확인 모달을 건너뛰고
    // 바로 startNewSession()으로 빠져 사용자 동의 없이 재접속 카운트를 소모할 수 있다.
    if (isCurrentLoading) return;
    if (current?.status === 'INPROGRESS') {
      if (!current.verified) {
        resumeSession();
        return;
      }
      openModal(
        <ModalBase
          onClose={closeModal}
          className="flex w-90 flex-col items-center gap-6 text-center"
        >
          <p className="text-body-lg text-primary">
            You can apply for a new test after finishing your current test.
          </p>
          <div className="flex w-full gap-3">
            <ButtonPrimary variant="line" onClick={closeModal}>
              Cancel
            </ButtonPrimary>
            <ButtonPrimary onClick={resumeSession}>Resume Test</ButtonPrimary>
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
