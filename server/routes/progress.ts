import express from "express";
import { getDB, getDBClient } from "../db.ts";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../middlewares/authMiddleware.ts";
import {
  calculateQuizPoints,
  getCompletedWeekDates,
  getKoreanDateString,
} from "../services/points.ts";
import { getThemePrice, isThemeId } from "../../shared/themeCatalog.ts";
import {
  createQuizAttempt,
  getCorrectItemKeys,
  gradeQuizAnswers,
  parseQuizAnswers,
  QuizAttemptDocument,
  QuizSubmissionResult,
} from "../services/quizAttempts.ts";
import {
  isEnumValue,
  isKanjiCharacter,
  isPlainRecord,
  isSafeString,
  isStudyType,
} from "../services/inputValidation.ts";

const router = express.Router();
const MAX_BOOKMARKS_PER_TYPE = 500;
const TTS_SPEEDS = ["slow", "normal", "fast"] as const;
const TTS_GENDERS = ["female", "male"] as const;

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
  if (!isPlainRecord(req.body)) {
    return res.status(400).json({
      success: false,
      errorMsg: "올바르지 않은 설정 데이터입니다.",
    });
  }

  const { notificationsEnabled, ttsSpeed, ttsGender } = req.body;
  if (
    (notificationsEnabled !== undefined &&
      typeof notificationsEnabled !== "boolean") ||
    (ttsSpeed !== undefined && !isEnumValue(ttsSpeed, TTS_SPEEDS)) ||
    (ttsGender !== undefined && !isEnumValue(ttsGender, TTS_GENDERS))
  ) {
    return res.status(400).json({
      success: false,
      errorMsg: "올바르지 않은 설정 값입니다.",
    });
  }

  const updateDoc: Record<string, boolean | string> = {};
  if (typeof notificationsEnabled === "boolean")
    updateDoc.notificationsEnabled = notificationsEnabled;
  if (isEnumValue(ttsSpeed, TTS_SPEEDS)) updateDoc.ttsSpeed = ttsSpeed;
  if (isEnumValue(ttsGender, TTS_GENDERS)) updateDoc.ttsGender = ttsGender;
  if (Object.keys(updateDoc).length === 0) {
    return res.status(400).json({
      success: false,
      errorMsg: "변경할 설정 값이 없습니다.",
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
    const result = await db
      .collection("users")
      .updateOne(
        { username: normalizedUsername },
        { $set: updateDoc },
      );
    if (result.matchedCount !== 1) {
      return res.status(404).json({
        success: false,
        errorMsg: "사용자 계정을 찾을 수 없습니다.",
      });
    }
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

// Legacy client-controlled mastery writes are no longer accepted.
router.post("/progress/save", (_req: AuthenticatedRequest, res) => {
  return res.status(410).json({
    success: false,
    errorMsg: "퀴즈 제출 API를 통해서만 학습 결과를 저장할 수 있습니다.",
  });
});

// Create a server-owned quiz attempt and return questions without answer keys.
router.post("/progress/quiz/start", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const db = getDB();
  if (!db) {
    return res.status(503).json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const attempt = await createQuizAttempt(db, normalizedUsername, req.body);
    res.status(201).json({ success: true, ...attempt });
  } catch (err: any) {
    console.error("Start quiz attempt error:", err);
    res.status(400).json({
      success: false,
      errorMsg: err.message || "퀴즈를 시작할 수 없습니다.",
    });
  }
});

// Submit answers once. The server grades the stored questions and awards points atomically.
router.post("/progress/quiz/submit", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const normalizedUsername = username.trim().toLowerCase();
  const { attemptId, answers: rawAnswers } = req.body;
  const db = getDB();
  const client = getDBClient();
  if (!db || !client) {
    return res.status(503).json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }
  if (
    typeof attemptId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptId)
  ) {
    return res.status(400).json({
      success: false,
      errorMsg: "올바르지 않은 퀴즈 시도 ID입니다.",
    });
  }

  try {
    const payload = await client.withSession(async (session) => {
      return session.withTransaction(async () => {
        const attempts = db.collection<QuizAttemptDocument>("quiz_attempts");
        const attempt = await attempts.findOne(
          { _id: attemptId, username: normalizedUsername },
          { session },
        );
        if (!attempt) {
          throw new Error("퀴즈 시도를 찾을 수 없습니다.");
        }

        if (attempt.submittedAt && attempt.result) {
          return {
            success: true,
            replayed: true,
            ...attempt.result,
            questions: attempt.questions,
          };
        }
        if (attempt.expiresAt.getTime() <= Date.now()) {
          throw new Error("퀴즈 제출 시간이 만료되었습니다.");
        }

        const answers = parseQuizAnswers(rawAnswers, attempt.questions);
        if (!answers) {
          throw new Error("올바르지 않은 답안 데이터입니다.");
        }

        const progressCollection = db.collection("progress");
        const progress = await progressCollection.findOne(
          { username: normalizedUsername },
          { session },
        );
        const correctCount = gradeQuizAnswers(attempt.questions, answers);
        const basePoints = correctCount > 0
          ? calculateQuizPoints(
              attempt.activity,
              correctCount,
              attempt.questions.length,
            )
          : 0;
        if (basePoints === null) {
          throw new Error("퀴즈 보상을 계산할 수 없습니다.");
        }

        const date = getKoreanDateString();
        const boosterActive = checkDensityBooster(progress?.studyLogs, date);
        const pointsAdded = boosterActive
          ? Math.round(basePoints * 1.5)
          : basePoints;
        const correctItemKeys = getCorrectItemKeys(
          attempt.activity,
          attempt.questions,
          answers,
        );

        const updateDoc: any = {
          $inc: {
            points: pointsAdded,
            [`studyLogs.${date}`]: 1,
          },
          $setOnInsert: {
            username: normalizedUsername,
            unlockedThemes: ["default"],
            currentTheme: "default",
          },
        };
        if (
          correctItemKeys.length > 0 &&
          !attempt.activity.endsWith("_review")
        ) {
          const field = attempt.activity.startsWith("kanji_")
            ? "masteredKanjis"
            : "masteredVocabs";
          updateDoc.$addToSet = { [field]: { $each: correctItemKeys } };
        }

        await progressCollection.updateOne(
          { username: normalizedUsername },
          updateDoc,
          { upsert: true, session },
        );

        const result: QuizSubmissionResult = {
          correctCount,
          questionCount: attempt.questions.length,
          pointsAdded,
          boosterActive,
          correctItemKeys,
        };
        const submitted = await attempts.updateOne(
          { _id: attemptId, submittedAt: { $exists: false } },
          { $set: { submittedAt: new Date(), result } },
          { session },
        );
        if (submitted.matchedCount !== 1) {
          throw new Error("이미 제출된 퀴즈입니다.");
        }

        return {
          success: true,
          replayed: false,
          ...result,
          questions: attempt.questions,
        };
      });
    });

    res.json(payload);
  } catch (err: any) {
    console.error("Submit quiz attempt error:", err);
    res.status(400).json({
      success: false,
      errorMsg: err.message || "퀴즈 제출 중 오류가 발생했습니다.",
    });
  }
});

