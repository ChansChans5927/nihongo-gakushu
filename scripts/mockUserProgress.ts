import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI is not set in .env file.");
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("nihongo_gakushu");
    const collection = db.collection("progress");

    const username = "gksqudcks";
    console.log(`Connecting to update user: ${username}`);

    // Generate study logs for the last 120 days (Mon-Sun continuous)
    const studyLogs: Record<string, number> = {};
    const today = new Date();

    for (let i = 0; i < 120; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Random study count between 5 and 15
      studyLogs[dateStr] = Math.floor(Math.random() * 11) + 5;
    }

    // Set claims and unlocks
    const updateResult = await collection.updateOne(
      { username: username },
      {
        $set: {
          studyLogs: studyLogs,
          unlockedThemes: ["default", "samurai", "yokai", "zen", "chalkboard", "golden_sakura", "golden_aura"],
          points: 8800,
          currentTheme: "golden_sakura" // pre-equip golden_sakura to show it off
        }
      },
      { upsert: true }
    );

    console.log(`Update successful. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}, Upserted: ${updateResult.upsertedCount}`);
    
    // Print the document to verify
    const updatedUser = await collection.findOne({ username: username });
    console.log("Updated Progress Document:", {
      username: updatedUser?.username,
      points: updatedUser?.points,
      currentTheme: updatedUser?.currentTheme,
      unlockedThemes: updatedUser?.unlockedThemes,
      totalLogsCount: Object.keys(updatedUser?.studyLogs || {}).length
    });

  } catch (error) {
    console.error("Database update error:", error);
  } finally {
    await client.close();
  }
}

run();
