'use client';

import { useEffect, useRef } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { getExamSession } from '@/lib/api/exam';

import { useModal } from '@/providers/ModalProvider';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalBase } from '@/components/common/Modal/ModalBase';

// 종료/차단 세션 진입 시 보여줄 안내 문구.
const STATUS_MESSAGE: Record<string, string> = {
  BLOCKED: '반복적인 재접속으로 시험 응시가 제한되었습니다.',
  DISQUALIFIED: '부정행위가 감지되어 시험이 실격 처리되었습니다.',
  SUBMITTED: '이미 종료된 시험입니다.',
  EXPIRED: '이미 종료된 시험입니다.',
};

// ponytail: 개발용. 켜면 진입 가드(종료/차단 세션 차단)를 건너뛴다 —
// BLOCKED 세션으로도 시험 흐름 테스트 가능. 운영에선 비움.
const DEV_SKIP_SESSION_GUARD =
  process.env.NEXT_PUBLIC_DEV_SKIP_SESSION_GUARD === 'true';

// 시험 세션 화면 진입 시 상태를 확인해, INPROGRESS가 아니거나 접근 불가면
// 안내 모달을 띄우고 회차 목록으로 돌려보낸다.
export function useExamSessionGuard(sessionId: string) {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const shownRef = useRef(false);
  const { data, isError } = useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => getExamSession(sessionId),
    retry: false,
    enabled: !DEV_SKIP_SESSION_GUARD,
  });

  useEffect(() => {
    if (DEV_SKIP_SESSION_GUARD || shownRef.current) return;

    const blockedStatus =
      data && data.status !== 'INPROGRESS' ? data.status : null;
    if (!blockedStatus && !isError) return;

    shownRef.current = true;
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
          {blockedStatus
            ? (STATUS_MESSAGE[blockedStatus] ?? '이미 종료된 시험입니다.')
            : '시험 세션에 접근할 수 없습니다.'}
        </p>
        <ButtonPrimary width={140} onClick={backToExams}>
          확인
        </ButtonPrimary>
      </ModalBase>,
    );
    // 진입 시 1회 판정 — data/isError 변화에만 반응.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isError]);
}
