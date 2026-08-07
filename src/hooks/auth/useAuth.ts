import { useMutation } from '@tanstack/react-query';

import {
  login,
  signup,
  type LoginRequest,
  type SignupRequest,
} from '@/lib/api/auth';

import { useAuthContext } from '@/providers/AuthProvider';

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (payload: SignupRequest) => signup(payload),
  });
}

export function useAuth() {
  return useAuthContext();
}
