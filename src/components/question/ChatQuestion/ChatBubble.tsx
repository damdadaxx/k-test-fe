import type { ChatMessage } from '@/types/exam';

import { cn } from '@/lib/utils/cn';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
          isUser ? 'bg-yellow-300 text-black' : 'bg-white text-black shadow-sm',
        )}
      >
        {message.text}
      </div>
    </div>
  );
}
