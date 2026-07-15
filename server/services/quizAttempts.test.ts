import { describe, expect, it } from "vitest";
import type { Question } from "../../src/types.ts";
import {
  getCorrectItemKeys,
  gradeQuizAnswers,
  parseQuizAnswers,
  sanitizeQuizQuestions,
} from "./quizAttempts.ts";

const questions: Question[] = [
  {
    id: 1,
    type: "meaning",
    questionText: "뜻은?",
    choices: ["물", "불", "나무"],
    correctIndex: 1,
    kanjiItem: {
      id: "火",
      kanji: "火",
      reading: "ひ",
      meaning: "불",
      jlptLevel: "N5",
      examples: [],
    },
  } as unknown as Question,
  {
    id: 2,
    type: "meaning",
    questionText: "뜻은?",
    choices: ["물", "불", "나무"],
    correctIndex: 0,
    kanjiItem: {
      id: "水",
      kanji: "水",
      reading: "みず",
      meaning: "물",
      jlptLevel: "N5",
      examples: [],
    },
  } as unknown as Question,
];

describe("quiz attempt grading", () => {
  it("does not expose correct answers before submission", () => {
    expect(sanitizeQuizQuestions(questions)).toEqual([
      expect.not.objectContaining({ correctIndex: expect.anything() }),
      expect.not.objectContaining({ correctIndex: expect.anything() }),
    ]);
  });

  it("grades only against the server-stored answer key", () => {
    expect(gradeQuizAnswers(questions, { "1": 1, "2": 2 })).toBe(1);
    expect(getCorrectItemKeys("kanji_quiz", questions, { "1": 1, "2": 2 })).toEqual(["火"]);
  });

  it("accepts omitted answers but rejects unknown questions and choices", () => {
    expect(parseQuizAnswers({ "1": 1 }, questions)).toEqual({ "1": 1 });
    expect(parseQuizAnswers({ "3": 0 }, questions)).toBeNull();
    expect(parseQuizAnswers({ "1": 99 }, questions)).toBeNull();
  });
});
