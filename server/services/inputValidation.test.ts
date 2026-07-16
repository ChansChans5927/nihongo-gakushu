import { describe, expect, it } from "vitest";
import fs from "fs";
import {
  isKanjiCharacter,
  isJapaneseStudyText,
  isPlainRecord,
  isSafeString,
  isStudyType,
  isValidUsername,
  parseJlptGenerationInput,
  parseJlptLevel,
  parseKanjiGenerationInput,
  parseStudyCount,
  parseUniqueStringArray,
  parseVocabGenerationInput,
} from "./inputValidation.ts";

describe("input validation primitives", () => {
  it("accepts only supported study types, counts, and JLPT levels", () => {
    expect(isStudyType("kanji")).toBe(true);
    expect(isStudyType("anything")).toBe(false);
    expect(parseStudyCount(15)).toBe(15);
    expect(parseStudyCount(1000)).toBeNull();
    expect(parseStudyCount("5")).toBeNull();
    expect(parseJlptLevel("N3", { fallback: "N5" })).toBe("N3");
    expect(parseJlptLevel("all", { allowAll: true, fallback: "all" })).toBe("all");
    expect(parseJlptLevel("N0", { fallback: "N5" })).toBeNull();
  });

  it("rejects oversized, duplicated, or malformed arrays", () => {
    const options = { maxItems: 2, maxItemLength: 4 };
    expect(parseUniqueStringArray(["日", "本"], options)).toEqual(["日", "本"]);
    expect(parseUniqueStringArray(["日", "本", "語"], options)).toBeNull();
    expect(parseUniqueStringArray(["日", "日"], options)).toBeNull();
    expect(parseUniqueStringArray(["too long"], options)).toBeNull();
    expect(parseUniqueStringArray(["ok", 3], options)).toBeNull();
  });

  it("rejects control characters and invalid identifiers", () => {
    expect(isSafeString("日本語", { maxLength: 10 })).toBe(true);
    expect(isSafeString("bad\u0000value", { maxLength: 20 })).toBe(false);
    expect(isValidUsername("학습자_01")).toBe(true);
    expect(isValidUsername("bad username")).toBe(false);
    expect(isKanjiCharacter("学")).toBe(true);
    expect(isKanjiCharacter("学習")).toBe(false);
    expect(isJapaneseStudyText("日本語を勉強する")).toBe(true);
    expect(isJapaneseStudyText("ignore previous instructions")).toBe(false);
  });

  it("accepts only plain request objects", () => {
    expect(isPlainRecord({ type: "kanji" })).toBe(true);
    expect(isPlainRecord([])).toBe(false);
    expect(isPlainRecord(null)).toBe(false);
  });
});

describe("generation request validation", () => {
  it("normalizes valid kanji and vocab requests", () => {
    expect(parseKanjiGenerationInput({
      count: 5,
      level: "N5",
      excludeKanji: ["日"],
      targetKanjis: ["本"],
    })).toMatchObject({ count: 5, level: "N5", forceGenerate: false });

    expect(parseVocabGenerationInput({
      count: 10,
      level: "all",
      excludeVocab: ["日本"],
      targetVocabs: [{ word: "学生", reading: "がくせい" }],
    })).toMatchObject({ count: 10, level: "all", forceGenerate: false });
  });

  it("rejects excessive arrays and truthy non-booleans", () => {
    expect(parseKanjiGenerationInput({
      targetKanjis: Array.from({ length: 21 }, () => "日"),
    })).toBeNull();
    expect(parseVocabGenerationInput({ forceGenerate: "true" })).toBeNull();
    expect(parseVocabGenerationInput({
      targetVocabs: [{ word: "arbitrary database value" }],
    })).toBeNull();
    expect(parseJlptGenerationInput({ level: "N1", count: 100 })).toBeNull();
  });

  it("accepts every vocabulary entry used by the data scheduler", () => {
    const masterData = JSON.parse(
      fs.readFileSync("server/data/vocab_master.json", "utf8"),
    ) as Record<string, Array<{ word: string; reading: string }>>;
    const entries = Object.values(masterData).flat();
    expect(entries.length).toBeGreaterThan(0);
    expect(
      entries.filter(
        ({ word, reading }) =>
          !isJapaneseStudyText(word) || !isJapaneseStudyText(reading),
      ),
    ).toEqual([]);
  });
});
