import { useMutation } from '@tanstack/react-query';

import { detectEarphone } from '@/lib/api/identity';

import { useSessionStore } from '@/store/sessionStore';

export function useEarDetection(examSessionId: string) {
  const setEarCheckVerified = useSessionStore(
    (state) => state.setEarCheckVerified,
  );

  return useMutation({
    mutationFn: ({
      leftEarImage,
      rightEarImage,
    }: {
      leftEarImage: Blob;
      rightEarImage: Blob;
    }) => detectEarphone({ examSessionId, leftEarImage, rightEarImage }),
    onSuccess: (data) => setEarCheckVerified(!data.earphoneDetected),
  });
}
