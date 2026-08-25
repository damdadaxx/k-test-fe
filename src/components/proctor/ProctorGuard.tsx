'use client';

import { useEffect, useRef } from 'react';

import axios from 'axios';
import { useRouter } from 'next/navigation';

import type { ViolationResponse, ViolationType } from '@/types/proctor';

import { reportViolation } from '@/lib/api/monitoring';
import { PROCTOR_DISABLED, PROCTOR_GUARD_DISABLED } from '@/lib/proctor/config';

import { useModal } from '@/providers/ModalProvider';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import { ModalBase } from '@/components/common/Modal/ModalBase';

// 듀얼 모니터 감지 주기 (PDF: 30초 간격).
const DUAL_MONITOR_INTERVAL_MS = 30000;
// 일시적 실패(네트워크/5xx)만 재시도. 4xx(409 종료·403·404·400)는 영구적이라 재시도 안 함.
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
// 포커스 상실(탭 전환/앱 전환)은 blur와 visibilitychange가 동시 발화 → 이 창 안이면 1건으로 합침.
const FOCUS_COALESCE_MS = 50;
// 마우스 이탈: 잠깐 벗어난 건 무시(지속), 신고 후 일정 시간은 재신고 안 함(쓰로틀).
const MOUSE_LEAVE_SUSTAIN_MS = 3000;
const MOUSE_LEAVE_THROTTLE_MS = 30000;

const WARNING: Record<ViolationType, string> = {
  TAB_SWITCH: '탭 이탈이 감지되었습니다. 시험 화면을 유지해주세요.',
  BLUR: '창 전환이 감지되었습니다. 시험 화면을 유지해주세요.',
  WINDOW_CLOSE_ATTEMPT: '시험 중에는 창을 닫을 수 없습니다.',
  MOUSE_LEAVE: '마우스가 화면을 벗어났습니다.',
  PASTE: '붙여넣기는 허용되지 않습니다.',
  DUAL_MONITOR: '듀얼 모니터가 감지되었습니다. 하나의 화면만 사용해주세요.',
};

/**
 * 시험 세션 레이아웃에 전역 마운트. 브라우저 부정행위 이벤트를 감지해 신고하고,
 * 같은 종류 2회 누적으로 실격(sessionStatus=DISQUALIFIED)되면 결과 화면으로 보낸다.
 */
export function ProctorGuard({ examSessionId }: { examSessionId: string }) {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  // 실격 확정 or 세션 종료(409) 시 이후 신고를 멈춘다.
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (PROCTOR_DISABLED || PROCTOR_GUARD_DISABLED) return;

    const showWarning = (type: ViolationType) => {
      openModal(
        <ModalBase
          onClose={closeModal}
          className="flex w-90 flex-col items-center gap-6 text-center"
        >
          <p className="text-body-lg text-primary">{WARNING[type]}</p>
          <ButtonPrimary width={140} onClick={closeModal}>
            확인
          </ButtonPrimary>
        </ModalBase>,
      );
    };

    // 일시적 실패(네트워크/5xx)만 제한 재시도. 4xx는 영구적이라 즉시 포기.
    // 409(세션 종료)면 이후 신고 자체를 멈춘다. 성공/포기 결과(또는 null)를 돌려준다.
    const sendWithRetry = async (
      type: ViolationType,
      meta: Record<string, unknown> | undefined,
      attempt = 0,
    ): Promise<ViolationResponse | null> => {
      try {
        return await reportViolation(examSessionId, type, meta);
      } catch (err) {
        const status = axios.isAxiosError(err)
          ? err.response?.status
          : undefined;

        if (status === 409) stoppedRef.current = true; // 종료된 세션 — 신고 중단

        const transient = status === undefined || status >= 500;

        if (transient && attempt < MAX_RETRIES && !stoppedRef.current) {
          await new Promise((r) =>
            setTimeout(r, RETRY_DELAY_MS * (attempt + 1)),
          );
          return sendWithRetry(type, meta, attempt + 1);
        }

        return null; // 영구 실패/재시도 소진 — 시험 진행은 막지 않는다.
      }
    };

    const report = async (
      type: ViolationType,
      meta?: Record<string, unknown>,
    ) => {
      if (stoppedRef.current) return;

      showWarning(type);

      const res = await sendWithRetry(type, meta);

      if (res?.sessionStatus === 'DISQUALIFIED') {
        stoppedRef.current = true;
        router.replace(`/${examSessionId}/finish?status=disqualified`);
      }
    };

    // (2) 탭 전환은 blur+visibilitychange가 같이 뜨므로 짧은 창으로 합쳐 1건만 신고.
    // 창이 끝날 때 document.hidden으로 종류 결정(숨김=TAB_SWITCH, 아니면 앱 전환=BLUR).
    let focusTimer: ReturnType<typeof setTimeout> | null = null;
    const onFocusLoss = () => {
      if (focusTimer) return;
      focusTimer = setTimeout(() => {
        focusTimer = null;
        report(document.hidden ? 'TAB_SWITCH' : 'BLUR');
      }, FOCUS_COALESCE_MS);
    };

    // (3) 마우스 이탈: 3초 이상 지속돼야 신고하고(잠깐 벗어남 무시), 신고 후 30초는 재신고 안 함.
    let mouseLeaveTimer: ReturnType<typeof setTimeout> | null = null;
    let lastMouseLeaveReportAt = 0;
    const onMouseLeave = () => {
      if (mouseLeaveTimer) return;
      mouseLeaveTimer = setTimeout(() => {
        mouseLeaveTimer = null;
        if (Date.now() - lastMouseLeaveReportAt < MOUSE_LEAVE_THROTTLE_MS)
          return;
        lastMouseLeaveReportAt = Date.now();
        report('MOUSE_LEAVE');
      }, MOUSE_LEAVE_SUSTAIN_MS);
    };
    const onMouseEnter = () => {
      if (mouseLeaveTimer) {
        clearTimeout(mouseLeaveTimer);
        mouseLeaveTimer = null;
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      report('PASTE');
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // 브라우저 기본 확인창 + 신고(best-effort).
      // preventDefault()는 Chromium/Firefox용. Safari 등은 returnValue 세팅에 의존하므로
      // deprecated 경고를 억제하고 둘 다 둔다(크로스 브라우저 확인창 보장).
      e.preventDefault();
      // deprecated로 마킹된 BeforeUnloadEvent.returnValue를 피해 캐스팅으로 세팅.
      (e as { returnValue: string }).returnValue = '';
      report('WINDOW_CLOSE_ATTEMPT');
    };
    // window.screen.isExtended는 표준 타입에 아직 없어 선택적으로 접근.
    const isExtended = () =>
      (window.screen as Screen & { isExtended?: boolean }).isExtended === true;
    const dualMonitorTimer = setInterval(() => {
      if (isExtended()) report('DUAL_MONITOR', { screens: 2 });
    }, DUAL_MONITOR_INTERVAL_MS);

    document.addEventListener('visibilitychange', onFocusLoss);
    window.addEventListener('blur', onFocusLoss);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('paste', onPaste);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onFocusLoss);
      window.removeEventListener('blur', onFocusLoss);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('paste', onPaste);
      window.removeEventListener('beforeunload', onBeforeUnload);
      clearInterval(dualMonitorTimer);
      if (focusTimer) clearTimeout(focusTimer);
      if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
      closeModal();
    };
  }, [examSessionId, router, openModal, closeModal]);

  // 경고는 모달(ModalProvider)로 띄우므로 자체 렌더는 없음.
  return null;
}
