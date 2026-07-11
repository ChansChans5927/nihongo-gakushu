import cron from "node-cron";
import fs from "fs";
import path from "path";
import { getDB } from "../db.ts";

const PORT = parseInt(process.env.PORT || "3000", 10);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const MASTER_KANJI_PATH = path.join(process.cwd(), "server", "data", "kanji_master.json");
const MASTER_VOCAB_PATH = path.join(process.cwd(), "server", "data", "vocab_master.json");

const STEPS = [
  { level: "N5", type: "kanji" },
  { level: "N4", type: "kanji" },
  { level: "N3", type: "kanji" },
  { level: "N2", type: "kanji" },
  { level: "N1", type: "kanji" },
  { level: "N5", type: "vocab" },
  { level: "N4", type: "vocab" },
  { level: "N3", type: "vocab" },
  { level: "N2", type: "vocab" },
  { level: "N1", type: "vocab" },
  { level: "N5", type: "jlpt" },
  { level: "N4", type: "jlpt" },
  { level: "N3", type: "jlpt" },
  { level: "N2", type: "jlpt" },
  { level: "N1", type: "jlpt" },
];

async function getNextSchedulerStep(db: any): Promise<number> {
  try {
    const state = await db.collection("scheduler_states").findOne({ id: "data_generator" });
    if (state && typeof state.nextStep === "number") {
      return state.nextStep;
    }
  } catch (err) {
    console.error("[Cron] Failed to fetch scheduler state from DB:", err);
  }
  return 0;
}

async function updateSchedulerState(db: any, nextStep: number) {
  try {
    await db.collection("scheduler_states").updateOne(
      { id: "data_generator" },
      {
        $set: {
          nextStep,
          lastRun: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("[Cron] Failed to update scheduler state in DB:", err);
  }
}

export async function triggerScheduledTask() {
  const db = getDB();
  if (!db) {
    console.error("[Cron] Database connection not available. Skipping task.");
    return;
  }

  const currentStepIndex = await getNextSchedulerStep(db);
  const step = STEPS[currentStepIndex];
  console.log(`[Cron] Starting sequential step ${currentStepIndex}/14: ${step.level} ${step.type.toUpperCase()}`);

  try {
    if (step.type === "kanji") {
      // 1. Load Master Kanji list
      if (!fs.existsSync(MASTER_KANJI_PATH)) {
        throw new Error("Master kanji file not found. Run downloadMasterData script first.");
      }
      const masterKanjiData = JSON.parse(fs.readFileSync(MASTER_KANJI_PATH, "utf8"));
      const levelKanjis: string[] = masterKanjiData[step.level] || [];

      // 2. Fetch already cached Kanjis in DB (globally, matching character to prevent level mismatch duplicates)
      const dbKanjis = await db.collection("kanjis").find({ kanji: { $in: levelKanjis } }).toArray();
      const existingKanjis = new Set(dbKanjis.map((k: any) => k.kanji));

      // 3. Find 5 Kanjis not in DB
      const targetKanjis = levelKanjis.filter(k => !existingKanjis.has(k)).slice(0, 5);

      if (targetKanjis.length === 0) {
        console.log(`[Cron] All master kanjis for ${step.level} already exist in DB. Skipping API generation.`);
      } else {
        console.log(`[Cron] Selected target kanjis: ${JSON.stringify(targetKanjis)}`);
        
        // 4. Trigger generation API
        const response = await fetch(`${BASE_URL}/api/kanji/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: step.level,
            targetKanjis,
            forceGenerate: true,
          }),
        });

        const result = await response.json();
        if (result.success) {
          console.log(`[Cron] Successfully generated and stored new kanjis: ${targetKanjis.join(", ")}`);
        } else {
          throw new Error(`Kanji generation API failed: ${result.errorMsg}`);
        }
      }
    } 
    else if (step.type === "vocab") {
      // 1. Load Master Vocab list
      if (!fs.existsSync(MASTER_VOCAB_PATH)) {
        throw new Error("Master vocab file not found. Run downloadMasterData script first.");
      }
      const masterVocabData = JSON.parse(fs.readFileSync(MASTER_VOCAB_PATH, "utf8"));
      const levelVocabs: { word: string; reading: string }[] = masterVocabData[step.level] || [];

      // 2. Fetch already cached Vocabs in DB (globally, matching word to prevent level mismatch duplicates)
      const targetWordsOnly = levelVocabs.map(v => v.word);
      const dbVocabs = await db.collection("vocabs").find({ word: { $in: targetWordsOnly } }).toArray();
      const existingWords = new Set(dbVocabs.map((v: any) => v.word));

      // 3. Find 5 Words not in DB
      const targetVocabs = levelVocabs.filter(v => !existingWords.has(v.word)).slice(0, 5);

      if (targetVocabs.length === 0) {
        console.log(`[Cron] All master vocabs for ${step.level} already exist in DB. Skipping API generation.`);
      } else {
        console.log(`[Cron] Selected target vocabs: ${JSON.stringify(targetVocabs.map(v => v.word))}`);
        
        // 4. Trigger generation API
        const response = await fetch(`${BASE_URL}/api/vocab/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: step.level,
            targetVocabs,
            forceGenerate: true,
          }),
        });

        const result = await response.json();
        if (result.success) {
          console.log(`[Cron] Successfully generated and stored new vocabs: ${targetVocabs.map(v => v.word).join(", ")}`);
        } else {
          throw new Error(`Vocab generation API failed: ${result.errorMsg}`);
        }
      }
    } 
    else if (step.type === "jlpt") {
      console.log(`[Cron] Generating 5 new JLPT mock questions for ${step.level}...`);
      
      // Trigger generation API (internally filters duplicates based on questionSentence)
      const response = await fetch(`${BASE_URL}/api/jlpt/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: step.level,
          count: 5,
          forceGenerate: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log(`[Cron] Successfully generated and stored 5 new JLPT questions for ${step.level}.`);
      } else {
        throw new Error(`JLPT generation API failed: ${result.errorMsg}`);
      }
    }

    // Move to next step (0 to 14 loop)
    const nextStepIndex = (currentStepIndex + 1) % STEPS.length;
    await updateSchedulerState(db, nextStepIndex);
    console.log(`[Cron] Step execution completed. Next step: ${nextStepIndex} (${STEPS[nextStepIndex].level} ${STEPS[nextStepIndex].type.toUpperCase()})`);
  } catch (err) {
    console.error(`[Cron] Error executing scheduler step ${currentStepIndex}:`, err);
  }
}

export function startDataGeneratorScheduler() {
  // Runs every day at 3:00 AM Seoul time
  cron.schedule(
    "0 13 * * *",
    async () => {
      console.log("[Cron] Starting daily data generation cycle...");
      await triggerScheduledTask();
    },
    {
      timezone: "Asia/Seoul",
    }
  );

  console.log("Data generator cron scheduler started. Runs daily at 1:00 PM (13:00) Asia/Seoul.");
}
