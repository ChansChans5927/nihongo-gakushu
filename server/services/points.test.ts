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

  it("rejects unsupported quiz sizes", () => {
    expect(calculateQuizPoints("kanji_quiz", 30, 30)).toBeNull();
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
