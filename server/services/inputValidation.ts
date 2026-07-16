export const STUDY_COUNTS = [5, 10, 15, 20] as const;
export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export const STUDY_TYPES = ["kanji", "vocab"] as const;

export type JlptLevel = (typeof JLPT_LEVELS)[number];
export type StudyType = (typeof STUDY_TYPES)[number];

export interface KanjiGenerationInput {
  count: number;
  level: JlptLevel | "all";
  excludeKanji: string[];
  forceGenerate: boolean;
  targetKanjis: string[];
  deepLinkTarget?: { kanji: string; level?: JlptLevel | "all" };
}

export interface VocabTarget {
  word: string;
  reading?: string;
}

export interface VocabGenerationInput {
  count: number;
  level: JlptLevel | "all";
  excludeVocab: string[];
  forceGenerate: boolean;
  targetVocabs: VocabTarget[];
  deepLinkTarget?: { word: string; level?: JlptLevel | "all" };
}

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const USERNAME_PATTERN = /^[\p{L}\p{N}._-]+$/u;
const KANJI_PATTERN = /^\p{Script=Han}$/u;
const JAPANESE_STUDY_TEXT_PATTERN = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々ヶ・;；～〜()（）、×。"\s\/-]+$/u;

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function isEnumValue<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}

export function isSafeString(
  value: unknown,
  options: { minLength?: number; maxLength: number },
): value is string {
  if (typeof value !== "string" || CONTROL_CHARACTER_PATTERN.test(value)) {
    return false;
  }
  const length = value.trim().length;
  return length >= (options.minLength ?? 1) && length <= options.maxLength;
}

export function isValidUsername(value: unknown): value is string {
  return (
    isSafeString(value, { maxLength: 50 }) &&
    USERNAME_PATTERN.test(value.trim())
  );
}

export function isKanjiCharacter(value: unknown): value is string {
  return typeof value === "string" && KANJI_PATTERN.test(value.trim());
}

export function isJapaneseStudyText(value: unknown): value is string {
  return (
    isSafeString(value, { maxLength: 100 }) &&
    JAPANESE_STUDY_TEXT_PATTERN.test(value.trim())
  );
}

export function parseStudyCount(value: unknown, fallback = 5): number | null {
  if (value === undefined) return fallback;
  return (
    typeof value === "number" &&
    (STUDY_COUNTS as readonly number[]).includes(value)
  )
    ? value
    : null;
}

export function parseJlptLevel(
  value: unknown,
  options: { allowAll?: boolean; fallback: JlptLevel | "all" },
): JlptLevel | "all" | null {
  if (value === undefined) return options.fallback;
  if (options.allowAll && value === "all") return "all";
  return isEnumValue(value, JLPT_LEVELS) ? value : null;
}

export function isStudyType(value: unknown): value is StudyType {
  return isEnumValue(value, STUDY_TYPES);
}

export function parseUniqueStringArray(
  value: unknown,
  options: {
    maxItems: number;
    maxItemLength: number;
    validateItem?: (item: string) => boolean;
  },
): string[] | null {
  if (!Array.isArray(value) || value.length > options.maxItems) return null;

  const parsed: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!isSafeString(item, { maxLength: options.maxItemLength })) return null;
    const normalized = item.trim();
    if (options.validateItem && !options.validateItem(normalized)) return null;
    if (seen.has(normalized)) return null;
    seen.add(normalized);
    parsed.push(normalized);
  }
  return parsed;
}

function parseOptionalBoolean(value: unknown): boolean | null {
  if (value === undefined) return false;
  return typeof value === "boolean" ? value : null;
}

function parseOptionalLevel(value: unknown): JlptLevel | "all" | null | undefined {
  if (value === undefined) return undefined;
  return parseJlptLevel(value, { allowAll: true, fallback: "all" });
}

