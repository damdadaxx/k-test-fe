'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { ModalProvider } from '@/providers/ModalProvider';
import { QueryProvider } from '@/providers/QueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ModalProvider>{children}</ModalProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
