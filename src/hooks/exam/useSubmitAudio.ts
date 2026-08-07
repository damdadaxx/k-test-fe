import { useMutation } from '@tanstack/react-query';

import { getAnswerUploadUrl, saveAnswer } from '@/lib/api/exam';
import { uploadToSignedUrl } from '@/lib/utils/uploadToSignedUrl';

export function useSubmitAudio(sessionId: string, questionId: string) {
  return useMutation({
    mutationFn: async ({
      blob,
      durationMs,
    }: {
      blob: Blob;
      durationMs: number;
    }) => {
      const contentType = blob.type || 'audio/webm';
      const { path, signedUrl } = await getAnswerUploadUrl(
        sessionId,
        questionId,
        contentType,
      );
      await uploadToSignedUrl(signedUrl, blob);
      return saveAnswer(sessionId, questionId, {
        type: 'AUDIO',
        audioFileUrl: path,
        durationMs,
      });
    },
  });
}
