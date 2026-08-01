import { create } from 'zustand';

interface ExamState {
  currentModuleId: string | null;
  currentQuestionId: string | null;
  remainingSeconds: number;
  setCurrentQuestion: (moduleId: string, questionId: string) => void;
  setRemainingSeconds: (seconds: number) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  currentModuleId: null,
  currentQuestionId: null,
  remainingSeconds: 0,
  setCurrentQuestion: (currentModuleId, currentQuestionId) =>
    set({ currentModuleId, currentQuestionId }),
  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
  reset: () =>
    set({
      currentModuleId: null,
      currentQuestionId: null,
      remainingSeconds: 0,
    }),
}));
