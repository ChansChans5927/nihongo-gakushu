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
      const messages = [
        { title: "📚 일본어 복습", body: "학습한 단어와 한자를 다시 확인해 보세요." },
        { title: "📚 일본어 복습", body: "복습할 단어와 한자가 준비되어 있습니다." },
        { title: "📚 일본어 복습", body: "복습을 통해 기억을 더 오래 유지해 보세요." }
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const payload = JSON.stringify(randomMessage);

      const expoMessages: any[] = [];

      for (const user of users) {
        if (user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
          expoMessages.push({
            to: user.expoPushToken,
            sound: "default",
            title: randomMessage.title,
            body: randomMessage.body,
            data: { type: "routine_study" }
          });
        }

        if (user.pushSubscription) {
          try {
            await webpush.sendNotification(user.pushSubscription, payload);
            console.log(`[Push] Sent Web Push to ${user.username}`);
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
