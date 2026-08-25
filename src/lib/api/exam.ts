import type {
  AnswerResponse,
  ExamSessionStatusResponse,
  MyExamItem,
  SaveAnswerRequest,
  SessionQuestionResponse,
  StartExamSessionResponse,
} from '@/types/exam';
import type { UploadUrlResponse } from '@/types/identity';

import { apiClient } from './client';

// 내 응시 세션 현황(회차 개념 제거, 재응시 세션별 여러 줄).
export const getMyExams = () =>
  apiClient.get<MyExamItem[]>('/mypage').then((res) => res.data);

// 진행중 세션 조회 — 있으면 "이어서 풀기", 없으면(null) "응시하기".
export const getCurrentSession = () =>
  apiClient
    .get<ExamSessionStatusResponse | null>('/exam-sessions/current')
    .then((res) => res.data);

// 시험 시작/재개 — 회차 id 없이 세션 하나로 처리(진행중이면 그 세션 반환). 반복 재접속 3회째 403.
export const startExamSession = () =>
  apiClient
    .post<StartExamSessionResponse>('/exam-sessions')
    .then((res) => res.data);

// 세션 상태 조회 — status + verified(인증 완료 여부).
export const getExamSession = (examSessionId: string) =>
  apiClient
    .get<ExamSessionStatusResponse>(`/exam-sessions/${examSessionId}`)
    .then((res) => res.data);

export const getSessionQuestions = (examSessionId: string) =>
  apiClient
    .get<SessionQuestionResponse[]>(`/exam-sessions/${examSessionId}/questions`)
    .then((res) => res.data);

export const getAnswerUploadUrl = (
  examSessionId: string,
  questionId: string,
  contentType: string,
) =>
  apiClient
    .post<UploadUrlResponse>(
      `/exam-sessions/${examSessionId}/questions/${questionId}/answer/upload-url`,
      { contentType },
    )
    .then((res) => res.data);

export const saveAnswer = (
  examSessionId: string,
  questionId: string,
  payload: SaveAnswerRequest,
) =>
  apiClient
    .post<AnswerResponse>(
      `/exam-sessions/${examSessionId}/questions/${questionId}/answer`,
      payload,
    )
    .then((res) => res.data);

// 문항 건너뛰기. 답안 대신 호출 → 채점 커버리지에 "스킵"으로 기록.
// 마지막 문항이면 이 호출 안에서 서버가 자동 finalize(최종 제출). body 없음.
export const skipQuestion = (examSessionId: string, questionId: string) =>
  apiClient
    .post<SessionQuestionResponse>(
      `/exam-sessions/${examSessionId}/questions/${questionId}/skip`,
    )
    .then((res) => res.data);

export const getAnswer = (examSessionId: string, questionId: string) =>
  apiClient
    .get<AnswerResponse>(
      `/exam-sessions/${examSessionId}/questions/${questionId}/answer`,
    )
    .then((res) => res.data);
