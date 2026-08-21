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
      // 백엔드 upload-url은 audio/webm 등 정해진 MIME만 허용 — MediaRecorder가 붙이는
      // "audio/webm;codecs=opus" 접미사를 떼고 기본 타입만 보낸다.
      const contentType = (blob.type || 'audio/webm').split(';')[0];
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
