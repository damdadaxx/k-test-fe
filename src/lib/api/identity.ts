import type {
  DetectEarphoneRequest,
  EarphoneDetectResponse,
  GazeCalibrationResponse,
  IdCardFileType,
  UploadUrlResponse,
  VerifyIdCardRequest,
  VerifyIdCardResponse,
} from '@/types/identity';

import { apiClient } from './client';

// 시선 캘리브레이션: 화면 중앙 응시 이미지 여러 장(최대 10)으로 개인 기준값 산출.
// signed URL 없이 바로 multipart 업로드(id-card/earphone과 동일 방식).
export const calibrateGaze = (examId: string, images: Blob[]) => {
  const formData = new FormData();
  formData.append('examId', examId);
  images.forEach((img) =>
    formData.append('calibration_images', img, 'gaze.jpg'),
  );

  return apiClient
    .post<GazeCalibrationResponse>(
      '/verifications/gaze-calibration/calibrate',
      formData,
    )
    .then((res) => res.data);
};

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
