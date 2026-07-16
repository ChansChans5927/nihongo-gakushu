import express from "express";
import { getDB } from "../db.ts";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.ts";
import { Expo } from "expo-server-sdk";
import { isPlainRecord, isSafeString } from "../services/inputValidation.ts";

const router = express.Router();

// POST Endpoint for Push Subscription
router.post("/subscribe", authMiddleware as any, async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  if (!isPlainRecord(req.body)) {
    return res.status(400).json({ success: false, errorMsg: "올바르지 않은 구독 데이터입니다." });
  }

  let subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: { p256dh: string; auth: string };
  } | undefined;
  if (req.body.subscription !== undefined) {
    const raw = req.body.subscription;
    const expirationTime = isPlainRecord(raw) ? raw.expirationTime : undefined;
    if (
      !isPlainRecord(raw) ||
      !isSafeString(raw.endpoint, { maxLength: 2_048 }) ||
      !isPlainRecord(raw.keys) ||
      !isSafeString(raw.keys.p256dh, { maxLength: 512 }) ||
      !isSafeString(raw.keys.auth, { maxLength: 512 }) ||
      !(
        expirationTime === null ||
        (typeof expirationTime === "number" &&
          Number.isFinite(expirationTime) &&
          expirationTime >= 0)
      )
    ) {
      return res.status(400).json({ success: false, errorMsg: "올바르지 않은 웹 푸시 구독 정보입니다." });
    }
    try {
      const endpoint = new URL(raw.endpoint);
      if (endpoint.protocol !== "https:") throw new Error("invalid protocol");
    } catch {
      return res.status(400).json({ success: false, errorMsg: "올바르지 않은 웹 푸시 주소입니다." });
    }
    subscription = {
      endpoint: raw.endpoint.trim(),
      expirationTime: expirationTime as number | null,
      keys: {
        p256dh: raw.keys.p256dh.trim(),
        auth: raw.keys.auth.trim(),
      },
    };
  }

  const expoPushToken = req.body.expoPushToken;
  if (
    expoPushToken !== undefined &&
    (typeof expoPushToken !== "string" || !Expo.isExpoPushToken(expoPushToken))
  ) {
    return res.status(400).json({ success: false, errorMsg: "올바르지 않은 엑스포 푸시 토큰입니다." });
  }
  if (!subscription && expoPushToken === undefined) {
    return res.status(400).json({ success: false, errorMsg: "구독 정보 또는 엑스포 토큰이 필요합니다." });
  }
  
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const updateData: any = { notificationsEnabled: true };
    if (subscription) updateData.pushSubscription = subscription;
    if (expoPushToken !== undefined) updateData.expoPushToken = expoPushToken;

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
