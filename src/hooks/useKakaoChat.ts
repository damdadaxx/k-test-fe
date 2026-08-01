import { useMutation } from '@tanstack/react-query';

import type { ChatMessage } from '@/types/exam';

import { submitAnswer } from '@/lib/api/exam';

import { useChatStore } from '@/store/chatStore';

export function useKakaoChat(sessionId: string, questionId: string) {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);

  const sendMessage = useMutation({
    mutationFn: (text: string) =>
      submitAnswer({ sessionId, questionId, answer: text }),
    onMutate: (text) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'user',
        text,
        sentAt: new Date().toISOString(),
      };
      addMessage(message);
    },
  });

  return { messages, sendMessage };
}
