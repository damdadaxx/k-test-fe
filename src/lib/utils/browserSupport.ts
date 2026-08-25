// 듀얼모니터 감지(ProctorGuard)가 window.screen.isExtended(Window Management API)에 의존하는데
// 이 API는 크로미움 데스크톱 브라우저(Chrome/Edge/Brave/Opera/Vivaldi)만 지원 — 미지원 브라우저는
// 프록토링 자체가 안 되니 응시를 막는다.
export function isChromiumBrowser() {
  if (typeof window === 'undefined') return true;
  return 'isExtended' in window.screen;
}
