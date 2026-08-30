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
    // (신규) inspectionComplete:false(정면 응시 등으로 판정 불완전)면 earphoneDetected를
    // 신뢰할 수 없으므로 통과로 치지 않는다 — 둘 다 만족해야 통과.
    onSuccess: (data) =>
      setEarCheckVerified(data.inspectionComplete && !data.earphoneDetected),
  });
}
