import { create } from 'zustand';

interface SessionState {
  sessionId: string | null;
  identityVerified: boolean;
  earCheckVerified: boolean;
  setSessionId: (sessionId: string) => void;
  setIdentityVerified: (verified: boolean) => void;
  setEarCheckVerified: (verified: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  identityVerified: false,
  earCheckVerified: false,
  setSessionId: (sessionId) => set({ sessionId }),
  setIdentityVerified: (identityVerified) => set({ identityVerified }),
  setEarCheckVerified: (earCheckVerified) => set({ earCheckVerified }),
  reset: () =>
    set({ sessionId: null, identityVerified: false, earCheckVerified: false }),
}));
