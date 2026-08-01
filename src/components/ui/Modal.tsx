interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-800"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  );
}
