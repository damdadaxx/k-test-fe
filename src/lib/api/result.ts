import { apiClient } from './client';

export interface ExamResult {
  sessionId: string;
  totalScore: number;
  moduleScores: { moduleId: string; title: string; score: number }[];
}

export const getResult = (sessionId: string) =>
  apiClient.get<ExamResult>(`/results/${sessionId}`).then((res) => res.data);
