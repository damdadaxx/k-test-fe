import type { ExamReport, ViolationSummary } from '@/types/exam';

import { apiClient } from './client';

// 최종 리포트 상세. examResultId는 GET /mypage 항목에서 받은 값(채점 전이면 null이라 호출 불가).
export const getReport = (examResultId: string) =>
  apiClient
    .get<ExamReport>(`/mypage/report/${examResultId}`)
    .then((res) => res.data);

// 실격(DISQUALIFIED) 세션의 부정행위 사유 조회. 실격 아닌 세션에 호출하면 409.
export const getViolationSummary = (examSessionId: string) =>
  apiClient
    .get<ViolationSummary>(`/mypage/violations/${examSessionId}`)
    .then((res) => res.data);
