import { apiClient } from './client';

export interface GradingResult {
  sessionId: string;
  totalScore: number;
  status: 'pending' | 'completed';
}

export const getGrading = (sessionId: string) =>
  apiClient
    .get<GradingResult>('/grading', { params: { sessionId } })
    .then((res) => res.data);
