'use client';

import { useModal } from '@/providers/ModalProvider';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function EndExamButton({ onConfirm }: { onConfirm: () => void }) {
  const { openModal, closeModal } = useModal();

  const handleClick = () => {
    openModal(
      <Modal title="시험을 종료할까요?" onClose={closeModal}>
        <p className="mb-4 text-sm text-gray-600">
          종료 후에는 다시 응시할 수 없습니다.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            closeModal();
            onConfirm();
          }}
        >
          종료하기
        </Button>
      </Modal>,
    );
  };

  return (
    <Button variant="secondary" onClick={handleClick}>
      시험 종료
    </Button>
  );
}
