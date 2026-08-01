'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/Skeleton';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return localStorage.getItem('accessToken');
}

// Sentinel distinct from a resolved "no token" (null), so the effect below
// doesn't redirect based on the server-rendered snapshot before hydration
// has synced to the real client-side value.
function getServerSnapshot() {
  return undefined;
}

// TODO: 로그인기능 추가 후 수정하기
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isResolved = token !== undefined;

  useEffect(() => {
    if (isResolved && !token) {
      router.replace('/login');
    }
  }, [isResolved, token, router]);

  if (!isResolved || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </main>
    );
  }

  return <>{children}</>;
}
