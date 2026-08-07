import { useQuery } from '@tanstack/react-query';

import { getExamSession } from '@/lib/api/exam';

export function useExamSession(sessionId: string) {
  return useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => getExamSession(sessionId),
    enabled: Boolean(sessionId),
  });
}
