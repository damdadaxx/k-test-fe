// 브라우저 네이티브 권한 프롬프트가 떠 있는 동안(응답 대기 중)인지 — 프롬프트는 페이지 밖(주소창
// 영역)에 뜨기 때문에 사용자가 그걸 조작하려고 마우스를 밖으로 옮기거나 포커스가 빠지는 게 정상인데,
// ProctorGuard가 이걸 탭전환/마우스이탈로 오인해 실격 처리하는 걸 막기 위한 신호로 쓴다.
let pendingCount = 0;

export function isMediaPermissionPending() {
  return pendingCount > 0;
}

// navigator.mediaDevices는 보안 컨텍스트(https 또는 localhost)에서만 존재한다.
// 없는 환경(http+IP 등)에서 navigator.mediaDevices.getUserMedia를 바로 호출하면
// Promise 체인 진입 전에 동기 TypeError가 터져 .catch/try-catch로 못 잡고 앱이 크래시한다.
// 이 헬퍼는 그 경우를 reject된 Promise로 바꿔서 기존 호출부의 에러 처리 경로를 그대로 타게 한다.
export async function getUserMedia(constraints: MediaStreamConstraints) {
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(
      new Error(
        '카메라를 사용할 수 없는 환경입니다. https 또는 localhost로 접속해주세요.',
      ),
    );
  }
  pendingCount++;
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } finally {
    pendingCount--;
  }
}
