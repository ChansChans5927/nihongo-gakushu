const QUIZ_REWARD_PER_CORRECT = {
  kanji_quiz: 10,
  vocab_quiz: 10,
  jlpt_quiz: 10,
  kanji_review: 10,
  vocab_review: 10,
} as const;

const MAX_QUIZ_QUESTION_COUNT = 20;

export type QuizActivity = keyof typeof QUIZ_REWARD_PER_CORRECT;

export function calculateQuizPoints(
  activity: unknown,
  correctCount: unknown,
  questionCount: unknown,
  maximumQuestionCount = MAX_QUIZ_QUESTION_COUNT
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
    questionCount < 1 ||
    !Number.isInteger(maximumQuestionCount) ||
    maximumQuestionCount < 1 ||
    questionCount > maximumQuestionCount
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

export function getCompletedWeekDates(
  weekStart: unknown,
  koreanToday = getKoreanDateString(),
): string[] | null {
  if (typeof weekStart !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return null;
  }

  const start = new Date(`${weekStart}T00:00:00.000Z`);
  if (
    Number.isNaN(start.getTime()) ||
    start.toISOString().slice(0, 10) !== weekStart ||
    start.getUTCDay() !== 1
  ) {
    return null;
  }

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });

  return dates[6] <= koreanToday ? dates : null;
}
