import { ObjectId } from "mongodb";
import type { ClientSession, Db, MongoClient } from "mongodb";
import { describe, expect, it, vi } from "vitest";
import {
  AccountIdentityMismatchError,
  deleteAccountAtomically,
  deleteAccountWithinSession,
} from "./accountDeletion.ts";

describe("atomic account deletion operations", () => {
  it("deletes the account and every username-owned document in one session", async () => {
    const userId = new ObjectId();
    const session = {} as ClientSession;
    const users = {
      findOne: vi.fn().mockResolvedValue({ _id: userId }),
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const progress = { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) };
    const subscriptions = { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) };
    const quizAttempts = { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 2 }) };
    const collections: Record<string, unknown> = {
      users,
      progress,
      subscriptions,
      quiz_attempts: quizAttempts,
    };
    const db = {
      collection: vi.fn((name: string) => collections[name]),
    } as unknown as Db;

    await deleteAccountWithinSession(db, session, {
      username: "learner",
      accountId: userId.toHexString(),
    });

    expect(users.deleteOne).toHaveBeenCalledWith({ _id: userId }, { session });
    for (const collection of [progress, subscriptions, quizAttempts]) {
      expect(collection.deleteMany).toHaveBeenCalledWith(
        { username: "learner" },
        { session },
      );
    }
  });

  it("does not delete anything when the token belongs to another account", async () => {
    const users = {
      findOne: vi.fn().mockResolvedValue({ _id: new ObjectId() }),
      deleteOne: vi.fn(),
    };
    const db = {
      collection: vi.fn(() => users),
    } as unknown as Db;

    await expect(deleteAccountWithinSession(
      db,
      {} as ClientSession,
      { username: "learner", accountId: new ObjectId().toHexString() },
    )).rejects.toBeInstanceOf(AccountIdentityMismatchError);
    expect(users.deleteOne).not.toHaveBeenCalled();
  });

  it("runs all deletion operations inside a MongoDB transaction", async () => {
    const userId = new ObjectId();
    const users = {
      findOne: vi.fn().mockResolvedValue({ _id: userId }),
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const ownedData = { deleteMany: vi.fn().mockResolvedValue({ deletedCount: 1 }) };
    const db = {
      collection: vi.fn((name: string) => name === "users" ? users : ownedData),
    } as unknown as Db;
    const session = {
      withTransaction: vi.fn(async (callback: () => Promise<boolean>) => callback()),
    } as unknown as ClientSession;
    const client = {
      withSession: vi.fn(async (callback: (value: ClientSession) => Promise<boolean>) => callback(session)),
    } as unknown as MongoClient;

    await deleteAccountAtomically(client, db, {
      username: "learner",
      accountId: userId.toHexString(),
    });

    expect(client.withSession).toHaveBeenCalledOnce();
    expect(session.withTransaction).toHaveBeenCalledOnce();
  });
});
