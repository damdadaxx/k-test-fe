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
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  idCardPath: null,
  identityVerified: false,
  earCheckVerified: false,
  // 다른 세션으로 바뀌면(예: 이전 세션 실패/만료 후 새 세션 시작) 이전 세션에서 남은
  // idCardPath/identityVerified/earCheckVerified가 그대로 남아있으면 안 됨 — 새 세션의
  // /identity 페이지에 아직 아무것도 안 올렸는데 "Done"이 떠버리는 버그였음. 같은
  // 세션 재개(id 동일)일 땐 그대로 유지해야 해서(진행하던 단계 이어감) sessionId가
  // 바뀔 때만 리셋.
  setSessionId: (sessionId) =>
    set((state) =>
      state.sessionId === sessionId
        ? { sessionId }
        : {
            sessionId,
            idCardPath: null,
            identityVerified: false,
            earCheckVerified: false,
          },
    ),
  setIdCardPath: (idCardPath) => set({ idCardPath }),
  setIdentityVerified: (identityVerified) => set({ identityVerified }),
  setEarCheckVerified: (earCheckVerified) => set({ earCheckVerified }),
}));
