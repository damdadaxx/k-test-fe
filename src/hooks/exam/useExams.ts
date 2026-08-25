import { useMutation, useQuery } from '@tanstack/react-query';

import {
  getCurrentSession,
  getMyExams,
  startExamSession,
} from '@/lib/api/exam';

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
