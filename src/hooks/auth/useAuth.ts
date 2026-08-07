import { useMutation } from '@tanstack/react-query';

import {
  adminSignIn,
  checkEmail,
  signIn,
  signUp,
  type AdminSignInRequest,
  type AuthResponse,
  type SignInRequest,
  type SignUpRequest,
} from '@/lib/api/auth';

function persistAuth(data: AuthResponse) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('role', data.role);
}

export function signOut() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
}

export function useSignIn() {
  return useMutation({
    mutationFn: (payload: SignInRequest) => signIn(payload),
    onSuccess: persistAuth,
  });
}

export function useAdminSignIn() {
  return useMutation({
    mutationFn: (payload: AdminSignInRequest) => adminSignIn(payload),
    onSuccess: persistAuth,
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (payload: SignUpRequest) => signUp(payload),
    onSuccess: persistAuth,
  });
}

export function useCheckEmail() {
  return useMutation({
    mutationFn: (email: string) => checkEmail(email),
  });
}
