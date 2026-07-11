const QUIZ_REWARD_PER_CORRECT = {
  kanji_quiz: 10,
  vocab_quiz: 10,
  jlpt_quiz: 10,
} as const;

const ALLOWED_QUIZ_COUNTS = new Set([5, 10, 15, 20]);

export type QuizActivity = keyof typeof QUIZ_REWARD_PER_CORRECT;

export function calculateQuizPoints(
  activity: unknown,
  correctCount: unknown,
  questionCount: unknown
): number | null {
  if (
    typeof activity !== "string" ||
    !Object.prototype.hasOwnProperty.call(QUIZ_REWARD_PER_CORRECT, activity)
  ) {
    return null;
  }

  if (
    typeof questionCount !== "number" ||
    !Number.isInteger(questionCount) ||
    !ALLOWED_QUIZ_COUNTS.has(questionCount)
  ) {
    return null;
  }

  if (
    typeof correctCount !== "number" ||
    !Number.isInteger(correctCount) ||
    correctCount < 1 ||
    correctCount > questionCount
  ) {
    return null;
  }

  return correctCount * QUIZ_REWARD_PER_CORRECT[activity as QuizActivity];
}

export function getKoreanDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
