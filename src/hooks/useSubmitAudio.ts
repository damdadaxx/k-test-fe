import { useMutation } from '@tanstack/react-query';

import { uploadAudio } from '@/lib/api/exam';

export function useSubmitAudio(sessionId: string, questionId: string) {
  return useMutation({
    mutationFn: (audio: Blob) => uploadAudio(sessionId, questionId, audio),
  });
}
