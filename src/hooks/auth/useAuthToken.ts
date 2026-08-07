import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return localStorage.getItem('accessToken');
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
