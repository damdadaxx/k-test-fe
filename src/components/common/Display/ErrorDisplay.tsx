import ButtonPrimary from '@/components/common/Button/ButtonPrimary';

interface ErrorDisplayProps {
  message: string;
  onClick: () => void;
}

export default function ErrorDisplay({
  message = '',
  onClick,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-body-md text-icon-90">{message}</p>
      <ButtonPrimary type="button" onClick={onClick} width={140}>
        Try again
      </ButtonPrimary>
    </div>
  );
}
