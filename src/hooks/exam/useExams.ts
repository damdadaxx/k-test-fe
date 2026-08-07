import { useMutation, useQuery } from '@tanstack/react-query';

import { applyExam, getExams } from '@/lib/api/exam';

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: getExams,
  });
}

export function useApplyExam() {
  return useMutation({
    mutationFn: (examId: string) => applyExam(examId),
  });
}
