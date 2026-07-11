import { describe, expect, it } from "vitest";
import { calculateQuizPoints, getKoreanDateString } from "./points.ts";

describe("calculateQuizPoints", () => {
  it.each(["kanji_quiz", "vocab_quiz", "jlpt_quiz"])(
    "calculates %s rewards on the server",
    (activity) => {
      expect(calculateQuizPoints(activity, 4, 5)).toBe(40);
    }
  );

  it("rejects unsupported activities", () => {
    expect(calculateQuizPoints("admin_bonus", 5, 5)).toBeNull();
  });

  it("accepts partial quiz sizes returned after server-side filtering", () => {
    expect(calculateQuizPoints("kanji_quiz", 3, 4)).toBe(30);
  });

  it("rejects quiz sizes over the configured maximum", () => {
    expect(calculateQuizPoints("kanji_quiz", 30, 30)).toBeNull();
  });

  it("accepts review quizzes up to the user's server-known mastered count", () => {
    expect(calculateQuizPoints("kanji_review", 30, 33, 33)).toBe(300);
    expect(calculateQuizPoints("vocab_review", 34, 35, 34)).toBeNull();
  });

  it("rejects a correct count greater than the quiz size", () => {
    expect(calculateQuizPoints("vocab_quiz", 20, 5)).toBeNull();
  });

  it("rejects non-integer and non-positive correct counts", () => {
    expect(calculateQuizPoints("jlpt_quiz", 1.5, 5)).toBeNull();
    expect(calculateQuizPoints("jlpt_quiz", 0, 5)).toBeNull();
  });
});

describe("getKoreanDateString", () => {
  it("uses the Korean calendar date around the UTC day boundary", () => {
    expect(getKoreanDateString(new Date("2026-07-10T16:00:00.000Z"))).toBe("2026-07-11");
  });
});
