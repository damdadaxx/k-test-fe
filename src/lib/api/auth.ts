import { apiClient } from './client';

export type UserRole = 'USER' | 'ADMIN';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  email: string;
  role: UserRole;
}

export interface CheckEmailResponse {
  available: boolean;
}

export interface SendEmailCodeRequest {
  email: string;
}

export interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

export type IdType = 'PASSPORT' | 'ARC';

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nationality: string;
  birthDate: string;
  idType: IdType;
  idNumber: string;
  companyCode?: string;
  agreedToTerms: boolean;
  agreedToPrivacyPolicy: boolean;
  agreedToPassportProcessing: boolean;
  agreedToVoiceDataAiTraining?: boolean;
}

export interface AdminSignInRequest {
  email: string;
  password: string;
}

export interface MeResponse {
  id: string;
  email: string;
  role: UserRole;
}

export const checkEmail = (email: string) =>
  apiClient
    .get<CheckEmailResponse>('/auth/check-email', { params: { email } })
    .then((res) => res.data);

// 회원가입 1단계: 이메일 인증번호 발송 (최초 발송/재발송 공용)
export const sendEmailCode = (payload: SendEmailCodeRequest) =>
  apiClient
    .post<void>('/auth/email/send-code', payload)
    .then((res) => res.data);

// 회원가입 2단계: 이메일 인증번호 확인
export const verifyEmailCode = (payload: VerifyEmailCodeRequest) =>
  apiClient.post<void>('/auth/email/verify', payload).then((res) => res.data);

export const signIn = (payload: SignInRequest) =>
  apiClient
    .post<AuthResponse>('/auth/sign-in', payload)
    .then((res) => res.data);

export const signUp = (payload: SignUpRequest) =>
  apiClient
    .post<AuthResponse>('/auth/sign-up', payload)
    .then((res) => res.data);

export const adminSignIn = (payload: AdminSignInRequest) =>
  apiClient
    .post<AuthResponse>('/auth/admin/sign-in', payload)
    .then((res) => res.data);

export const getMe = () =>
  apiClient.get<MeResponse>('/auth/me').then((res) => res.data);
