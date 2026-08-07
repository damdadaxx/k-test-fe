import { useMutation } from '@tanstack/react-query';

import type { ChatMessage } from '@/types/exam';

import { saveAnswer } from '@/lib/api/exam';

import { useChatStore } from '@/store/chatStore';

export function useChatQuestion(sessionId: string, questionId: string) {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);

  const sendMessage = useMutation({
    mutationFn: (text: string) =>
      saveAnswer(sessionId, questionId, { type: 'TEXT', contentText: text }),
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
