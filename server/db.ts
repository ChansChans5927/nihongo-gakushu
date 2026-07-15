import { MongoClient, Db } from "mongodb";

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectDB(): Promise<Db | null> {
  if (db) return db;

  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db("nihongo_gakushu");
      await db
        .collection("quiz_attempts")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      console.log("Connected to MongoDB Atlas successfully.");
      return db;
    } catch (dbErr) {
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
