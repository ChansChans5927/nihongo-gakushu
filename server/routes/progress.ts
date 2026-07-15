import express from "express";
import { getDB } from "../db.ts";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authMiddleware.ts";
import {
  calculateQuizPoints,
  getKoreanDateString,
} from "../services/points.ts";
import { getThemePrice, isThemeId } from "../../shared/themeCatalog.ts";

const router = express.Router();

// Apply authMiddleware globally to all routes in this router
router.use(authMiddleware as any);

// Helper function to check if the 1.5x points density booster is active (>= 24 study days in the last 30 days)
function checkDensityBooster(
  studyLogs: Record<string, number> | undefined,
  baseDateStr?: string,
): boolean {
  if (!studyLogs) return false;
  const baseDate = baseDateStr
    ? new Date(baseDateStr)
    : new Date(getKoreanDateString());
  let activeDaysCount = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (studyLogs[dateStr] && studyLogs[dateStr] > 0) {
      activeDaysCount++;
    }
  }
  return activeDaysCount >= 24;
}

// GET Endpoint to fetch user progress
router.get("/progress/get", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db
      .collection("progress")
      .findOne({ username: normalizedUsername });
    res.json({
      success: true,
      masteredKanjis: progress?.masteredKanjis || [],
      masteredVocabs: progress?.masteredVocabs || [],
      bookmarkedKanjis: progress?.bookmarkedKanjis || [],
      bookmarkedVocabs: progress?.bookmarkedVocabs || [],
      points: progress?.points || 0,
      unlockedThemes: progress?.unlockedThemes || ["default"],
      currentTheme: progress?.currentTheme || "default",
      studyLogs: progress?.studyLogs || {},
      claimedWeeklyRewards: progress?.claimedWeeklyRewards || [],
      claimedMilestones: progress?.claimedMilestones || [],
    });
  } catch (err: any) {
    console.error("Get progress error:", err);
    res.json({
      success: false,
      errorMsg: `진행률을 가져오는 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// GET Endpoint to fetch user settings
router.get("/user/settings", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await db
      .collection("users")
      .findOne({ username: normalizedUsername });
    res.json({
      success: true,
      data: {
        notificationsEnabled: user?.notificationsEnabled || false,
        ttsSpeed: user?.ttsSpeed || "normal",
        ttsGender: user?.ttsGender || "female",
      },
    });
  } catch (err: any) {
    res.json({
      success: false,
      errorMsg: `설정을 가져오는 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to save user settings
router.post("/user/settings", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { notificationsEnabled, ttsSpeed, ttsGender } = req.body;
  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const updateDoc: any = {};
    if (notificationsEnabled !== undefined)
      updateDoc.notificationsEnabled = notificationsEnabled;
    if (ttsSpeed !== undefined) updateDoc.ttsSpeed = ttsSpeed;
    if (ttsGender !== undefined) updateDoc.ttsGender = ttsGender;

    await db
      .collection("users")
      .updateOne(
        { username: normalizedUsername },
        { $set: updateDoc },
        { upsert: true },
      );
    res.json({ success: true });
  } catch (err: any) {
    res.json({
      success: false,
      errorMsg: `설정을 저장하는 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// DELETE Endpoint to delete user account
router.delete("/user", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }
  try {
    const normalizedUsername = username.trim().toLowerCase();

    // Delete user
    await db.collection("users").deleteOne({ username: normalizedUsername });

    // Delete associated data (progress, subscriptions)
    await db
      .collection("progress")
      .deleteMany({ username: normalizedUsername });
    await db
      .collection("subscriptions")
      .deleteMany({ username: normalizedUsername });

    res.json({ success: true });
  } catch (err: any) {
    res.json({
      success: false,
      errorMsg: `계정 삭제 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to save user progress
router.post("/progress/save", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { type, items } = req.body;
  if (!type || !Array.isArray(items)) {
    return res.json({
      success: false,
      errorMsg: "올바르지 않은 요청 데이터입니다.",
    });
  }

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const field = type === "kanji" ? "masteredKanjis" : "masteredVocabs";
    const serverDate = getKoreanDateString();

    const updateDoc: any = {
      $addToSet: { [field]: { $each: items } },
    };

    if (items.length > 0) {
      updateDoc.$inc = { [`studyLogs.${serverDate}`]: items.length };
    }

    await db
      .collection("progress")
      .updateOne({ username: normalizedUsername }, updateDoc, { upsert: true });

    res.json({ success: true });
  } catch (err: any) {
    console.error("Save progress error:", err);
    res.json({
      success: false,
      errorMsg: `진행률 저장 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to award server-calculated quiz points (boosted if study density is high)
router.post("/progress/addPoints", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { activity, correctCount, questionCount } = req.body;
  const date = getKoreanDateString();

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db
      .collection("progress")
      .findOne({ username: normalizedUsername });

    let maximumQuestionCount = 20;
    if (activity === "kanji_review") {
      maximumQuestionCount = Array.isArray(progress?.masteredKanjis)
        ? progress.masteredKanjis.length
        : 0;
    } else if (activity === "vocab_review") {
      maximumQuestionCount = Array.isArray(progress?.masteredVocabs)
        ? progress.masteredVocabs.length
        : 0;
    }

    const basePoints = calculateQuizPoints(
      activity,
      correctCount,
      questionCount,
      maximumQuestionCount,
    );
    if (basePoints === null) {
      return res
        .status(400)
        .json({
          success: false,
          errorMsg: "올바르지 않은 퀴즈 보상 요청입니다.",
        });
    }

    // Check points density booster (>= 80% density in the last 30 days)
    const hasBooster = checkDensityBooster(progress?.studyLogs, date);
    const finalPoints = hasBooster ? Math.round(basePoints * 1.5) : basePoints;

    const updateDoc: any = {
      $inc: { points: finalPoints },
    };

    if (date) {
      if (!updateDoc.$inc) updateDoc.$inc = {};
      updateDoc.$inc[`studyLogs.${date}`] = 1; // Log at least 1 study event
    }

    await db
      .collection("progress")
      .updateOne({ username: normalizedUsername }, updateDoc, { upsert: true });
    res.json({
      success: true,
      pointsAdded: finalPoints,
      boosterActive: hasBooster,
    });
  } catch (err: any) {
    console.error("Add points error:", err);
    res.json({
      success: false,
      errorMsg: `포인트 적립 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to claim weekly perfect study reward (all 7 days of the week completed)
router.post("/progress/claimWeekly", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { weekStart } = req.body; // The YYYY-MM-DD Monday date string
  if (!weekStart) {
    return res.json({
      success: false,
      errorMsg: "올바르지 않은 요청 데이터입니다.",
    });
  }

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db
      .collection("progress")
      .findOne({ username: normalizedUsername });
    if (!progress) {
      return res.json({
        success: false,
        errorMsg: "사용자 진행 기록을 찾을 수 없습니다.",
      });
    }

    const claimedWeeklyRewards = progress.claimedWeeklyRewards || [];
    if (claimedWeeklyRewards.includes(weekStart)) {
      return res.json({
        success: false,
        errorMsg: "이미 보상을 수령한 주간입니다.",
      });
    }

    // Check all 7 days of the week starting at weekStart
    const baseDate = new Date(weekStart);
    const studyLogs = progress.studyLogs || {};
    let perfect = true;
    const missingDays: string[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      if (!studyLogs[dateStr] || studyLogs[dateStr] <= 0) {
        perfect = false;
        missingDays.push(dateStr);
      }
    }

    if (!perfect) {
      return res.json({
        success: false,
        errorMsg: `해당 주간에 학습 기록이 없는 날이 있습니다. (누락: ${missingDays.join(", ")})`,
      });
    }

    await db.collection("progress").updateOne(
      { username: normalizedUsername },
      {
        $inc: { points: 300 },
        $addToSet: { claimedWeeklyRewards: weekStart } as any,
      },
    );

    res.json({ success: true, pointsAdded: 300 });
  } catch (err: any) {
    console.error("Claim weekly reward error:", err);
    res.json({
      success: false,
      errorMsg: `주간 완주 보상 처리 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to claim cumulative study days milestone reward
router.post(
  "/progress/claimMilestone",
  async (req: AuthenticatedRequest, res) => {
    const username = req.user!.username;
    const { milestone } = req.body; // "15", "30", "100"
    if (!["15", "30", "100"].includes(milestone)) {
      return res.json({
        success: false,
        errorMsg: "올바르지 않은 마일스톤 종류입니다.",
      });
    }

    const db = getDB();
    if (!db) {
      return res.json({
        success: false,
        errorMsg: "데이터베이스 연결에 실패했습니다.",
      });
    }

    try {
      const normalizedUsername = username.trim().toLowerCase();
      const progress = await db
        .collection("progress")
        .findOne({ username: normalizedUsername });
      if (!progress) {
        return res.json({
          success: false,
          errorMsg: "사용자 진행 기록을 찾을 수 없습니다.",
        });
      }

      const claimedMilestones = progress.claimedMilestones || [];
      if (claimedMilestones.includes(milestone)) {
        return res.json({
          success: false,
          errorMsg: "이미 보상을 수령한 마일스톤입니다.",
        });
      }

      const studyLogs = progress.studyLogs || {};
      const totalStudyDays = Object.keys(studyLogs).filter(
        (d) => studyLogs[d] > 0,
      ).length;
      const requiredDays = parseInt(milestone);

      if (totalStudyDays < requiredDays) {
        return res.json({
          success: false,
          errorMsg: `아직 달성 조건인 ${requiredDays}일 공부를 완료하지 못했습니다. (현재: ${totalStudyDays}일)`,
        });
      }

      let rewardPoints = 0;
      const updateQuery: any = {
        $addToSet: { claimedMilestones: milestone },
      };

      if (milestone === "15") {
        rewardPoints = 500;
      } else if (milestone === "30") {
        if (!updateQuery.$addToSet) updateQuery.$addToSet = {};
        updateQuery.$addToSet.unlockedThemes = "golden_sakura";
      } else if (milestone === "100") {
        if (!updateQuery.$addToSet) updateQuery.$addToSet = {};
        updateQuery.$addToSet.unlockedThemes = "golden_aura";
      }

      if (rewardPoints > 0) {
        updateQuery.$inc = { points: rewardPoints };
      }

      await db
        .collection("progress")
        .updateOne({ username: normalizedUsername }, updateQuery);

      res.json({
        success: true,
        pointsAdded: rewardPoints,
        themeUnlocked:
          milestone === "30"
            ? "golden_sakura"
            : milestone === "100"
              ? "golden_aura"
              : null,
      });
    } catch (err: any) {
      console.error("Claim milestone reward error:", err);
      res.json({
        success: false,
        errorMsg: `마일스톤 보상 처리 중 오류가 발생했습니다: ${err.message}`,
      });
    }
  },
);

// POST Endpoint to buy a theme
router.post("/progress/buyTheme", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { theme } = req.body;
  const cost = getThemePrice(theme);
  if (cost === null) {
    return res
      .status(400)
      .json({ success: false, errorMsg: "구매할 수 없는 테마입니다." });
  }

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const result = await db.collection("progress").updateOne(
      {
        username: normalizedUsername,
        points: { $gte: cost },
        unlockedThemes: { $ne: theme },
      },
      {
        $inc: { points: -cost },
        $addToSet: { unlockedThemes: theme },
        $set: { currentTheme: theme }, // 자동 장착
      },
    );

    if (result.matchedCount === 0) {
      const progress = await db
        .collection("progress")
        .findOne({ username: normalizedUsername });
      const unlockedThemes = progress?.unlockedThemes || ["default"];
      if (unlockedThemes.includes(theme)) {
        return res.json({
          success: false,
          errorMsg: "이미 구매한 테마입니다.",
        });
      }
      return res.json({ success: false, errorMsg: "포인트가 부족합니다." });
    }

    res.json({ success: true, pointsSpent: cost });
  } catch (err: any) {
    console.error("Buy theme error:", err);
    res.json({
      success: false,
      errorMsg: `테마 구매 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to equip a theme
router.post("/progress/equipTheme", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { theme } = req.body;
  if (!isThemeId(theme)) {
    return res
      .status(400)
      .json({ success: false, errorMsg: "존재하지 않는 테마입니다." });
  }

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db
      .collection("progress")
      .findOne({ username: normalizedUsername });
    const unlockedThemes = progress?.unlockedThemes || [];

    if (theme !== "default" && !unlockedThemes.includes(theme)) {
      return res.json({
        success: false,
        errorMsg: "구매하지 않은 테마입니다.",
      });
    }

    await db
      .collection("progress")
      .updateOne(
        { username: normalizedUsername },
        { $set: { currentTheme: theme } },
        { upsert: true },
      );
    res.json({ success: true });
  } catch (err: any) {
    console.error("Equip theme error:", err);
    res.json({
      success: false,
      errorMsg: `테마 장착 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to reset user progress
router.post("/progress/reset", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { type } = req.body;
  if (!type) {
    return res.json({
      success: false,
      errorMsg: "올바르지 않은 요청 데이터입니다.",
    });
  }

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const field = type === "kanji" ? "masteredKanjis" : "masteredVocabs";

    await db
      .collection("progress")
      .updateOne(
        { username: normalizedUsername },
        { $set: { [field]: [] } },
        { upsert: true },
      );

    res.json({ success: true });
  } catch (err: any) {
    console.error("Reset progress error:", err);
    res.json({
      success: false,
      errorMsg: `진행률 초기화 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to fetch review cards
router.post("/progress/review", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { type } = req.body;

  if (!type) {
    return res.json({
      success: false,
      errorMsg: "올바르지 않은 요청 데이터입니다.",
    });
  }

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const progress = await db
      .collection("progress")
      .findOne({ username: normalizedUsername });
    const list: string[] =
      type === "kanji"
        ? progress?.masteredKanjis || []
        : progress?.masteredVocabs || [];

    if (list.length === 0) {
      return res.json({
        success: true,
        data: [],
        quiz: [],
        message: "복습할 단어가 아직 없습니다!",
      });
    }

    const selectedKeys = [...list].sort(() => 0.5 - Math.random());

    if (type === "kanji") {
      let cachedCards: any[] = [];
      try {
        cachedCards = await db
          .collection("kanjis")
          .find({ kanji: { $in: selectedKeys } })
          .toArray();
      } catch (err) {
        console.error("Failed to fetch cached kanjis from DB:", err);
      }

      const orderedCards = selectedKeys
        .map((k) => cachedCards.find((c: any) => c.kanji === k))
        .filter(Boolean);

      if (orderedCards.length === 0) {
        return res.json({
          success: false,
          errorMsg: "복습용 한자 카드를 불러오는 데 실패했습니다.",
        });
      }
      res.json({ success: true, source: "mongodb_cache", data: orderedCards });
    } else {
      let cards: any[] = [];
      let quizzes: any[] = [];
      try {
        cards = await db
          .collection("vocabs")
          .find({ word: { $in: selectedKeys } })
          .toArray();
        quizzes = await db
          .collection("vocab_quizzes")
          .find({ targetWord: { $in: selectedKeys } })
          .toArray();
      } catch (err) {
        console.error("Failed to fetch cached vocab review data:", err);
      }

      const orderedCards = selectedKeys
        .map((w) => cards.find((c: any) => c.word === w))
        .filter(Boolean);
      const orderedQuizzes = selectedKeys
        .map((w, idx) => {
          const q = quizzes.find((item: any) => item.targetWord === w);
          if (!q) return null;
          const associatedItem = orderedCards.find((c: any) => c.word === w);
          return {
            ...q,
            id: idx + 1,
            vocabItem: associatedItem,
          };
        })
        .filter(Boolean);

      res.json({
        success: true,
        source: "mongodb_cache",
        data: orderedCards,
        quiz: orderedQuizzes,
      });
    }
  } catch (err: any) {
    console.error("Review fetching error:", err);
    res.json({
      success: false,
      errorMsg: `복습 단어를 가져오는 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// POST Endpoint to toggle bookmark status of kanji or vocab
router.post("/progress/bookmark", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { type, item } = req.body;
  if (!type || !item) {
    return res.json({
      success: false,
      errorMsg: "올바르지 않은 요청 데이터입니다.",
    });
  }

  const db = getDB();
  if (!db) {
    return res.json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const field = type === "kanji" ? "bookmarkedKanjis" : "bookmarkedVocabs";

    const progress = await db
      .collection("progress")
      .findOne({ username: normalizedUsername });
    const list = progress?.[field] || [];
    const isBookmarked = list.includes(item);

    if (isBookmarked) {
      await db
        .collection("progress")
        .updateOne(
          { username: normalizedUsername },
          { $pull: { [field]: item } as any },
          { upsert: true },
        );
    } else {
      await db
        .collection("progress")
        .updateOne(
          { username: normalizedUsername },
          { $addToSet: { [field]: item } as any },
          { upsert: true },
        );
    }

    res.json({ success: true, isBookmarked: !isBookmarked });
  } catch (err: any) {
    console.error("Toggle bookmark error:", err);
    res.json({
      success: false,
      errorMsg: `북마크 토글 중 오류가 발생했습니다: ${err.message}`,
    });
  }
});

// GET Endpoint to fetch detailed list of bookmarked cards
router.get(
  "/progress/bookmarks/details",
  async (req: AuthenticatedRequest, res) => {
    const username = req.user!.username;
    const { type } = req.query;

    if (type !== "kanji" && type !== "vocab") {
      return res.json({
        success: false,
        errorMsg: "올바르지 않은 유형입니다.",
      });
    }

    const db = getDB();
    if (!db) {
      return res.json({
        success: false,
        errorMsg: "데이터베이스 연결에 실패했습니다.",
      });
    }

    try {
      const normalizedUsername = username.trim().toLowerCase();
      const progress = await db
        .collection("progress")
        .findOne({ username: normalizedUsername });
      const list: string[] =
        type === "kanji"
          ? progress?.bookmarkedKanjis || []
          : progress?.bookmarkedVocabs || [];

      if (list.length === 0) {
        return res.json({ success: true, data: [] });
      }

      if (type === "kanji") {
        const cards = await db
          .collection("kanjis")
          .find({ kanji: { $in: list } })
          .toArray();
        const orderedCards = list
          .map((k) => cards.find((c: any) => c.kanji === k))
          .filter(Boolean);
        res.json({ success: true, data: orderedCards });
      } else {
        const cards = await db
          .collection("vocabs")
          .find({ word: { $in: list } })
          .toArray();
        const orderedCards = list
          .map((w) => cards.find((c: any) => c.word === w))
          .filter(Boolean);
        res.json({ success: true, data: orderedCards });
      }
    } catch (err: any) {
      console.error("Bookmarks details error:", err);
      res.json({
        success: false,
        errorMsg: `북마크 세부 정보를 가져오는 중 오류가 발생했습니다: ${err.message}`,
      });
    }
  },
);

export default router;
