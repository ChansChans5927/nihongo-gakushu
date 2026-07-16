import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import {
  authIdentityMatchesUser,
  parseAuthIdentity,
} from "./authIdentity.ts";

describe("account-bound JWT identity", () => {
  it("accepts a well-formed account identity", () => {
    const accountId = new ObjectId().toHexString();
    expect(parseAuthIdentity({
      username: "learner",
      accountId,
      tokenVersion: 2,
    })).toEqual({ username: "learner", accountId, tokenVersion: 2 });
  });

  it("rejects legacy tokens without an account id", () => {
    expect(parseAuthIdentity({ username: "learner", tokenVersion: 0 })).toBeNull();
  });

  it("does not allow a token from a deleted account to match a re-created account", () => {
    const oldAccountId = new ObjectId().toHexString();
    const newAccountId = new ObjectId();
    const identity = parseAuthIdentity({
      username: "learner",
      accountId: oldAccountId,
      tokenVersion: 0,
    });

    expect(identity).not.toBeNull();
    expect(authIdentityMatchesUser(identity!, {
      _id: newAccountId,
      tokenVersion: 0,
    })).toBe(false);
  });
});
