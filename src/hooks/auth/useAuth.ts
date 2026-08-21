import { useMutation } from '@tanstack/react-query';

import {
  checkEmail,
  sendEmailCode,
  signIn,
  signUp,
  verifyEmailCode,
  type AuthResponse,
  type SendEmailCodeRequest,
  type SignInRequest,
  type SignUpRequest,
  type VerifyEmailCodeRequest,
} from '@/lib/api/auth';
import { clearTokens, setTokens } from '@/lib/auth/tokenStorage';

function persistAuth(data: AuthResponse) {
  setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    role: data.role,
  });
}

export function signOut() {
  clearTokens();
}

export function useSignIn() {
  return useMutation({
    mutationFn: (payload: SignInRequest) => signIn(payload),
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

export function useSendEmailCode() {
  return useMutation({
    mutationFn: (payload: SendEmailCodeRequest) => sendEmailCode(payload),
  });
}

export function useVerifyEmailCode() {
  return useMutation({
    mutationFn: (payload: VerifyEmailCodeRequest) => verifyEmailCode(payload),
  });
}
