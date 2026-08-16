'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getMe, type MeResponse } from '@/lib/api/auth';

import { signOut } from '@/hooks/auth/useAuth';
import { useAuthToken } from '@/hooks/auth/useAuthToken';

interface AuthContextValue {
  user: MeResponse | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthToken();
  const [fetchedUser, setFetchedUser] = useState<MeResponse | null>(null);

  useEffect(() => {
    if (!token) return;

    let ignore = false;

    getMe()
      .then((data) => {
        if (!ignore) setFetchedUser(data);
      })
      .catch(() => {
        // accessToken이 만료/무효면 저장된 토큰을 정리해 로그아웃 상태로 되돌림
        if (!ignore) {
          signOut();
          setFetchedUser(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const user = token ? fetchedUser : null;
  const value = useMemo(() => ({ user }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
