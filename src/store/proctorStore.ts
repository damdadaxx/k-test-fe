import { create } from 'zustand';

interface ProctorState {
  webcamActive: boolean;
  warningCount: number;
  setWebcamActive: (active: boolean) => void;
  addWarning: () => void;
  reset: () => void;
}

export const useProctorStore = create<ProctorState>((set) => ({
  webcamActive: false,
  warningCount: 0,
  setWebcamActive: (webcamActive) => set({ webcamActive }),
  addWarning: () => set((state) => ({ warningCount: state.warningCount + 1 })),
  reset: () => set({ webcamActive: false, warningCount: 0 }),
}));
