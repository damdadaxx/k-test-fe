import type {
  AnswerResponse,
  ApplyExamResponse,
  ExamListItem,
  ExamSessionStatusResponse,
  MyExamItem,
  SaveAnswerRequest,
  SessionQuestionResponse,
  StartExamSessionResponse,
} from '@/types/exam';
import type { UploadUrlResponse } from '@/types/identity';

import { apiClient } from './client';

export const getExams = () =>
  apiClient.get<ExamListItem[]>('/exams').then((res) => res.data);

// 내가 신청한 회차 현황 (신청여부/세션상태). /exams에서 신청완료 회차 판별에 쓴다.
export const getMyExams = () =>
  apiClient.get<MyExamItem[]>('/mypage').then((res) => res.data);

export const applyExam = (examId: string) =>
  apiClient
    .post<ApplyExamResponse>(`/exams/${examId}/apply`)
    .then((res) => res.data);

export const startExamSession = (examId: string) =>
  apiClient
    .post<StartExamSessionResponse>(`/exams/${examId}/sessions`)
    .then((res) => res.data);

// 세션 상태 조회 — 진입 시 INPROGRESS가 아니면(종료/차단) 진행 불가.
export const getExamSession = (examSessionId: string) =>
  apiClient
    .get<ExamSessionStatusResponse>(`/exam-sessions/${examSessionId}`)
    .then((res) => res.data);

export const getSessionQuestions = (examSessionId: string) =>
  apiClient
    .get<SessionQuestionResponse[]>(`/exam-sessions/${examSessionId}/questions`)
    .then((res) => res.data);

export const getSessionQuestion = (examSessionId: string, questionId: string) =>
  apiClient
    .get<SessionQuestionResponse>(
      `/exam-sessions/${examSessionId}/questions/${questionId}`,
    )
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

export const getAnswer = (examSessionId: string, questionId: string) =>
  apiClient
    .get<AnswerResponse>(
      `/exam-sessions/${examSessionId}/questions/${questionId}/answer`,
    )
    .then((res) => res.data);

// TODO(5): submissions 리소스와의 관계가 정리되면 실제 "시험 최종 제출" 엔드포인트로 교체
export const submitTest = (sessionId: string) =>
  apiClient.post('/test/submit', { sessionId }).then((res) => res.data);
