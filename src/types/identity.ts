export type IdCardFileType = 'ID_CARD' | 'FACE';

export interface UploadUrlResponse {
  path: string;
  signedUrl: string;
  token: string;
}

export interface VerifyIdCardRequest {
  examSessionId: string;
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
  examSessionId: string;
  leftEarImage: Blob;
  rightEarImage: Blob;
}

// (신규 2026-08-29) inspectionComplete:false면 정면을 보고 있어 귀가 안 보이는 등
// 자세 문제로 판정 자체가 불완전한 것 — 이때 earphoneDetected 값은 신뢰하면 안 됨.
export interface EarphoneDetectResponse {
  earphoneDetected: boolean;
  leftEarDetected: boolean;
  rightEarDetected: boolean;
  inspectionComplete: boolean;
  leftEarVisible: boolean;
  rightEarVisible: boolean;
  leftYaw: number;
  rightYaw: number;
  yawThreshold: number;
  message: string;
}

// POST /verifications/gaze-calibration/calibrate 응답. 로컬(REQUIRE_MONITORING_SERVICE=false)은
// AI 통신 실패해도 calibrated:false 중립 201로 내려온다.
// (신규 2026-08-29) headYawCenter/headPitchCenter 추가 — 프런트는 값을 직접 쓰지 않고
// 캘리브레이션이 정상적으로 끝났는지 확인용으로만 참고.
export interface GazeCalibrationResponse {
  calibrated: boolean;
  sampleCount: number;
  eyeYawCenter: number;
  eyePitchCenter: number;
  headYawCenter: number;
  headPitchCenter: number;
}
