import { create } from 'zustand';

interface SessionState {
  sessionId: string | null;
  // 신분증 업로드(identity)에서 받은 Storage 경로. 얼굴 대조(face-check)가
  // 다른 라우트라 verify 호출 때 재사용하려면 스토어에 들고 있어야 한다.
  idCardPath: string | null;
  identityVerified: boolean;
  earCheckVerified: boolean;
  setSessionId: (sessionId: string) => void;
  setIdCardPath: (path: string | null) => void;
  setIdentityVerified: (verified: boolean) => void;
  setEarCheckVerified: (verified: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  idCardPath: null,
  identityVerified: false,
  earCheckVerified: false,
  setSessionId: (sessionId) => set({ sessionId }),
  setIdCardPath: (idCardPath) => set({ idCardPath }),
  setIdentityVerified: (identityVerified) => set({ identityVerified }),
  setEarCheckVerified: (earCheckVerified) => set({ earCheckVerified }),
  reset: () =>
    set({
      sessionId: null,
      idCardPath: null,
      identityVerified: false,
      earCheckVerified: false,
    }),
}));
