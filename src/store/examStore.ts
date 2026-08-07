import { create } from 'zustand';

interface ExamState {
  remainingSeconds: number;
  setRemainingSeconds: (seconds: number) => void;
}

export const useExamStore = create<ExamState>((set) => ({
  remainingSeconds: 0,
  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
}));
