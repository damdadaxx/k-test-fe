'use client';

import { use, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import IcArrowLeft from '@/app/assets/icons/icon_arrow_left.svg';

import { getErrorMessage } from '@/lib/api/client';
import { SECTIONS } from '@/lib/exam/sections';

import { useModal } from '@/providers/ModalProvider';

import { useStartExamSession } from '@/hooks/exam/useExams';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import LoadingDisplay from '@/components/common/Display/LoadingDisplay';
import { ModalBase } from '@/components/common/Modal/ModalBase';
import ProgressBar from '@/components/common/ProgressBar/ProgressBar';

// 점 응시 5초 → 5초 카운트다운(5→1) → 세션 시작 (Figma 시험 시작전 플로우).
const DOT_SECONDS = 5;
const COUNTDOWN_START = 5;

// ponytail: 개발용 우회. 값이 있으면 POST /exams/:id/sessions를 건너뛰고 이 examSessionId로
// 바로 진입 — 반복 세션시작으로 재개 카운트가 쌓여 BLOCKED 되는 걸 막는다.
// .env NEXT_PUBLIC_DEV_SESSION_ID=<INPROGRESS 세션 id>. 운영에선 비워둘 것.
const DEV_SESSION_ID = process.env.NEXT_PUBLIC_DEV_SESSION_ID;

export default function ReadyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 여기 [id]는 examId (ear-check에서 /${examId}/ready로 넘어옴).
  const { id: examId } = use(params);
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const startSession = useStartExamSession();
  // 세션 시작은 절대 두 번 호출되면 안 된다(재개 남용 카운트 소모) — ref로 1회 보장.
  const startedRef = useRef(false);
  // null = 점 응시 단계, 숫자 = 카운트다운 남은 초.
  const [count, setCount] = useState<number | null>(null);

  // 카운트다운이 끝나면(0) 세션 시작 → 성공 시 intro, 실패 시 안내 모달 후 /exams.
  const startSessionOnce = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    // 개발 우회: 세션시작 호출 없이 고정 세션으로 바로 진입(재개 카운트 소모 안 함).
    if (DEV_SESSION_ID) {
      router.replace(
        `/${DEV_SESSION_ID}/testing/${SECTIONS[0].moduleId}/intro`,
      );
      return;
    }

    startSession.mutate(examId, {
      onSuccess: (data) => {
        router.replace(
          `/${data.examSessionId}/testing/${SECTIONS[0].moduleId}/intro`,
        );
      },
      onError: (error) => {
        // 신청 안 함/본인인증 미완료/응시 기간 아님/종료된 시험/재접속 차단 등.
        const backToExams = () => {
          closeModal();
          router.replace('/exams');
        };
        openModal(
          <ModalBase
            onClose={backToExams}
            className="flex w-90 flex-col items-center gap-6 text-center"
          >
            <p className="text-body-lg text-primary">
              {getErrorMessage(error, '시험을 시작할 수 없습니다.')}
            </p>
            <ButtonPrimary width={140} onClick={backToExams}>
              확인
            </ButtonPrimary>
          </ModalBase>,
        );
      },
    });
  };

  // 점 응시 화면을 DOT_SECONDS 동안 보여준 뒤 카운트다운 시작.
  useEffect(() => {
    const timer = setTimeout(
      () => setCount(COUNTDOWN_START),
      DOT_SECONDS * 1000,
    );
    return () => clearTimeout(timer);
  }, []);

  // 카운트다운: 1초마다 감소, 0에 닿으면 세션 시작.
  useEffect(() => {
    if (count === null) return;
    if (count <= 0) {
      startSessionOnce();
      return;
    }
    const timer = setTimeout(() => setCount((prev) => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const isDot = count === null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="relative flex flex-1 flex-col items-center">
        <p className="mt-[52px] text-title-lg tracking-[-0.64px] text-icon-90">
          {isDot
            ? 'Preparation is complete. Please look at the dot below.'
            : 'The test will now begin.'}
        </p>

        {isDot ? (
          <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        ) : count === 0 ? (
          // 카운트 종료 → 세션 시작 요청 대기 로딩.
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LoadingDisplay fullHeight={false} />
          </div>
        ) : (
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] font-bold tracking-[-2px] text-black">
            {count}
          </p>
        )}
      </main>
    </div>
  );
}
