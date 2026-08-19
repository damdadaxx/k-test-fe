'use client';

import { use } from 'react';

import { useRouter } from 'next/navigation';

import { useIdentityVerify } from '@/hooks/identity/useIdentityVerify';

import { useSessionStore } from '@/store/sessionStore';

import { NextStepButton } from '@/components/common/Footer/NextStepButton';
import StepHeader from '@/components/identity/StepHeader';
import { WebcamCapture } from '@/components/identity/WebcamCapture';

// TODO: AI 서버 배포되면 수정 혹은 개발 테스트용으로 남겨두기
// ponytail: 백엔드 얼굴인증 vendor 다운 시 개발용 우회. .env NEXT_PUBLIC_SKIP_FACE_VERIFY=true.
// vendor 복구되면 플래그 끄면 됨 — 실 대조 로직은 그대로 살아있다.
const SKIP_FACE_VERIFY = process.env.NEXT_PUBLIC_SKIP_FACE_VERIFY === 'true';

export default function FaceCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = use(params);
  const router = useRouter();
  const { verifyFace } = useIdentityVerify(examId);
  const identityVerified = useSessionStore((state) => state.identityVerified);
  const setIdentityVerified = useSessionStore(
    (state) => state.setIdentityVerified,
  );

  // 캡처한 얼굴 → FACE 업로드 → 신분증-얼굴 대조. matched면 Next 활성(스토어 반영).
  const handleVerify = async (faceBlob: Blob) => {
    // TODO: AI 서버 배포되면 수정 혹은 개발 테스트용으로 남겨두기
    if (SKIP_FACE_VERIFY) {
      setIdentityVerified(true);
      return true;
    }
    const result = await verifyFace.mutateAsync(faceBlob);
    return result.matched;
  };

  const handleNext = () => {
    router.push(`/${examId}/ear-check`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 프로그레스 바 */}
      <StepHeader step={1} />

      {/* 웹캠 캡쳐 */}
      <main className="mx-auto flex flex-1 flex-col items-center gap-8 px-6 pt-10">
        <WebcamCapture onVerify={handleVerify} />
      </main>

      {/* 버튼 푸터 섹션 */}
      <footer>
        <NextStepButton
          onClick={handleNext}
          disabled={!identityVerified}
          label="Next"
        />
      </footer>
    </div>
  );
}
