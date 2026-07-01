import cron from "node-cron";
import { getDB } from "../db.ts";
import { webpush, expo } from "../config.ts";
import { Expo } from "expo-server-sdk";

export function startPushScheduler() {
  const sendPushNotifications = async () => {
    const db = getDB();
    if (!db) {
      console.error("[Push] Database connection not available. Skipping push notifications.");
      return;
    }
    try {
      const users = await db.collection("users").find({
        notificationsEnabled: true,
        $or: [
          { pushSubscription: { $exists: true } },
          { expoPushToken: { $exists: true } }
        ]
      }).toArray();

      const expoMessages: any[] = [];

      for (const user of users) {
        // Fetch progress to exclude mastered vocabs
        const progress = await db.collection("progress").findOne({ username: user.username });
        const masteredVocabs = progress?.masteredVocabs || [];
        
        // Find a random vocab from db that is not mastered
        const randomVocabList = await db.collection("vocabs").aggregate([
          { $match: { word: { $nin: masteredVocabs } } },
          { $sample: { size: 1 } }
        ]).toArray();

        let title = "📚 일본어 복습";
        let body = "오늘도 잊지 말고 일본어를 학습해 보세요!";
        let url = "/";
        let dataPayload: any = { type: "routine_study" };

        if (randomVocabList.length > 0) {
          const target = randomVocabList[0];
          title = `오늘의 단어: ${target.word}`;
          body = `뜻: ${target.meaning} - 지금 바로 세트 학습을 시작하세요!`;
          url = `/?action=study&type=vocab&item=${encodeURIComponent(target.word)}&level=${target.jlptLevel || 'N5'}`;
          dataPayload = {
            type: "deep_link_study",
            studyMode: "vocab",
            targetItem: target.word,
            level: target.jlptLevel || "N5"
          };
        }

        const payload = JSON.stringify({ title, body, url });

        if (user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
          expoMessages.push({
            to: user.expoPushToken,
            sound: "default",
            title,
            body,
            data: dataPayload
          });
        }

        if (user.pushSubscription) {
          try {
            await webpush.sendNotification(user.pushSubscription, payload);
            console.log(`[Push] Sent Web Push to ${user.username} with target ${dataPayload.targetItem || 'none'}`);
          } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
              await db.collection("users").updateOne(
                { username: user.username },
                { $unset: { pushSubscription: "" } }
              );
              console.log(`[Push] Removed expired subscription for ${user.username}`);
            } else {
              console.error(`[Push] Failed to send Web Push to ${user.username}:`, error);
            }
          }
        }
      }

      if (expoMessages.length > 0) {
        let chunks = expo.chunkPushNotifications(expoMessages);
        for (let chunk of chunks) {
          try {
            await expo.sendPushNotificationsAsync(chunk);
            console.log(`[Push] Sent Expo Push chunk of size ${chunk.length}`);
          } catch (error) {
            console.error("Expo push notification chunk failed:", error);
          }
        }
      }

    } catch (err) {
      console.error("[Push] Cron job error:", err);
    }
  };

  cron.schedule("0 7 * * *", () => {
    console.log("[Cron] Running 7 AM push notifications");
    sendPushNotifications();
  }, { timezone: "Asia/Seoul" });

  cron.schedule("0 19 * * *", () => {
    console.log("[Cron] Running 7 PM push notifications");
    sendPushNotifications();
  }, { timezone: "Asia/Seoul" });

  console.log("Push notification cron scheduler started. Runs daily at 7:00 AM and 7:00 PM Asia/Seoul.");
}
