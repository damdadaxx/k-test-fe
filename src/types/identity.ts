export interface IdCardUploadRequest {
  sessionId: string;
  image: string;
}

export interface IdCardUploadResponse {
  idCardImageUrl: string;
  extractedName?: string;
}

export interface FaceVerifyRequest {
  sessionId: string;
  faceImage: string;
}

export interface FaceVerifyResponse {
  verified: boolean;
  similarity: number;
}

export interface EarDetectionRequest {
  sessionId: string;
  earImage: string;
}

export interface EarDetectionResponse {
  verified: boolean;
  earphoneDetected: boolean;
  message?: string;
}
