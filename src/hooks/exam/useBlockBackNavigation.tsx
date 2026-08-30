'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useModal } from '@/providers/ModalProvider';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalBase } from '@/components/common/Modal/ModalBase';

const MESSAGE =
  'You cannot navigate away from the page during the exam. Please use the "다음" or "건너뛰기" buttons.';

// /finish는 시험이 이미 끝난 뒤라 위 문구(응시 중 이탈 금지)가 안 맞음 — 다른 안내로 분기.
const FINISH_MESSAGE =
  'The test is complete. Would you like to go to the My Reports page?';

// 개발용: true면 뒤로가기 차단을 끈다(개발 중 라우트 왕복 편의). 운영에선 false/비움.
const BACK_BLOCK_DISABLED =
  process.env.NEXT_PUBLIC_BACK_BLOCK_DISABLED === 'true';

// 시험 응시 중 브라우저 뒤로가기(popstate) 차단. 항상 더미 history 항목을 현재 위치 위에
// 올려두고, 뒤로가기가 발생하면 다시 push해 현재 페이지를 유지하며 안내 모달을 띄운다.
// pathname마다 재-arm: 문항 이동은 router.replace라 더미 항목이 덮여 사라지므로,
// 이동할 때마다 더미를 다시 심어야 항상 뒤로가기 버퍼가 남는다.
// (전체 이탈/새로고침은 beforeunload가 별도 처리 — ProctorGuard)
export function useBlockBackNavigation() {
  const { openModal, closeModal } = useModal();
  const pathname = usePathname();
  const router = useRouter();
  const isFinishPage = pathname.endsWith('/finish');

  useEffect(() => {
    if (BACK_BLOCK_DISABLED) return;
    window.history.pushState(null, '', window.location.href);

    const onPopState = () => {
      // 뒤로가기 취소: 방금 빠져나간 항목을 다시 채워 현재 위치 유지.
      window.history.pushState(null, '', window.location.href);

      if (isFinishPage) {
        const goToReports = () => {
          closeModal();
          router.push('/my-reports');
        };
        openModal(
          <ModalBase
            onClose={closeModal}
            className="flex w-90 flex-col items-center gap-6 text-center"
          >
            <p className="text-body-lg text-primary">{FINISH_MESSAGE}</p>
            <div className="flex w-full gap-3">
              <ButtonPrimary variant="line" onClick={closeModal}>
                Cancel
              </ButtonPrimary>
              <ButtonPrimary onClick={goToReports}>Confirm</ButtonPrimary>
            </div>
          </ModalBase>,
        );
        return;
      }

      openModal(
        <ModalBase
          onClose={closeModal}
          className="flex w-90 flex-col items-center gap-6 text-center"
        >
          <p className="text-body-lg text-primary">{MESSAGE}</p>
          <ButtonPrimary width={140} onClick={closeModal}>
            Confirm
          </ButtonPrimary>
        </ModalBase>,
      );
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [pathname, isFinishPage, router, openModal, closeModal]);
}
