// navigator.mediaDevices는 보안 컨텍스트(https 또는 localhost)에서만 존재한다.
// 없는 환경(http+IP 등)에서 navigator.mediaDevices.getUserMedia를 바로 호출하면
// Promise 체인 진입 전에 동기 TypeError가 터져 .catch/try-catch로 못 잡고 앱이 크래시한다.
// 이 헬퍼는 그 경우를 reject된 Promise로 바꿔서 기존 호출부의 에러 처리 경로를 그대로 타게 한다.
export function getUserMedia(constraints: MediaStreamConstraints) {
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(
      new Error(
        '카메라를 사용할 수 없는 환경입니다. https 또는 localhost로 접속해주세요.',
      ),
    );
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}
