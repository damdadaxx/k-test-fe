import { useMutation } from '@tanstack/react-query';

import { detectEar } from '@/lib/api/identity';

import { useSessionStore } from '@/store/sessionStore';

export function useEarDetection() {
  const setEarCheckVerified = useSessionStore(
    (state) => state.setEarCheckVerified,
  );

  return useMutation({
    mutationFn: detectEar,
    onSuccess: (data) =>
      setEarCheckVerified(data.verified && !data.earphoneDetected),
  });
}
