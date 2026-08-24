import type { QuestionPart, SessionQuestionResponse } from '@/types/exam';

// 섹션 = 문항 part. moduleId(라우트 세그먼트)는 프론트 표시용 순번이고, 실제 문항은
// 각 문항의 part로 섹션에 묶인다. 문항 수/시간은 백엔드 문항 응답에서 읽는다.
export const SECTIONS: readonly {
  moduleId: string;
  part: QuestionPart;
  title: string;
}[] = [
  { moduleId: '1', part: 'SITUATION_DESCRIPTION', title: '상황 묘사하기' },
  { moduleId: '2', part: 'READ_AND_EXPLAIN', title: '읽고 설명하기' },
  { moduleId: '3', part: 'ANSWER_QUESTION', title: '질문에 대답하기' },
];

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

// 세션 전체 문항에서 해당 섹션(moduleId)의 part에 속하는 문항만, 원래 순서대로 반환.
export function getSectionQuestions(
  allQuestions: SessionQuestionResponse[],
  moduleId: string,
): SessionQuestionResponse[] {
  const section = getSection(moduleId);
  if (!section) return [];
  return allQuestions.filter((q) => q.part === section.part);
}

// 재개 진입점: 섹션 순서(SECTIONS)대로 훑어 처음 만나는 미완료(답변도 스킵도 안 함) 문항 반환.
// 전부 완료했으면(정상 흐름에선 마지막 답변/스킵 시 자동 finalize라 드묾) 첫 문항으로 폴백.
export function getResumeQuestion(allQuestions: SessionQuestionResponse[]) {
  for (const section of SECTIONS) {
    const pending = allQuestions.find(
      (q) => q.part === section.part && !q.answered && !q.skipped,
    );
    if (pending) return { moduleId: section.moduleId, questionId: pending.id };
  }

  const first = allQuestions[0];
  return first
    ? { moduleId: SECTIONS[0].moduleId, questionId: first.id }
    : null;
}

// 이 섹션이 다루는 문제 번호 범위(start~end). 앞 섹션들의 실제 문항 수를 누적해 계산.
// 예: 각 섹션 2문항이면 section1=1~2, section2=3~4, section3=5~6.
export function getSectionQuestionRange(
  allQuestions: SessionQuestionResponse[],
  moduleId: string,
) {
  const index = getSectionIndex(moduleId);
  if (index < 0) return null;
  const countIn = (part: QuestionPart) =>
    allQuestions.filter((q) => q.part === part).length;
  const start =
    SECTIONS.slice(0, index).reduce((sum, s) => sum + countIn(s.part), 0) + 1;
  const end = start + countIn(SECTIONS[index].part) - 1;
  return { start, end };
}
