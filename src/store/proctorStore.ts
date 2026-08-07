import { create } from 'zustand';

interface ProctorState {
  webcamActive: boolean;
  setWebcamActive: (active: boolean) => void;
}

export const useProctorStore = create<ProctorState>((set) => ({
  webcamActive: false,
  setWebcamActive: (webcamActive) => set({ webcamActive }),
}));
