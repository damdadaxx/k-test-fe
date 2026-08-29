import type { StaticImageData } from 'next/image';

import IcViolationDualMonitor from '@/app/assets/icons/icon_violation_dual_monitor.svg';
import IcViolationEyeGaze from '@/app/assets/icons/icon_violation_eye_gaze.svg';
import IcViolationTabSwitch from '@/app/assets/icons/icon_violation_tab_switch.svg';

type ViolationInfo = {
  label: string;
  icon?: StaticImageData;
  message: (count: number) => string;
};

function times(count: number) {
  return count === 1 ? '1 time' : `${count} times`;
}

// eventType은 브라우저 감지(고정 6종, ProctorGuard) + AI 웹캠 분석(anti-cheat 벤더가 계속
// 늘릴 수 있는 개방형 문자열, 백엔드 스펙상 고정 enum 아님) 혼재. 여기 없는 타입은
// getViolationInfo의 폴백(제네릭 문구, 아이콘 없음)으로 처리한다 — Figma에 디자인된 3종
// (DUAL_MONITOR/TAB_SWITCH/EYE_GAZE_AWAY)만 전용 아이콘 보유.
const VIOLATION_INFO: Record<string, ViolationInfo> = {
  DUAL_MONITOR: {
    label: 'Dual Monitor',
    icon: IcViolationDualMonitor,
    message: (n) =>
      `An additional external monitor was detected ${times(n)} during the test.`,
  },
  TAB_SWITCH: {
    label: 'Tab Switch',
    icon: IcViolationTabSwitch,
    message: (n) =>
      `You moved to another tab or window ${times(n)} during the test.`,
  },
  EYE_GAZE_AWAY: {
    label: 'Eye Gaze Away',
    icon: IcViolationEyeGaze,
    message: (n) =>
      `Your gaze moved away from the screen ${times(n)} during the test.`,
  },
  BLUR: {
    label: 'Window Blur',
    message: (n) => `Window focus was lost ${times(n)} during the test.`,
  },
  WINDOW_CLOSE_ATTEMPT: {
    label: 'Window Close Attempt',
    message: (n) =>
      `You attempted to close the window ${times(n)} during the test.`,
  },
  MOUSE_LEAVE: {
    label: 'Mouse Leave',
    message: (n) =>
      `Your mouse left the exam screen ${times(n)} during the test.`,
  },
  PASTE: {
    label: 'Paste',
    message: (n) => `You attempted to paste ${times(n)} during the test.`,
  },
  FACE_OUT_OF_FRAME: {
    label: 'Face Out Of Frame',
    message: (n) => `Your face was out of frame ${times(n)} during the test.`,
  },
  PHONE_DETECTED: {
    label: 'Phone Detected',
    message: (n) => `A phone was detected ${times(n)} during the test.`,
  },
};

export function getViolationInfo(eventType: string): ViolationInfo {
  return (
    VIOLATION_INFO[eventType] ?? {
      label: eventType.replace(/_/g, ' '),
      message: (n) => `This was detected ${times(n)} during the test.`,
    }
  );
}
