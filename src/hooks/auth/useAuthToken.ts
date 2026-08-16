import { useSyncExternalStore } from 'react';

import { getAccessToken, TOKEN_CHANGE_EVENT } from '@/lib/auth/tokenStorage';

function subscribe(callback: () => void) {
  window.addEventListener(TOKEN_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(TOKEN_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot() {
  return getAccessToken();
}

// Sentinel distinct from a resolved "no token" (null), so callers don't act
// on the server-rendered snapshot before hydration has synced to the real
// client-side value.
function getServerSnapshot() {
  return undefined;
}

export function useAuthToken() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
