import { useMutation } from '@tanstack/react-query';

import { getIdCardUploadUrl, verifyIdCard } from '@/lib/api/identity';
import { uploadToSignedUrl } from '@/lib/utils/uploadToSignedUrl';

import { useSessionStore } from '@/store/sessionStore';

export function useIdentityVerify(examId: string) {
  // idCardPath는 identity → face-check 라우트 이동을 넘어 유지돼야 해서 스토어에 둔다.
  const idCardPath = useSessionStore((state) => state.idCardPath);
  const setIdCardPath = useSessionStore((state) => state.setIdCardPath);
  const setIdentityVerified = useSessionStore(
    (state) => state.setIdentityVerified,
  );

  const uploadIdCard = useMutation({
    mutationFn: async (file: File) => {
      const { path, signedUrl } = await getIdCardUploadUrl(
        examId,
        'ID_CARD',
        file.type,
      );
      await uploadToSignedUrl(signedUrl, file);
      return path;
    },
    onSuccess: setIdCardPath,
  });

  const verifyFace = useMutation({
    mutationFn: async (faceBlob: Blob) => {
      if (!idCardPath) {
        throw new Error('신분증을 먼저 업로드해주세요.');
      }
      const { path: facePath, signedUrl } = await getIdCardUploadUrl(
        examId,
        'FACE',
        faceBlob.type || 'image/jpeg',
      );
      await uploadToSignedUrl(signedUrl, faceBlob);
      return verifyIdCard({
        examId,
        capturedAt: new Date().toISOString(),
        idCardPath,
        facePath,
      });
    },
    onSuccess: (data) => setIdentityVerified(data.matched),
  });

  return { idCardPath, uploadIdCard, verifyFace };
}