router.post("/progress/addPoints", (_req: AuthenticatedRequest, res) => {
  return res.status(410).json({
    success: false,
    errorMsg: "더 이상 직접 포인트를 적립할 수 없습니다.",
  });
});

// POST Endpoint to claim weekly perfect study reward (all 7 days of the week completed)
router.post("/progress/claimWeekly", async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { weekStart } = req.body;
  const weekDates = getCompletedWeekDates(weekStart);
  if (!weekDates) {
    return res.status(400).json({
      success: false,
      errorMsg: "완료된 주의 월요일 날짜만 사용할 수 있습니다.",
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
    const result = await db.collection("progress").updateOne(
      {
        username: normalizedUsername,
        claimedWeeklyRewards: { $ne: weekStart },
        $and: weekDates.map((date) => ({ [`studyLogs.${date}`]: { $gt: 0 } })),
      },
      {
        $inc: { points: 300 },
        $addToSet: { claimedWeeklyRewards: weekStart } as any,
      },
    );

    if (result.modifiedCount !== 1) {
      return res.status(409).json({
        success: false,
        errorMsg: "이미 수령했거나 해당 주의 7일 학습 조건을 충족하지 못했습니다.",
      });
    }

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

      const result = await db
        .collection("progress")
        .updateOne(
          {
            username: normalizedUsername,
            claimedMilestones: { $ne: milestone },
          },
          updateQuery,
        );

      if (result.modifiedCount !== 1) {
        return res.status(409).json({
          success: false,
          errorMsg: "이미 보상을 수령한 마일스톤입니다.",
        });
      }

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
  if (!isPlainRecord(req.body) || !isStudyType(req.body.type)) {
    return res.status(400).json({
      success: false,
      errorMsg: "올바르지 않은 학습 유형입니다.",
    });
  }
  const type = req.body.type;

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
  if (!isPlainRecord(req.body) || !isStudyType(req.body.type)) {
    return res.status(400).json({
      success: false,
      errorMsg: "올바르지 않은 학습 유형입니다.",
    });
  }
  const type = req.body.type;

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

    const selectedKeys = [...list]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);

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
  if (!isPlainRecord(req.body) || !isStudyType(req.body.type)) {
    return res.status(400).json({
      success: false,
      errorMsg: "올바르지 않은 학습 유형입니다.",
    });
  }
  const { type, item } = req.body;
  if (
    typeof item !== "string" ||
    (type === "kanji"
      ? !isKanjiCharacter(item)
      : !isSafeString(item, { maxLength: 100 }))
  ) {
    return res.status(400).json({
      success: false,
      errorMsg: "올바르지 않은 북마크 항목입니다.",
    });
  }
  const normalizedItem = item.trim();

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
    const list = Array.isArray(progress?.[field]) ? progress[field] : [];
    const isBookmarked = list.includes(normalizedItem);

    if (isBookmarked) {
      await db
        .collection("progress")
        .updateOne(
          { username: normalizedUsername },
          { $pull: { [field]: normalizedItem } as any },
          { upsert: true },
        );
    } else {
      if (list.length >= MAX_BOOKMARKS_PER_TYPE) {
        return res.status(409).json({
          success: false,
          errorMsg: `북마크는 유형별로 최대 ${MAX_BOOKMARKS_PER_TYPE}개까지 저장할 수 있습니다.`,
        });
      }

      const sourceCollection = type === "kanji" ? "kanjis" : "vocabs";
      const sourceField = type === "kanji" ? "kanji" : "word";
      const existingItem = await db.collection(sourceCollection).findOne(
        { [sourceField]: normalizedItem },
        { projection: { _id: 1 } },
      );
      if (!existingItem) {
        return res.status(400).json({
          success: false,
          errorMsg: "존재하지 않는 학습 항목은 북마크할 수 없습니다.",
        });
      }

      await db
        .collection("progress")
        .updateOne(
          { username: normalizedUsername },
          { $addToSet: { [field]: normalizedItem } as any },
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
