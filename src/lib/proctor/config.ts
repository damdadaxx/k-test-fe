// 프록토링 공통 설정. WebcamMonitor / ProctorGuard 공용.

// 개발용: 켜면 프록토링(웹캠 프레임 전송 + 브라우저 이벤트 감지)을 통째로 끈다. 운영에선 비움.
export const PROCTOR_DISABLED =
  process.env.NEXT_PUBLIC_PROCTOR_DISABLED === 'true';

// 개발용: 웹캠 분석(WebcamMonitor)은 그대로 두고 브라우저 이벤트 감지(ProctorGuard: 붙여넣기/
// 탭전환/블러/마우스이탈/창닫기시도/듀얼모니터)만 끈다. PROCTOR_DISABLED와 별개 — 코드 보면서
// 탭 전환·붙여넣기 자주 할 때 매번 경고 모달 뜨는 걸 막기 위함. 운영에선 비움.
export const PROCTOR_GUARD_DISABLED =
  process.env.NEXT_PUBLIC_PROCTOR_GUARD_DISABLED === 'true';

// 개발용: 듀얼모니터 감지만 끈다(나머지 ProctorGuard 이벤트는 그대로). 운영에선 비움.
export const PROCTOR_DUAL_MONITOR_DISABLED =
  process.env.NEXT_PUBLIC_PROCTOR_DUAL_MONITOR_DISABLED === 'true';
