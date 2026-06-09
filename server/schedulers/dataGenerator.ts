import cron from "node-cron";

const PORT = parseInt(process.env.PORT || "3000", 10);
const BASE_URL = `http://127.0.0.1:${PORT}`;

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const BATCH_SIZE = 5;

async function generateDataForCategory(category: string, endpoint: string, levels: string[]) {
  for (const level of levels) {
    try {
      console.log(`[Cron] Triggering ${category} generation for ${level}...`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          count: BATCH_SIZE,
          forceGenerate: true
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`[Cron] Successfully generated and cached ${BATCH_SIZE} ${category} items for ${level}.`);
      } else {
        console.error(`[Cron] Failed to generate ${category} for ${level}:`, data.errorMsg);
      }
    } catch (err) {
      console.error(`[Cron] Error triggering ${category} generation for ${level}:`, err);
    }
    
    // 딜레이를 주어 API Rate Limit 방지
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

async function generateNews() {
  try {
    console.log(`[Cron] Triggering News generation...`);
    const response = await fetch(`${BASE_URL}/api/news/random?forceGenerate=true`);
    const data = await response.json();
    if (data.success) {
      console.log(`[Cron] Successfully generated and cached a new news lesson.`);
    } else {
      console.error(`[Cron] Failed to generate news:`, data.errorMsg);
    }
  } catch (err) {
    console.error(`[Cron] Error triggering news generation:`, err);
  }
}

export function startDataGeneratorScheduler() {
  // 매시간 정각에 실행 (예: 1:00, 2:00, 3:00...)
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Starting hourly data generation cycle...");
    
    // 순차적으로 실행하여 서버 및 API 부하 최소화
    await generateDataForCategory("Vocab", "/api/vocab/generate", LEVELS);
    await generateDataForCategory("Kanji", "/api/kanji/generate", LEVELS);
    await generateDataForCategory("JLPT", "/api/jlpt/generate", LEVELS);
    await generateNews();
    
    console.log("[Cron] Hourly data generation cycle completed.");
  });

  console.log("Data generator cron scheduler started. Runs every hour at minute 0.");
}
