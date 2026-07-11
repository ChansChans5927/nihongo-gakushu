import express from "express";
import { getDB } from "../db.ts";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.ts";

const router = express.Router();

// POST Endpoint for Push Subscription
router.post("/subscribe", authMiddleware as any, async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { subscription, expoPushToken } = req.body;
  if (!subscription && !expoPushToken) {
    return res.json({ success: false, errorMsg: "구독 정보 또는 엑스포 토큰이 필요합니다." });
  }
  
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();
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

export default router;
