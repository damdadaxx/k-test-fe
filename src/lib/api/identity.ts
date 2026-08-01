import type {
  EarDetectionRequest,
  EarDetectionResponse,
  FaceVerifyRequest,
  FaceVerifyResponse,
  IdCardUploadRequest,
  IdCardUploadResponse,
} from '@/types/identity';

import { apiClient } from './client';

export const uploadIdCard = (payload: IdCardUploadRequest) =>
  apiClient
    .post<IdCardUploadResponse>('/identity/upload', payload)
    .then((res) => res.data);

export const verifyFace = (payload: FaceVerifyRequest) =>
  apiClient
    .post<FaceVerifyResponse>('/identity/verify', payload)
    .then((res) => res.data);

export const detectEar = (payload: EarDetectionRequest) =>
  apiClient
    .post<EarDetectionResponse>('/identity/ear-check', payload)
    .then((res) => res.data);
