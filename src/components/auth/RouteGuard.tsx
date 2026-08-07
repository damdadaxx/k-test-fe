'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthToken } from '@/hooks/auth/useAuthToken';

import { Skeleton } from '@/components/ui/Skeleton';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthToken();
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
