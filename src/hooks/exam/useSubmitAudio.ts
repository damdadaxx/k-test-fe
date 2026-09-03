import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { getAnswerUploadUrl, saveAnswer } from '@/lib/api/exam';
import { uploadToSignedUrl } from '@/lib/utils/uploadToSignedUrl';

// 일시적 실패(네트워크/5xx)만 재시도. 4xx(이미 답안 저장·세션 종료 등)는 영구적이라 재시도 안 함.
const MAX_RETRIES = 2;

function isTransient(error: unknown): boolean {
  const status = axios.isAxiosError(error)
    ? error.response?.status
    : (error as { status?: number } | undefined)?.status;
  return status === undefined || status >= 500;
}

export function useSubmitAudio(sessionId: string, questionId: string) {
  return useMutation({
    retry: (failureCount, error) =>
      failureCount < MAX_RETRIES && isTransient(error),
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
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
      await uploadToSignedUrl(signedUrl, blob, contentType);
      return saveAnswer(sessionId, questionId, {
        audioFileUrl: path,
        durationMs,
      });
    },
  });
}
