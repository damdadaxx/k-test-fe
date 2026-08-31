'use client';

import { use, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { getExamSession } from '@/lib/api/exam';
import { calibrateGaze } from '@/lib/api/identity';
import { SECTIONS } from '@/lib/exam/sections';
import { PROCTOR_DISABLED } from '@/lib/proctor/config';
import { captureVideoFrame } from '@/lib/utils/captureVideoFrame';
import { getUserMedia } from '@/lib/utils/getUserMedia';

import { useModal } from '@/providers/ModalProvider';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import LoadingDisplay from '@/components/common/Display/LoadingDisplay';
import { ModalBase } from '@/components/common/Modal/ModalBase';

// 점 응시 3초(안내 문구만) → 5초 카운트다운(5→1, 점 계속 보임) → 시험 진입
// (Figma node 40001256:7944).
const DOT_SECONDS = 3;
const COUNTDOWN_START = 5;

// ponytail: 개발용 우회. 값이 있으면 로그인·본인인증 안 거치고 이 세션 id로 바로 진입.
// .env NEXT_PUBLIC_DEV_SESSION_ID=<INPROGRESS 세션 id>. 운영에선 비워둘 것.
const DEV_SESSION_ID = process.env.NEXT_PUBLIC_DEV_SESSION_ID;

export default function ReadyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 여기 [id] = examSessionId. 세션은 랜딩(Take Test)에서 이미 생성됨 —
  // /ready는 세션을 새로 시작하지 않고 캘리브레이션 후 이 id로 시험에 진입만 한다.
  const { id: sessionId } = use(params);
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  // 시험 진입은 절대 두 번 일어나면 안 된다(카운트다운 재실행 방지) — ref로 1회 보장.
  const startedRef = useRef(false);
  // null = 점 응시 단계, 숫자 = 카운트다운 남은 초.
  const [count, setCount] = useState<number | null>(null);
  // 캘리브레이션 실패 후 재시도할 때마다 증가 — 점 응시부터 다시 시작시키는 트리거.
  const [cycleKey, setCycleKey] = useState(0);

  // 시선 캘리브레이션용: 카운트다운 동안 캡처한 중앙 응시 이미지들.
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const calibrationImagesRef = useRef<Blob[]>([]);

  // 중앙 응시 프레임 1장 캡처해 캘리브레이션 이미지 배열에 담는다.
  const captureCalibrationFrame = async () => {
    const blob = await captureVideoFrame(videoRef.current);
    if (blob) calibrationImagesRef.current.push(blob);
  };

  // 본인인증 미완료 안내 → 확인 시 본인인증 처음부터 다시.
  const showNotVerifiedModal = () => {
    const backToIdentity = () => {
      closeModal();
      router.replace(`/${sessionId}/identity`);
    };
    openModal(
      <ModalBase
        onClose={backToIdentity}
        className="flex w-90 flex-col items-center gap-6 text-center"
      >
        {/* 본인인증이 아직 완료되지 않았습니다. 본인인증을 다시 진행해주세요. */}
        <p className="text-body-lg text-primary">
          Identity verification is not yet complete. <br />
          Please try verifying your identity again.
        </p>
        <ButtonPrimary width={140} onClick={backToIdentity}>
          Confirm
        </ButtonPrimary>
      </ModalBase>,
    );
  };

  // (신규 2026-08-29) 시선 캘리브레이션 실패 안내 → 재시도 시 점 응시부터 다시.
  const showCalibrationFailedModal = () => {
    const retry = async () => {
      closeModal();
      calibrationImagesRef.current = [];
      startedRef.current = false;
      // 카메라 권한 거부 등으로 스트림이 아직 없으면 재시도 클릭(유저 제스처)에 맞춰 재요청.
      if (!streamRef.current) {
        try {
          const stream = await getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
          // 여전히 거부됨 — 캡처 이미지 0장으로 다음 시도도 바로 실패하고 이 모달이 다시 뜬다.
        }
      }
      setCount(null);
      setCycleKey((k) => k + 1);
    };
    openModal(
      <ModalBase
        onClose={retry}
        className="flex w-90 flex-col items-center gap-6 text-center"
      >
        {/* 시선 캘리브레이션에 실패했습니다. 다시 시도해주세요. */}
        <p className="text-body-lg text-primary">
          Gaze calibration failed. <br />
          Please try again.
        </p>
        <ButtonPrimary width={140} onClick={retry}>
          Retry
        </ButtonPrimary>
      </ModalBase>,
    );
  };

  // 카운트다운이 끝나면(0) 시선 캘리브레이션 → verified 확인 → 시험 진입.
  const enterTestOnce = async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    // (신규) 시선 캘리브레이션이 본인인증·이어폰 확인과 동급의 필수 게이트 — 안 해두면
    // verified가 true로 안 바뀌므로, 실패 시 진행시키지 않고 재시도시킨다(과거엔 best-effort로
    // 실패를 삼키고 진행했음).
    const images = calibrationImagesRef.current;
    if (!PROCTOR_DISABLED) {
      if (images.length === 0) {
        showCalibrationFailedModal();
        return;
      }
      try {
        await calibrateGaze(sessionId, images);
      } catch {
        showCalibrationFailedModal();
        return;
      }
    }

    if (DEV_SESSION_ID) {
      router.replace(
        `/${DEV_SESSION_ID}/testing/${SECTIONS[0].moduleId}/intro`,
      );
      return;
    }

    // testing 진입은 verified 된 세션만 — 본인인증/이어폰이 실제로 끝났는지 여기서 최종 확인.
    try {
      const session = await getExamSession(sessionId);
      if (session.verified) {
        router.replace(`/${sessionId}/testing/${SECTIONS[0].moduleId}/intro`);
        return;
      }
    } catch {
      // 세션 상태 조회 실패 — verified 미확인 상태와 동일하게 처리(안전 우선).
    }
    showNotVerifiedModal();
  };

  // 시선 캘리브레이션용 웹캠 확보(카운트다운 동안 중앙 응시 이미지 캡처). 운영에선 PROCTOR_DISABLED=false.
  useEffect(() => {
    if (PROCTOR_DISABLED) return;

    let cancelled = false;

    const requestCamera = async () => {
      try {
        const stream = await getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (cancelled) return;
        // 카메라 없이는 캘리브레이션 이미지를 못 찍어 뒤에서 실패 처리(재시도 모달)로 이어진다.
        // 여기선 권한이 왜 필요한지 먼저 안내만 한다(1회).
        openModal(
          <ModalBase
            onClose={closeModal}
            className="flex w-90 flex-col items-center gap-6 text-center"
          >
            {/* 시험을 시작하기 위해 카메라와 마이크 권한이 필요합니다. 원활한
              진행을 위해 권한을 허용해 주세요. */}
            <p className="text-body-lg text-primary">
              Camera and microphone permissions are required to start the exam.
              <br />
              Please allow access for a smooth experience.
            </p>
            <ButtonPrimary width={140} onClick={closeModal}>
              Confirm
            </ButtonPrimary>
          </ModalBase>,
        );
      }
    };

    // 카메라 요청은 1회만(재요청 없음).
    void requestCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      closeModal();
    };
  }, [openModal, closeModal]);

  // 점 응시 화면을 DOT_SECONDS 동안 보여준 뒤 카운트다운 시작.
  // cycleKey가 바뀌면(캘리브레이션 실패 후 재시도) 점 응시부터 다시 시작한다.
  useEffect(() => {
    const timer = setTimeout(
      () => setCount(COUNTDOWN_START),
      DOT_SECONDS * 1000,
    );
    return () => clearTimeout(timer);
  }, [cycleKey]);

  // 카운트다운: 1초마다 감소하며 중앙 응시 프레임 캡처, 0에 닿으면 캘리브레이션+시험 진입.
  useEffect(() => {
    if (count === null) return;
    if (count <= 0) {
      void enterTestOnce();
      return;
    }
    void captureCalibrationFrame();
    const timer = setTimeout(() => setCount((prev) => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const isDot = count === null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 시선 캘리브레이션 캡처용(화면엔 안 보임). */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="pointer-events-none fixed size-px opacity-0"
      />
      <main className="relative flex flex-1 flex-col items-center">
        {isDot ? (
          <p className="mt-39 text-title-lg tracking-[-0.64px] text-icon-90 text-center">
            Preparation is complete. Please look at the dot below.
          </p>
        ) : (
          count !== 0 && (
            <div className="mt-39 flex flex-col items-center gap-3">
              <p className="text-title-lg tracking-[-0.64px] text-icon-90">
                {count}
              </p>
              <p className="text-title-md font-normal text-icon-50">
                The test will now begin.
              </p>
            </div>
          )
        )}

        {/* 점은 점 응시 단계부터 카운트다운 내내 같은 위치에 계속 보임(0에서만 로딩으로 교체). */}
        {count === 0 ? (
          // 카운트 종료 → 캘리브레이션 전송 대기 로딩.
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LoadingDisplay fullHeight={false} />
          </div>
        ) : (
          <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        )}
      </main>
    </div>
  );
}
