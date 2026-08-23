export type IdCardFileType = 'ID_CARD' | 'FACE';

export interface UploadUrlResponse {
  path: string;
  signedUrl: string;
  token: string;
}

export interface VerifyIdCardRequest {
  examId: string;
  capturedAt: string;
  idCardPath: string;
  facePath: string;
}

export interface VerifyIdCardResponse {
  matched: boolean;
  confidence: number;
  faceVerified: boolean;
  similarity: number;
  applicantVerified: boolean;
  message: string;
}

export interface DetectEarphoneRequest {
  examId: string;
  leftEarImage: Blob;
  rightEarImage: Blob;
}

export interface EarphoneDetectResponse {
  earphoneDetected: boolean;
  leftEarDetected: boolean;
  rightEarDetected: boolean;
  message: string;
}

// POST /verifications/gaze-calibration/calibrate 응답. 로컬(REQUIRE_MONITORING_SERVICE=false)은
// AI 통신 실패해도 calibrated:false 중립 201로 내려온다.
export interface GazeCalibrationResponse {
  calibrated: boolean;
  sampleCount: number;
  eyeYawCenter: number;
  eyePitchCenter: number;
}
