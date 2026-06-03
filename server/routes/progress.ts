import express from "express";
import { getDB } from "../db.ts";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.ts";

const router = express.Router();

// Apply authMiddleware globally to all routes in this router
router.use(authMiddleware as any);

// GET Endpoint to fetch user progress
router.get("/progress/get", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db.collection("progress").findOne({ username: normalizedUsername });
    res.json({
      success: true,
      masteredKanjis: progress?.masteredKanjis || [],
      masteredVocabs: progress?.masteredVocabs || []
    });
  } catch (err: any) {
    console.error("Get progress error:", err);
    res.json({ success: false, errorMsg: `진행률을 가져오는 중 오류가 발생했습니다: ${err.message}` });
  }
});

// GET Endpoint to fetch user settings
router.get("/user/settings", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await db.collection("users").findOne({ username: normalizedUsername });
    res.json({
      success: true,
      data: {
        notificationsEnabled: user?.notificationsEnabled || false,
        ttsSpeed: user?.ttsSpeed || "normal",
        ttsGender: user?.ttsGender || "female"
      }
    });
  } catch (err: any) {
    res.json({ success: false, errorMsg: `설정을 가져오는 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to save user settings
router.post("/user/settings", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { notificationsEnabled, ttsSpeed, ttsGender } = req.body;
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const updateDoc: any = {};
    if (notificationsEnabled !== undefined) updateDoc.notificationsEnabled = notificationsEnabled;
    if (ttsSpeed !== undefined) updateDoc.ttsSpeed = ttsSpeed;
    if (ttsGender !== undefined) updateDoc.ttsGender = ttsGender;

    await db.collection("users").updateOne(
      { username: normalizedUsername },
      { $set: updateDoc },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.json({ success: false, errorMsg: `설정을 저장하는 중 오류가 발생했습니다: ${err.message}` });
  }
});

// DELETE Endpoint to delete user account
router.delete("/user", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();

    // Delete user
    await db.collection("users").deleteOne({ username: normalizedUsername });

    // Delete associated data (progress, subscriptions)
    await db.collection("progress").deleteMany({ username: normalizedUsername });
    await db.collection("subscriptions").deleteMany({ username: normalizedUsername });

    res.json({ success: true });
  } catch (err: any) {
    res.json({ success: false, errorMsg: `계정 삭제 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to save user progress
router.post("/progress/save", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { type, items } = req.body;
  if (!type || !Array.isArray(items)) {
    return res.json({ success: false, errorMsg: "올바르지 않은 요청 데이터입니다." });
  }

  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const field = type === "kanji" ? "masteredKanjis" : "masteredVocabs";

    await db.collection("progress").updateOne(
      { username: normalizedUsername },
      { $addToSet: { [field]: { $each: items } } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err: any) {
    console.error("Save progress error:", err);
    res.json({ success: false, errorMsg: `진행률 저장 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to reset user progress
router.post("/progress/reset", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { type } = req.body;
  if (!type) {
    return res.json({ success: false, errorMsg: "올바르지 않은 요청 데이터입니다." });
  }

  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const field = type === "kanji" ? "masteredKanjis" : "masteredVocabs";

    await db.collection("progress").updateOne(
      { username: normalizedUsername },
      { $set: { [field]: [] } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err: any) {
    console.error("Reset progress error:", err);
    res.json({ success: false, errorMsg: `진행률 초기화 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint to fetch review cards
router.post("/progress/review", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { type } = req.body;

  if (!type) {
    return res.json({ success: false, errorMsg: "올바르지 않은 요청 데이터입니다." });
  }

  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db.collection("progress").findOne({ username: normalizedUsername });
    const list: string[] = type === "kanji"
      ? (progress?.masteredKanjis || [])
      : (progress?.masteredVocabs || []);

    if (list.length === 0) {
      return res.json({ success: true, data: [], quiz: [], message: "복습할 단어가 아직 없습니다!" });
    }

    const selectedKeys = [...list].sort(() => 0.5 - Math.random());

    if (type === "kanji") {
      let cachedCards: any[] = [];
      try {
        cachedCards = await db.collection("kanjis").find({ kanji: { $in: selectedKeys } }).toArray();
      } catch (err) {
        console.error("Failed to fetch cached kanjis from DB:", err);
      }

      const orderedCards = selectedKeys.map(k => cachedCards.find((c: any) => c.kanji === k)).filter(Boolean);

      if (orderedCards.length === 0) {
        return res.json({ success: false, errorMsg: "복습용 한자 카드를 불러오는 데 실패했습니다." });
      }
      res.json({ success: true, source: "mongodb_cache", data: orderedCards });
    } else {
      let cards: any[] = [];
      let quizzes: any[] = [];
      try {
        cards = await db.collection("vocabs").find({ word: { $in: selectedKeys } }).toArray();
        quizzes = await db.collection("vocab_quizzes").find({ targetWord: { $in: selectedKeys } }).toArray();
      } catch (err) {
        console.error("Failed to fetch cached vocab review data:", err);
      }

      const orderedCards = selectedKeys.map(w => cards.find((c: any) => c.word === w)).filter(Boolean);
      const orderedQuizzes = selectedKeys.map((w, idx) => {
        const q = quizzes.find((item: any) => item.targetWord === w);
        if (!q) return null;
        const associatedItem = orderedCards.find((c: any) => c.word === w);
        return {
          ...q,
          id: idx + 1,
          vocabItem: associatedItem
        };
      }).filter(Boolean);

      res.json({ success: true, source: "mongodb_cache", data: orderedCards, quiz: orderedQuizzes });
    }
  } catch (err: any) {
    console.error("Review fetching error:", err);
    res.json({ success: false, errorMsg: `복습 단어를 가져오는 중 오류가 발생했습니다: ${err.message}` });
  }
});

export default router;
