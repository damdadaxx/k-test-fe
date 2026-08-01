import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function RetryModal({
  message,
  onRetry,
  onClose,
}: {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="다시 촬영해주세요" onClose={onClose}>
      <p className="mb-4 text-sm text-gray-600">{message}</p>
      <Button onClick={onRetry}>다시 촬영하기</Button>
    </Modal>
  );
}
