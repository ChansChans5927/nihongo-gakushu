import { MongoClient, Db } from "mongodb";

let db: Db | null = null;
let client: MongoClient | null = null;

export async function ensureDatabaseIndexes(database: Db): Promise<void> {
  await database
    .collection("quiz_attempts")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database
    .collection("users")
    .createIndex({ username: 1 }, { unique: true });
  await database
    .collection("progress")
    .createIndex({ username: 1 }, { unique: true });
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function connectDB(): Promise<Db | null> {
  if (db) return db;

  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    const pendingClient = new MongoClient(mongoUri);
    try {
      await pendingClient.connect();
      const pendingDb = pendingClient.db("nihongo_gakushu");
      await ensureDatabaseIndexes(pendingDb);

      client = pendingClient;
      db = pendingDb;
      console.log("Connected to MongoDB Atlas successfully.");
      return db;
    } catch (dbErr) {
      await pendingClient.close().catch((closeErr) => {
        console.error("Failed to close MongoDB client:", closeErr);
      });
      client = null;
      db = null;
      console.error("Failed to connect to MongoDB Atlas:", dbErr);
      return null;
    }
  } else {
    console.warn("MONGODB_URI is not configured in .env. Running without DB caching.");
    return null;
  }
}

export function getDB(): Db | null {
  return db;
}

export function getDBClient(): MongoClient | null {
  return client;
}
