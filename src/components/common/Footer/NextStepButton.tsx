import { Button } from '@/components/ui/Button';

export function NextStepButton({
  onClick,
  disabled,
  label = '다음',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <footer className="flex justify-end border-t border-gray-200 px-6 py-4">
      <Button onClick={onClick} disabled={disabled}>
        {label}
      </Button>
    </footer>
  );
}
