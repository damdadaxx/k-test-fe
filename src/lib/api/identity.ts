import type {
  DetectEarphoneRequest,
  EarphoneDetectResponse,
  IdCardFileType,
  UploadUrlResponse,
  VerifyIdCardRequest,
  VerifyIdCardResponse,
} from '@/types/identity';

import { apiClient } from './client';

export const getIdCardUploadUrl = (
  examId: string,
  fileType: IdCardFileType,
  contentType: string,
) =>
  apiClient
    .post<UploadUrlResponse>('/verifications/id-card/upload-url', {
      examId,
      fileType,
      contentType,
    })
    .then((res) => res.data);

export const verifyIdCard = (payload: VerifyIdCardRequest) =>
  apiClient
    .post<VerifyIdCardResponse>('/verifications/id-card/verify', payload)
    .then((res) => res.data);

export const detectEarphone = ({
  examId,
  leftEarImage,
  rightEarImage,
}: DetectEarphoneRequest) => {
  const formData = new FormData();
  formData.append('examId', examId);
  formData.append('left_ear_image', leftEarImage);
  formData.append('right_ear_image', rightEarImage);

  return apiClient
    .post<EarphoneDetectResponse>('/verifications/earphone/detect', formData)
    .then((res) => res.data);
};
