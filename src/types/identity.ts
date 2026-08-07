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
