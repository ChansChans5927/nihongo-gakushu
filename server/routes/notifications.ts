import express from "express";
import { getDB } from "../db.ts";
import { webpush, expo } from "../config.ts";
import { Expo } from "expo-server-sdk";

const router = express.Router();

// POST Endpoint for Push Subscription
router.post("/subscribe", async (req, res) => {
  const { username, subscription, expoPushToken } = req.body;
  if (!username) {
    return res.json({ success: false, errorMsg: "잘못된 요청입니다." });
  }
  if (!subscription && !expoPushToken) {
    return res.json({ success: false, errorMsg: "구독 정보 또는 엑스포 토큰이 필요합니다." });
  }
  
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }
  try {
    const normalizedUsername = String(username).trim().toLowerCase();
    const updateData: any = { notificationsEnabled: true };
    if (subscription) updateData.pushSubscription = subscription;
    if (expoPushToken) updateData.expoPushToken = expoPushToken;

    await db.collection("users").updateOne(
      { username: normalizedUsername },
      { $set: updateData }
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error("Push subscription error:", err);
    res.json({ success: false, errorMsg: `구독 저장 중 오류가 발생했습니다: ${err.message}` });
  }
});

// GET Endpoint to fetch VAPID Public Key
router.get("/vapidPublicKey", (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY || "");
});

// POST Endpoint to test Push Notification
router.post("/test", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.json({ success: false, errorMsg: "사용자 정보가 필요합니다." });
  }
  
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }
  try {
    const normalizedUsername = String(username).trim().toLowerCase();
    const user = await db.collection("users").findOne({ username: normalizedUsername });

    if (!user || (!user.pushSubscription && !user.expoPushToken)) {
      return res.json({ success: false, errorMsg: "알림 설정이 되어있지 않거나 구독 정보가 없습니다." });
    }

    const payload = JSON.stringify({
      title: "✅ 알림 테스트 성공!",
      body: "알림이 정상적으로 수신되었습니다. 앞으로 정기 학습 알림을 받아보세요!",
    });

    if (user.expoPushToken) {
      if (!Expo.isExpoPushToken(user.expoPushToken)) {
        console.error("Invalid Expo push token");
      } else {
        await expo.sendPushNotificationsAsync([{
          to: user.expoPushToken,
          sound: "default",
          title: "✅ 알림 테스트 성공!",
          body: "알림이 정상적으로 수신되었습니다. 앞으로 정기 학습 알림을 받아보세요!",
          data: { test: true },
        }]);
      }
    }

    if (user.pushSubscription) {
      await webpush.sendNotification(user.pushSubscription, payload);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Test push error:", err);
    res.json({ success: false, errorMsg: `테스트 알림 발송 중 오류가 발생했습니다: ${err.message}` });
  }
});

export default router;
