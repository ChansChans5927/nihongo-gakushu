import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getDB } from "../db.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nihongo_gakushu_secret_key";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 600000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    const checkHash = crypto.pbkdf2Sync(password, salt, 600000, 64, "sha512").toString("hex");
    return hash === checkHash;
  } catch (err) {
    return false;
  }
}

// POST Endpoint for User Registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.json({ success: false, errorMsg: "아이디와 비밀번호를 모두 입력해 주세요." });
  }

  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const existingUser = await db.collection("users").findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.json({ success: false, errorMsg: "이미 존재하는 아이디입니다." });
    }

    const hashedPassword = hashPassword(password.trim());
    await db.collection("users").insertOne({
      username: normalizedUsername,
      displayName: username.trim(),
      password: hashedPassword,
      createdAt: new Date()
    });

    // Sign JWT token
    const token = jwt.sign(
      { username: normalizedUsername },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: { username: username.trim() }
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.json({ success: false, errorMsg: `회원가입 중 오류가 발생했습니다: ${err.message}` });
  }
});

// POST Endpoint for User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username.trim() === "" || password.trim() === "") {
    return res.json({ success: false, errorMsg: "아이디와 비밀번호를 모두 입력해 주세요." });
  }

  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await db.collection("users").findOne({ username: normalizedUsername });
    if (!user || !verifyPassword(password.trim(), user.password)) {
      return res.json({ success: false, errorMsg: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    // Sign JWT token
    const token = jwt.sign(
      { username: normalizedUsername },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: { username: user.displayName }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.json({ success: false, errorMsg: `로그인 중 오류가 발생했습니다: ${err.message}` });
  }
});

export default router;
