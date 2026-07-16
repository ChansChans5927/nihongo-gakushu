import type { ClientSession, Db, MongoClient } from "mongodb";

export class AccountIdentityMismatchError extends Error {
  constructor() {
    super("Account identity no longer matches the authenticated token.");
    this.name = "AccountIdentityMismatchError";
  }
}

export async function deleteAccountWithinSession(
  db: Db,
  session: ClientSession,
  identity: { username: string; accountId: string },
): Promise<void> {
  const users = db.collection("users");
  const user = await users.findOne(
    { username: identity.username },
    { projection: { _id: 1 }, session },
  );
  if (!user || String(user._id) !== identity.accountId) {
    throw new AccountIdentityMismatchError();
  }

  const deletedUser = await users.deleteOne({ _id: user._id }, { session });
  if (deletedUser.deletedCount !== 1) {
    throw new AccountIdentityMismatchError();
  }

  await db.collection("progress").deleteMany(
    { username: identity.username },
    { session },
  );
  await db.collection("subscriptions").deleteMany(
    { username: identity.username },
    { session },
  );
  await db.collection("quiz_attempts").deleteMany(
    { username: identity.username },
    { session },
  );
}

export async function deleteAccountAtomically(
  client: MongoClient,
  db: Db,
  identity: { username: string; accountId: string },
): Promise<void> {
  const deleted = await client.withSession(async (session) => {
    return session.withTransaction(async () => {
      await deleteAccountWithinSession(db, session, identity);
      return true;
    });
  });
  if (!deleted) {
    throw new Error("Account deletion transaction did not complete.");
  }
}
