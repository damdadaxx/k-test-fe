'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAdminSignIn } from '@/hooks/auth/useAuth';

import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const adminSignIn = useAdminSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminSignIn.mutate(
      { email, password },
      { onSuccess: () => router.push('/admin') },
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-xl font-semibold">관리자 로그인</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="관리자 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {adminSignIn.isError && (
          <p className="text-sm text-red-500">
            이메일 또는 비밀번호를 확인해주세요.
          </p>
        )}
        <Button type="submit" disabled={adminSignIn.isPending}>
          로그인
        </Button>
      </form>
    </main>
  );
}
