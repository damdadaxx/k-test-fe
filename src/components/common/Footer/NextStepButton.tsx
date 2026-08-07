import ButtonSecondary from '@/components/common/Button/ButtonSecondary';

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
    <footer className="flex justify-center bg-white py-[16px] px-[20px] h-[104px]">
      <div className="flex justify-end w-full max-w-[1200px]">
        <ButtonSecondary
          variant="outline"
          onClick={onClick}
          disabled={disabled}
        >
          {label}
        </ButtonSecondary>
      </div>
    </footer>
  );
}
