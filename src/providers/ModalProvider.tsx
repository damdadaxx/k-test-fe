'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { ModalBase } from '@/components/common/Modal/ModalBase';

interface ModalContextValue {
  openModal: (content: React.ReactNode, className?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const [className, setClassName] = useState<string | undefined>(undefined);

  const openModal = useCallback(
    (next: React.ReactNode, nextClassName?: string) => {
      setContent(next);
      setClassName(nextClassName);
      setIsOpen(true);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // 닫힘 애니메이션 끝난 뒤 컨텐츠 제거
    setTimeout(() => {
      setContent(null);
      setClassName(undefined);
    }, 200);
  }, []);

  const value = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalBase isOpen={isOpen} onClose={closeModal} className={className}>
        {content}
      </ModalBase>
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
