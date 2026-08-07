import type { SessionQuestionResponse } from '@/types/exam';

// ponytail: 백엔드에 섹션(모듈) 개념이 아직 없어서, 세션 문항 목록을 앞에서부터
// questionCount만큼 순서대로 잘라 섹션으로 취급한다. 실제 섹션 API가 생기면
// 이 고정 배열 대신 그 응답으로 교체할 것.
export const SECTIONS = [
  { moduleId: '1', title: '상황별 말하기', questionCount: 1 },
  { moduleId: '2', title: '주제 말하기', questionCount: 1 },
] as const;

export const ANSWER_SECONDS_PER_QUESTION = 90;

export function getSection(moduleId: string) {
  return SECTIONS.find((section) => section.moduleId === moduleId);
}

export function getSectionIndex(moduleId: string) {
  return SECTIONS.findIndex((section) => section.moduleId === moduleId);
}

export function getNextSection(moduleId: string) {
  const index = getSectionIndex(moduleId);
  if (index < 0) return undefined;
  return SECTIONS[index + 1];
}

// 세션 전체 문항 목록에서 해당 섹션(moduleId)에 속하는 구간만 잘라 반환.
export function getSectionQuestions(
  allQuestions: SessionQuestionResponse[],
  moduleId: string,
): SessionQuestionResponse[] {
  const index = getSectionIndex(moduleId);
  if (index < 0) return [];

  const start = SECTIONS.slice(0, index).reduce(
    (sum, section) => sum + section.questionCount,
    0,
  );
  const count = SECTIONS[index].questionCount;
  return allQuestions.slice(start, start + count);
}
