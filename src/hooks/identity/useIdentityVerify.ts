import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { getIdCardUploadUrl, verifyIdCard } from '@/lib/api/identity';
import { uploadToSignedUrl } from '@/lib/utils/uploadToSignedUrl';

import { useSessionStore } from '@/store/sessionStore';

export function useIdentityVerify(examId: string) {
  const [idCardPath, setIdCardPath] = useState<string | null>(null);
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
