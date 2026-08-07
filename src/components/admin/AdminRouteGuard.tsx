'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/Skeleton';

function subscribe() {
  return () => {};
}

function getSnapshot() {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  return token && role === 'ADMIN' ? role : null;
}

// Sentinel distinct from a resolved "관리자 아님/미로그인" (null), so the effect
// below doesn't redirect based on the server-rendered snapshot before hydration
// has synced to the real client-side value.
function getServerSnapshot() {
  return undefined;
}

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const role = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isResolved = role !== undefined;

  useEffect(() => {
    if (isResolved && !role) {
      router.replace('/admin/login');
    }
  }, [isResolved, role, router]);

  if (!isResolved || !role) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </main>
    );
  }

  return <>{children}</>;
}
