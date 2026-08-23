import type { UploadUrlResponse } from '@/types/identity';
import type {
  AnalyzeRecordedEvent,
  AnalyzeResponse,
  ViolationResponse,
  ViolationType,
} from '@/types/proctor';

import { apiClient } from './client';

// 브라우저 감지 위반 신고 (05 B흐름). 응답 sessionStatus로 실격 여부 즉시 판단(재조회 불필요).
export const reportViolation = (
  examSessionId: string,
  violationType: ViolationType,
  meta?: Record<string, unknown>,
) =>
  apiClient
    .post<ViolationResponse>(
      `/exam-sessions/${examSessionId}/monitoring/violations`,
      meta ? { violationType, meta } : { violationType },
    )
    .then((res) => res.data);

// 웹캠 프레임 1장을 서버 AI 분석에 전송 (multipart). 응답 envelope는 인터셉터가 언래핑.
// 서버는 실패해도(모니터링 서비스 꺼짐/타임아웃) "이상 없음" 응답만 주는 설계라
// 시험 진행을 막지 않는다. 404(세션 없음)만 실제 실패.
export const analyzeFrame = (
  examSessionId: string,
  frame: Blob,
  meta: {
    capturedAt: string;
    elapsedMs: number;
    captureSequence: number;
    runIdentityCheck?: boolean;
  },
) => {
  const formData = new FormData();
  formData.append('current_image', frame, 'frame.jpg');
  formData.append('capturedAt', meta.capturedAt);
  formData.append('elapsedMs', String(meta.elapsedMs));
  formData.append('captureSequence', String(meta.captureSequence));

  if (meta.runIdentityCheck) formData.append('runIdentityCheck', 'true');

  return apiClient
    .post<AnalyzeResponse>(
      `/exam-sessions/${examSessionId}/monitoring/analyze`,
      formData,
    )
    .then((res) => res.data);
};

// analyze가 createClip:true를 준 이벤트의 영상 클립 업로드 URL 발급 (05 C흐름 2단계).
// contentType은 video/webm|mp4|quicktime 중 하나. 경로는 서버가 고정 발급.
export const getClipUploadUrl = (
  examSessionId: string,
  eventId: string,
  contentType: string,
) =>
  apiClient
    .post<UploadUrlResponse>(
      `/exam-sessions/${examSessionId}/monitoring/events/${eventId}/clip-upload-url`,
      { contentType },
    )
    .then((res) => res.data);

// signedUrl 업로드 완료 후, 그 경로를 이벤트 로그에 연결 (05 C흐름 4단계).
export const linkClip = (
  examSessionId: string,
  eventId: string,
  clipPath: string,
) =>
  apiClient
    .post<AnalyzeRecordedEvent>(
      `/exam-sessions/${examSessionId}/monitoring/events/${eventId}/clip`,
      { clipPath },
    )
    .then((res) => res.data);
