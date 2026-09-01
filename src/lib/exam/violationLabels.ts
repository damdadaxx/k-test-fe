type ViolationInfo = {
  label: string;
  message: (count: number) => string;
};

function times(count: number) {
  return count === 1 ? '1 time' : `${count} times`;
}

// eventType은 브라우저 감지(고정 6종, ProctorGuard) + AI 웹캠 분석(anti-cheat 벤더가 계속
// 늘릴 수 있는 개방형 문자열, 백엔드 스펙상 고정 enum 아님) 혼재. 여기 없는 타입은
// getViolationInfo의 폴백(제네릭 문구)으로 처리한다.
// 라벨·문구는 Figma(40001144:10741, 40001144:11083) 그대로 — 단 "1 times" 같은 문법
// 오류는 그대로 안 옮기고 times()로 단/복수 정리(1 time / N times).
const VIOLATION_INFO: Record<string, ViolationInfo> = {
  DUAL_MONITOR: {
    label: 'Dual Monitor',
    message: (n) => `A second monitor was detected ${times(n)}.`,
  },
  TAB_SWITCH: {
    label: 'Tab Switch',
    message: (n) => `You switched to another tab or window ${times(n)}.`,
  },
  BLUR: {
    label: 'Window Exited',
    message: (n) => `You left the test window ${times(n)} during the test.`,
  },
  WINDOW_CLOSE_ATTEMPT: {
    label: 'Close Attempted',
    message: (n) =>
      `You tried to close or refresh the test browser ${times(n)}.`,
  },
  MOUSE_LEAVE: {
    label: 'Mouse Left Screen',
    message: (n) => `Your cursor left the test screen ${times(n)}.`,
  },
  PASTE: {
    label: 'Copy & Paste Blocked',
    message: (n) => `You attempted to copy or paste ${times(n)}.`,
  },
  EYE_GAZE_AWAY: {
    label: 'Eye Gaze Away',
    message: (n) => `Your gaze moved away from the screen ${times(n)}.`,
  },
  FACE_OUT_OF_FRAME: {
    label: 'Face Out Of Frame',
    message: (n) => `Your face was out of the camera frame ${times(n)}.`,
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
