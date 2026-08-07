import { useMutation } from '@tanstack/react-query';

import { detectEarphone } from '@/lib/api/identity';

import { useSessionStore } from '@/store/sessionStore';

export function useEarDetection(examId: string) {
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
    }) => detectEarphone({ examId, leftEarImage, rightEarImage }),
    onSuccess: (data) => setEarCheckVerified(!data.earphoneDetected),
  });
}
