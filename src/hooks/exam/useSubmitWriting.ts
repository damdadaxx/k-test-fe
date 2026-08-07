import { useMutation } from '@tanstack/react-query';

import { saveAnswer } from '@/lib/api/exam';

export function useSubmitWriting(sessionId: string, questionId: string) {
  return useMutation({
    mutationFn: (contentText: string) =>
      saveAnswer(sessionId, questionId, { type: 'TEXT', contentText }),
  });
}
