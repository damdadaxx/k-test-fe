'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="flex gap-2 border-t border-gray-200 p-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        disabled={disabled}
        placeholder="메시지를 입력하세요"
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-400"
      />
      <Button onClick={handleSend} disabled={disabled}>
        전송
      </Button>
    </div>
  );
}
