'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface ModalContextValue {
  content: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const openModal = useCallback(
    (next: React.ReactNode) => setContent(next),
    [],
  );
  const closeModal = useCallback(() => setContent(null), []);

  const value = useMemo(
    () => ({ content, openModal, closeModal }),
    [content, openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {content}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}
