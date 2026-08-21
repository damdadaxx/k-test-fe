import { create } from 'zustand';

interface ExamState {
  remainingSeconds: number;
  // 오디오 재생 등으로 카운트다운을 일시정지할 때 true. CountdownTimer가 참조.
  paused: boolean;
  setRemainingSeconds: (seconds: number) => void;
  setPaused: (paused: boolean) => void;
}

export const useExamStore = create<ExamState>((set) => ({
  remainingSeconds: 0,
  paused: false,
  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
  setPaused: (paused) => set({ paused }),
}));
