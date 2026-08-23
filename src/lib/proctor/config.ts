// 프록토링 공통 설정. WebcamMonitor / ProctorGuard 공용.

// 개발용: 켜면 프록토링(웹캠 프레임 전송 + 브라우저 이벤트 감지)을 통째로 끈다. 운영에선 비움.
export const PROCTOR_DISABLED =
  process.env.NEXT_PUBLIC_PROCTOR_DISABLED === 'true';
