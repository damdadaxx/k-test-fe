import { useMutation, useQuery } from '@tanstack/react-query';

import {
  applyExam,
  getExams,
  getMyExams,
  startExamSession,
} from '@/lib/api/exam';

import { useSessionStore } from '@/store/sessionStore';

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: getExams,
  });
}

// 내 신청 회차 현황 — /exams에서 회차별 신청/응시 상태 라벨에 사용.
export function useMyExams() {
  return useQuery({
    queryKey: ['my-exams'],
    queryFn: getMyExams,
  });
}

export function useApplyExam() {
  return useMutation({
    mutationFn: (examId: string) => applyExam(examId),
  });
}

// 시험 시작. 기존 세션이 있으면 그대로 재개 반환(재개 시도로 카운트) — PDF 참고.
// 응답 id가 examSessionId이며 이후 세션 라우트의 [id]로 쓰인다.
export function useStartExamSession() {
  const setSessionId = useSessionStore((state) => state.setSessionId);
  return useMutation({
    mutationFn: (examId: string) => startExamSession(examId),
    onSuccess: (data) => setSessionId(data.id),
  });
}
