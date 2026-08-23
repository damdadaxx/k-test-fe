import type { ExamReport } from '@/types/exam';

import { apiClient } from './client';

// 최종 리포트 상세. examResultId는 GET /mypage 항목에서 받은 값(채점 전이면 null이라 호출 불가).
export const getReport = (examResultId: string) =>
  apiClient
    .get<ExamReport>(`/mypage/report/${examResultId}`)
    .then((res) => res.data);
