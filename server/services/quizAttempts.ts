import crypto from "crypto";
import { Db } from "mongodb";
import { generateQuiz, generateVocabQuiz } from "../../src/utils.ts";
import { Question, JlptQuestion } from "../../src/types.ts";
import { parseUniqueStringArray } from "./inputValidation.ts";

export const QUIZ_ACTIVITIES = [
  "kanji_quiz",
  "vocab_quiz",
  "jlpt_quiz",
  "kanji_review",
  "vocab_review",
] as const;

export type QuizActivity = (typeof QUIZ_ACTIVITIES)[number];
export type QuizAnswerMap = Record<string, number>;
export type StoredQuizQuestion = Question | JlptQuestion;

export interface QuizAttemptDocument {
  _id: string;
  username: string;
  activity: QuizActivity;
  questions: StoredQuizQuestion[];
  createdAt: Date;
  expiresAt: Date;
  submittedAt?: Date;
  result?: QuizSubmissionResult;
}

export interface QuizSubmissionResult {
  correctCount: number;
  questionCount: number;
  pointsAdded: number;
  boosterActive: boolean;
  correctItemKeys: string[];
}

const MAX_QUIZ_QUESTION_COUNT = 20;
const JLPT_LEVELS = new Set(["N5", "N4", "N3", "N2", "N1"]);

export function isQuizActivity(value: unknown): value is QuizActivity {
  return (
    typeof value === "string" &&
    (QUIZ_ACTIVITIES as readonly string[]).includes(value)
  );
}

function parseQuestionCount(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_QUIZ_QUESTION_COUNT
  ) {
    return null;
  }
  return value;
}

function parseItemKeys(value: unknown): string[] | null {
  const keys = parseUniqueStringArray(value, {
    maxItems: MAX_QUIZ_QUESTION_COUNT,
    maxItemLength: 100,
  });
  if (!keys || keys.length < 1) {
    return null;
  }
  return keys;
}

export function sanitizeQuizQuestions<T extends { correctIndex?: number }>(
  questions: T[],
): Omit<T, "correctIndex">[] {
  return questions.map(({ correctIndex: _correctIndex, ...question }) => question);
}

export function gradeQuizAnswers(
  questions: StoredQuizQuestion[],
  answers: QuizAnswerMap,
): number {
  return questions.reduce((correctCount, question) => {
    return answers[String(question.id)] === question.correctIndex
      ? correctCount + 1
      : correctCount;
  }, 0);
}

export function getCorrectItemKeys(
  activity: QuizActivity,
  questions: StoredQuizQuestion[],
  answers: QuizAnswerMap,
): string[] {
  if (activity === "jlpt_quiz") return [];

  const keys = questions.flatMap((question) => {
    if (answers[String(question.id)] !== question.correctIndex) return [];

    if (activity.startsWith("kanji_")) {
      const key = "kanjiItem" in question ? question.kanjiItem?.kanji : undefined;
      return key ? [key] : [];
    }

    const key = "vocabItem" in question
      ? question.vocabItem?.word || question.targetWord
      : undefined;
    return key ? [key] : [];
  });

  return Array.from(new Set(keys));
}

export function parseQuizAnswers(
  value: unknown,
  questions: StoredQuizQuestion[],
): QuizAnswerMap | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const answers = value as Record<string, unknown>;
  if (Object.keys(answers).length > questions.length) return null;

  const questionById = new Map(
    questions.map((question) => [String(question.id), question]),
  );
  const parsed: QuizAnswerMap = {};

  for (const [questionId, choiceIndex] of Object.entries(answers)) {
    const question = questionById.get(questionId);
    if (
      !question ||
      typeof choiceIndex !== "number" ||
      !Number.isInteger(choiceIndex) ||
      choiceIndex < 0 ||
      choiceIndex >= question.choices.length
    ) {
      return null;
    }
    parsed[questionId] = choiceIndex;
  }

  return parsed;
}

export async function createQuizAttempt(
  db: Db,
  username: string,
  input: {
    activity: unknown;
    itemKeys?: unknown;
    level?: unknown;
    count?: unknown;
  },
): Promise<{
  attemptId: string;
  questions: Omit<StoredQuizQuestion, "correctIndex">[];
}> {
  if (!isQuizActivity(input.activity)) {
    throw new Error("지원하지 않는 퀴즈 유형입니다.");
  }

  const activity = input.activity;
  let questions: StoredQuizQuestion[] = [];

  if (activity === "jlpt_quiz") {
    const count = parseQuestionCount(input.count);
    const level = typeof input.level === "string" ? input.level : "";
    if (!count || !JLPT_LEVELS.has(level)) {
      throw new Error("올바르지 않은 JLPT 퀴즈 요청입니다.");
    }

    const selected = await db
      .collection("jlpt_questions")
      .aggregate([
        { $match: { level } },
        { $sample: { size: count } },
      ])
      .toArray();

    if (selected.length !== count) {
      throw new Error("JLPT 문제 데이터가 부족합니다. 잠시 후 다시 시도해 주세요.");
    }

    questions = selected.map(({ _id: _ignoredId, ...question }, index) => ({
      ...question,
      id: `jlpt_${index}`,
    })) as JlptQuestion[];
  } else {
    const itemKeys = parseItemKeys(input.itemKeys);
    if (!itemKeys) {
      throw new Error("올바르지 않은 퀴즈 항목입니다.");
    }

    if (activity.endsWith("_review")) {
      const progress = await db.collection("progress").findOne({ username });
      const masteredItems: string[] = activity.startsWith("kanji_")
        ? progress?.masteredKanjis || []
        : progress?.masteredVocabs || [];
      if (itemKeys.some((item) => !masteredItems.includes(item))) {
        throw new Error("복습할 수 없는 항목이 포함되어 있습니다.");
      }
    }

    if (activity.startsWith("kanji_")) {
      const cards = await db
        .collection("kanjis")
        .find({ kanji: { $in: itemKeys } })
        .toArray();
      const orderedCards = itemKeys
        .map((item) => cards.find((card) => card.kanji === item))
        .filter(Boolean);
      if (orderedCards.length !== itemKeys.length) {
        throw new Error("한자 퀴즈 데이터를 찾을 수 없습니다.");
      }
      questions = generateQuiz(orderedCards as any[]);
    } else {
      const cards = await db
        .collection("vocabs")
        .find({ word: { $in: itemKeys } })
        .toArray();
      const orderedCards = itemKeys
        .map((item) => cards.find((card) => card.word === item))
        .filter(Boolean);
      if (orderedCards.length !== itemKeys.length) {
        throw new Error("단어 퀴즈 데이터를 찾을 수 없습니다.");
      }
      questions = generateVocabQuiz(orderedCards as any[]);
    }
  }

  const attemptId = crypto.randomUUID();
  const now = new Date();
  await db.collection<QuizAttemptDocument>("quiz_attempts").insertOne({
    _id: attemptId,
    username,
    activity,
    questions,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  });

  return {
    attemptId,
    questions: sanitizeQuizQuestions(questions),
  };
}
