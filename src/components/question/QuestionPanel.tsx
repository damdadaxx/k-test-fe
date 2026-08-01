import type { BaseQuestion } from '@/types/exam';

interface QuestionPanelProps {
  question: BaseQuestion;
  children: React.ReactNode;
}

export function QuestionPanel({ question, children }: QuestionPanelProps) {
  return (
    <section className="flex flex-col gap-4 p-6">
      <header>
        <p className="text-sm text-gray-500">문항 {question.order}</p>
        <h1 className="mt-1 text-base font-medium">{question.situation}</h1>
        <p className="mt-2 text-sm text-gray-600">{question.instruction}</p>
      </header>
      {children}
    </section>
  );
}
