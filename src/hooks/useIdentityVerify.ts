import { useMutation } from '@tanstack/react-query';

import { uploadIdCard, verifyFace } from '@/lib/api/identity';

import { useSessionStore } from '@/store/sessionStore';

export function useIdCardUpload() {
  return useMutation({
    mutationFn: uploadIdCard,
  });
}

export function useFaceVerify() {
  const setIdentityVerified = useSessionStore(
    (state) => state.setIdentityVerified,
  );

  return useMutation({
    mutationFn: verifyFace,
    onSuccess: (data) => setIdentityVerified(data.verified),
  });
}
