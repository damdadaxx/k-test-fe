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
// 인증류는 이제 examId가 아니라 examSessionId 기준.
// examSessionId = 응시 시도 1건(재응시하면 새 세션이 생성되고, 인증도 세션별로 다시 기록).
export const calibrateGaze = (examSessionId: string, images: Blob[]) => {
  const formData = new FormData();
  formData.append('examSessionId', examSessionId);
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
  examSessionId: string,
  fileType: IdCardFileType,
  contentType: string,
) =>
  apiClient
    .post<UploadUrlResponse>('/verifications/id-card/upload-url', {
      examSessionId,
      fileType,
      contentType,
    })
    .then((res) => res.data);

export const verifyIdCard = (payload: VerifyIdCardRequest) =>
  apiClient
    .post<VerifyIdCardResponse>('/verifications/id-card/verify', payload)
    .then((res) => res.data);

export const detectEarphone = ({
  examSessionId,
  leftEarImage,
  rightEarImage,
}: DetectEarphoneRequest) => {
  const formData = new FormData();
  formData.append('examSessionId', examSessionId);
  formData.append('left_ear_image', leftEarImage);
  formData.append('right_ear_image', rightEarImage);

  return apiClient
    .post<EarphoneDetectResponse>('/verifications/earphone/detect', formData)
    .then((res) => res.data);
};
