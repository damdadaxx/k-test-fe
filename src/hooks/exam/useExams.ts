import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { getErrorMessage } from '@/lib/api/client';
import {
  getCurrentSession,
  getMyExams,
  getSessionQuestions,
  startExamSession,
} from '@/lib/api/exam';
import { SECTIONS, getResumeQuestion } from '@/lib/exam/sections';

import { useSessionStore } from '@/store/sessionStore';

// 내 응시 세션 현황(마이페이지). 회차 개념 제거 — 세션별 여러 줄.
export function useMyExams() {
  return useQuery({
    queryKey: ['my-exams'],
    queryFn: getMyExams,
  });
}

// 진행중 세션 조회 — 홈에서 "이어서 풀기" vs "응시하기" 분기. 로그인 안 했으면 호출 안 함.
export function useCurrentSession(enabled = true) {
  return useQuery({
    queryKey: ['current-session'],
    queryFn: getCurrentSession,
    enabled,
  });
}

// 시험 시작/재개 — 회차 id 없이 POST /exam-sessions. 진행중이면 그 세션 반환.
// 응답 examSessionId가 이후 세션 라우트의 [id]로 쓰인다. verified=false면 본인인증부터.
export function useStartExamSession() {
  const setSessionId = useSessionStore((state) => state.setSessionId);
  return useMutation({
    mutationFn: () => startExamSession(),
    onSuccess: (data) => setSessionId(data.examSessionId),
  });
}

// 진행중 세션 "이어서 풀기" — POST /exam-sessions 재호출(재접속 남용 카운트가 이걸로만
// 세워지므로 GET current의 examSessionId로 직접 이동하면 안 됨) 후 verified 분기·재개
// 지점 계산까지 한 번에 처리. my-reports("Resume Test")·랜딩(TakeTestButton) 등
// "이미 진행중인 세션을 이어서 풀기"가 필요한 곳에서 공용으로 쓴다.
// (TakeTestButton은 새 세션 시작과 pending 상태를 공유해야 해서 기존 구현을 그대로 둠 —
// 여기는 새 호출부(my-reports)를 위한 것.)
export function useResumeExamSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const startSession = useStartExamSession();

  const resume = (onError?: (message: string) => void) => {
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
      onError: (error) =>
        onError?.(
          getErrorMessage(error, 'This test is currently unavailable.'),
        ),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ['current-session'] }),
    });
  };

  return { resume, isPending: startSession.isPending };
}
