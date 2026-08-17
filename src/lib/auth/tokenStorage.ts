const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ROLE_KEY = 'role';

// localStorage는 같은 탭 안에서 바뀌어도 'storage' 이벤트가 안 뜨므로,
// useSyncExternalStore가 즉시 반응하도록 커스텀 이벤트로 직접 알려준다.
export const TOKEN_CHANGE_EVENT = 'auth:token-change';

function notifyChange() {
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getRole() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ROLE_KEY);
}

export function setTokens({
  accessToken,
  refreshToken,
  role,
}: {
  accessToken: string;
  refreshToken: string;
  role: string;
}) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(ROLE_KEY, role);
  notifyChange();
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  notifyChange();
}
