'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthToken } from '@/hooks/auth/useAuthToken';

import { Skeleton } from '@/components/ui/Skeleton';

type RouteGuardProps = {
  // protected: 로그인 안 됐으면 튕겨냄 / guest: 로그인 됐으면 튕겨냄
  mode: 'protected' | 'guest';
  children: React.ReactNode;
};

export function RouteGuard({ mode, children }: RouteGuardProps) {
  const router = useRouter();
  const token = useAuthToken();
  const isResolved = token !== undefined;
  const shouldRedirect = mode === 'protected' ? !token : Boolean(token);
  const redirectTo = mode === 'protected' ? '/' : '/exams';

  useEffect(() => {
    if (isResolved && shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [isResolved, shouldRedirect, redirectTo, router]);

  if (!isResolved || shouldRedirect) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </main>
    );
  }

  return <>{children}</>;
}
