import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export const login = (payload: LoginRequest) =>
  apiClient.post<LoginResponse>('/auth/login', payload).then((res) => res.data);

export const signup = (payload: SignupRequest) =>
  apiClient.post<LoginResponse>('/auth/sign', payload).then((res) => res.data);
