import { describe, expect, it, vi } from "vitest";
import type { Db } from "mongodb";
import { ensureDatabaseIndexes, isDuplicateKeyError } from "./db.ts";

describe("ensureDatabaseIndexes", () => {
  it("creates unique username indexes for users and progress", async () => {
    const createIndex = vi.fn().mockResolvedValue("index_name");
    const database = {
      collection: vi.fn(() => ({ createIndex })),
    } as unknown as Db;

    await ensureDatabaseIndexes(database);

    expect(database.collection).toHaveBeenNthCalledWith(1, "quiz_attempts");
    expect(database.collection).toHaveBeenNthCalledWith(2, "users");
    expect(database.collection).toHaveBeenNthCalledWith(3, "progress");
    expect(createIndex).toHaveBeenNthCalledWith(
      1,
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    );
    expect(createIndex).toHaveBeenNthCalledWith(
      2,
      { username: 1 },
      { unique: true },
    );
    expect(createIndex).toHaveBeenNthCalledWith(
      3,
      { username: 1 },
      { unique: true },
    );
  });
});

describe("isDuplicateKeyError", () => {
  it("recognizes MongoDB duplicate key errors", () => {
    expect(isDuplicateKeyError({ code: 11000 })).toBe(true);
    expect(isDuplicateKeyError({ code: 11001 })).toBe(false);
    expect(isDuplicateKeyError(new Error("duplicate"))).toBe(false);
  });
});
