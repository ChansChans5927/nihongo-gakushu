import { connectDB, getDB } from "../server/db.ts";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  await connectDB();
  const db = getDB();
  if (!db) { console.log("DB not connected"); process.exit(1); }

  // 1. Scheduler state
  const state = await db.collection("scheduler_states").findOne({ id: "data_generator" });
  console.log("\n=== Scheduler State ===");
  console.log(JSON.stringify(state, null, 2));

  // 2. Kanji counts per level
  console.log("\n=== Kanji counts per level ===");
  for (const level of ["N5", "N4", "N3", "N2", "N1"]) {
    const count = await db.collection("kanjis").countDocuments({ jlptLevel: level });
    console.log(`  ${level}: ${count}개`);
  }

  // 3. Vocab counts per level
  console.log("\n=== Vocab counts per level ===");
  for (const level of ["N5", "N4", "N3", "N2", "N1"]) {
    const count = await db.collection("vocabs").countDocuments({ jlptLevel: level });
    console.log(`  ${level}: ${count}개`);
  }

  // 4. JLPT question counts per level
  console.log("\n=== JLPT question counts per level ===");
  for (const level of ["N5", "N4", "N3", "N2", "N1"]) {
    const count = await db.collection("jlpt_questions").countDocuments({ level: level });
    console.log(`  ${level}: ${count}개`);
  }

  process.exit(0);
}
check();
