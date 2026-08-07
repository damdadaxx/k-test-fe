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
}

export interface AdminSignInRequest {
  email: string;
  password: string;
}

export const checkEmail = (email: string) =>
  apiClient
    .get<CheckEmailResponse>('/auth/check-email', { params: { email } })
    .then((res) => res.data);

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