export function parseKanjiGenerationInput(
  value: unknown,
): KanjiGenerationInput | null {
  if (!isPlainRecord(value)) return null;

  const count = parseStudyCount(value.count);
  const level = parseJlptLevel(value.level, { allowAll: true, fallback: "all" });
  const forceGenerate = parseOptionalBoolean(value.forceGenerate);
  const excludeKanji = parseUniqueStringArray(value.excludeKanji ?? [], {
    maxItems: 3_000,
    maxItemLength: 2,
    validateItem: isKanjiCharacter,
  });
  const targetKanjis = parseUniqueStringArray(value.targetKanjis ?? [], {
    maxItems: 20,
    maxItemLength: 2,
    validateItem: isKanjiCharacter,
  });
  if (
    count === null ||
    level === null ||
    forceGenerate === null ||
    excludeKanji === null ||
    targetKanjis === null
  ) {
    return null;
  }

  let deepLinkTarget: KanjiGenerationInput["deepLinkTarget"];
  if (value.deepLinkTarget !== undefined) {
    if (
      !isPlainRecord(value.deepLinkTarget) ||
      !isKanjiCharacter(value.deepLinkTarget.kanji)
    ) {
      return null;
    }
    const deepLinkLevel = parseOptionalLevel(value.deepLinkTarget.level);
    if (deepLinkLevel === null) return null;
    deepLinkTarget = {
      kanji: value.deepLinkTarget.kanji.trim(),
      ...(deepLinkLevel === undefined ? {} : { level: deepLinkLevel }),
    };
  }

  if (
    new Set([
      ...targetKanjis,
      ...(deepLinkTarget ? [deepLinkTarget.kanji] : []),
    ]).size > count
  ) {
    return null;
  }

  return {
    count,
    level,
    excludeKanji,
    forceGenerate,
    targetKanjis,
    ...(deepLinkTarget ? { deepLinkTarget } : {}),
  };
}

function parseVocabTarget(value: unknown): VocabTarget | null {
  if (!isPlainRecord(value) || !isJapaneseStudyText(value.word)) {
    return null;
  }
  if (
    value.reading !== undefined &&
    !isJapaneseStudyText(value.reading)
  ) {
    return null;
  }
  return {
    word: value.word.trim(),
    ...(typeof value.reading === "string"
      ? { reading: value.reading.trim() }
      : {}),
  };
}

export function parseVocabGenerationInput(
  value: unknown,
): VocabGenerationInput | null {
  if (!isPlainRecord(value)) return null;

  const count = parseStudyCount(value.count);
  const level = parseJlptLevel(value.level, { allowAll: true, fallback: "all" });
  const forceGenerate = parseOptionalBoolean(value.forceGenerate);
  const excludeVocab = parseUniqueStringArray(value.excludeVocab ?? [], {
    maxItems: 10_000,
    maxItemLength: 100,
    validateItem: isJapaneseStudyText,
  });
  const rawTargetVocabs = value.targetVocabs ?? [];
  if (
    count === null ||
    level === null ||
    forceGenerate === null ||
    excludeVocab === null ||
    !Array.isArray(rawTargetVocabs) ||
    rawTargetVocabs.length > 20
  ) {
    return null;
  }

  const targetVocabs: VocabTarget[] = [];
  const seenWords = new Set<string>();
  for (const rawTarget of rawTargetVocabs) {
    const target = parseVocabTarget(rawTarget);
    if (!target || seenWords.has(target.word)) return null;
    seenWords.add(target.word);
    targetVocabs.push(target);
  }

  let deepLinkTarget: VocabGenerationInput["deepLinkTarget"];
  if (value.deepLinkTarget !== undefined) {
    if (
      !isPlainRecord(value.deepLinkTarget) ||
      !isJapaneseStudyText(value.deepLinkTarget.word)
    ) {
      return null;
    }
    const deepLinkLevel = parseOptionalLevel(value.deepLinkTarget.level);
    if (deepLinkLevel === null) return null;
    deepLinkTarget = {
      word: value.deepLinkTarget.word.trim(),
      ...(deepLinkLevel === undefined ? {} : { level: deepLinkLevel }),
    };
  }

  if (
    new Set([
      ...targetVocabs.map(({ word }) => word),
      ...(deepLinkTarget ? [deepLinkTarget.word] : []),
    ]).size > count
  ) {
    return null;
  }

  return {
    count,
    level,
    excludeVocab,
    forceGenerate,
    targetVocabs,
    ...(deepLinkTarget ? { deepLinkTarget } : {}),
  };
}

export function parseJlptGenerationInput(value: unknown): {
  count: number;
  level: JlptLevel;
  forceGenerate: boolean;
} | null {
  if (!isPlainRecord(value)) return null;
  const count = parseStudyCount(value.count);
  const level = parseJlptLevel(value.level, { fallback: "N5" });
  const forceGenerate = parseOptionalBoolean(value.forceGenerate);
  if (count === null || level === null || level === "all" || forceGenerate === null) {
    return null;
  }
  return { count, level, forceGenerate };
}
