import type { AnswerSubmission, ExamSession } from '@/types/exam';

import { apiClient } from './client';

export const getExamSession = (sessionId: string) =>
  apiClient
    .get<ExamSession>(`/exam/sessions/${sessionId}`)
    .then((res) => res.data);

export const submitAnswer = (payload: AnswerSubmission) =>
  apiClient.post('/answers', payload).then((res) => res.data);

export const uploadAudio = (
  sessionId: string,
  questionId: string,
  audio: Blob,
) => {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('questionId', questionId);
  formData.append('audio', audio);
  return apiClient
    .post('/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const submitTest = (sessionId: string) =>
  apiClient.post('/test/submit', { sessionId }).then((res) => res.data);
