import express from "express";
import jwt from "jsonwebtoken";
import { getDB } from "../db.ts";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/authMiddleware.ts";
import { JWT_SECRET } from "../env.ts";
import {
  FixedWindowRateLimiter,
  hashPassword,
  verifyPassword,
} from "../services/authSecurity.ts";

const router = express.Router();

const loginCredentialLimiter = new FixedWindowRateLimiter(5, 15 * 60 * 1000);
const loginAccountLimiter = new FixedWindowRateLimiter(20, 15 * 60 * 1000);
const loginIpLimiter = new FixedWindowRateLimiter(50, 15 * 60 * 1000);
const registerIpLimiter = new FixedWindowRateLimiter(10, 60 * 60 * 1000);

function getRequestIp(req: express.Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function rejectRateLimited(res: express.Response, retryAfter: number) {
  res.setHeader("Retry-After", String(retryAfter));
  return res.status(429).json({
    success: false,
    errorMsg: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  });
}

function signToken(username: string, tokenVersion: number): string {
  return jwt.sign({ username, tokenVersion }, JWT_SECRET, { expiresIn: "7d" });
}

function isPasswordComplex(password: string): boolean {
  // Minimum 8 chars, at least one letter, one number, and one special char
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
}

// POST Endpoint for User Registration
router.post("/register", async (req, res) => {
  const ipKey = `register:${getRequestIp(req)}`;
  const retryAfter = registerIpLimiter.getRetryAfterSeconds(ipKey);
  if (retryAfter) return rejectRateLimited(res, retryAfter);
  registerIpLimiter.recordAttempt(ipKey);

  const { username, password } = req.body;
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim().length < 1 ||
    username.trim().length > 50 ||
    password.length > 128
  ) {
    return res.json({ success: false, errorMsg: "아이디와 비밀번호를 모두 입력해 주세요." });
  }

  if (!isPasswordComplex(password.trim())) {
    return res.json({ success: false, errorMsg: "비밀번호는 영문, 숫자, 특수문자를 혼합하여 8자 이상이어야 합니다." });
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

    const hashedPassword = await hashPassword(password.trim());
    await db.collection("users").insertOne({
      username: normalizedUsername,
      displayName: username.trim(),
      password: hashedPassword,
      createdAt: new Date(),
      tokenVersion: 0,
    });

    const token = signToken(normalizedUsername, 0);

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
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim().length < 1 ||
    username.trim().length > 50 ||
    password.length < 1 ||
    password.length > 128
  ) {
    return res.json({ success: false, errorMsg: "아이디와 비밀번호를 모두 입력해 주세요." });
  }

  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const ipKey = `login-ip:${getRequestIp(req)}`;
    const accountKey = `login-account:${normalizedUsername}`;
    const credentialKey = `login-credential:${getRequestIp(req)}:${normalizedUsername}`;
    const retryAfter = Math.max(
      loginIpLimiter.getRetryAfterSeconds(ipKey) || 0,
      loginAccountLimiter.getRetryAfterSeconds(accountKey) || 0,
      loginCredentialLimiter.getRetryAfterSeconds(credentialKey) || 0,
    );
    if (retryAfter) return rejectRateLimited(res, retryAfter);

    const user = await db.collection("users").findOne({ username: normalizedUsername });
    if (!user || !(await verifyPassword(password.trim(), user.password))) {
      loginIpLimiter.recordAttempt(ipKey);
      loginAccountLimiter.recordAttempt(accountKey);
      loginCredentialLimiter.recordAttempt(credentialKey);
      return res.json({ success: false, errorMsg: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }
    loginAccountLimiter.reset(accountKey);
    loginCredentialLimiter.reset(credentialKey);

    const tokenVersion = Number.isInteger(user.tokenVersion) ? user.tokenVersion : 0;
    const token = signToken(normalizedUsername, tokenVersion);

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

// POST Endpoint for Changing Password
router.post("/change-password", authMiddleware as any, async (req: AuthenticatedRequest, res) => {
  const username = req.user!.username;
  const { currentPassword, newPassword } = req.body;

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    currentPassword.length < 1 ||
    currentPassword.length > 128 ||
    newPassword.length < 1 ||
    newPassword.length > 128
  ) {
    return res.json({ success: false, errorMsg: "현재 비밀번호와 새 비밀번호를 모두 입력해 주세요." });
  }

  const db = getDB();
  if (!db) {
    return res.json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요." });
  }

  try {
    const normalizedUsername = username.trim().toLowerCase();
    const user = await db.collection("users").findOne({ username: normalizedUsername });
    
    if (!user || !(await verifyPassword(currentPassword.trim(), user.password))) {
      return res.json({ success: false, errorMsg: "현재 비밀번호가 일치하지 않습니다." });
    }

    if (!isPasswordComplex(newPassword.trim())) {
      return res.json({ success: false, errorMsg: "새 비밀번호는 영문, 숫자, 특수문자를 혼합하여 8자 이상이어야 합니다." });
    }

    const hashedPassword = await hashPassword(newPassword.trim());
    await db.collection("users").updateOne(
      { username: normalizedUsername },
      { $set: { password: hashedPassword }, $inc: { tokenVersion: 1 } }
    );

    res.json({ success: true });
  } catch (err: any) {
    console.error("Change password error:", err);
    res.json({ success: false, errorMsg: `비밀번호 변경 중 오류가 발생했습니다: ${err.message}` });
  }
});

router.post("/logout", authMiddleware as any, async (req: AuthenticatedRequest, res) => {
  const db = getDB();
  if (!db) {
    return res.status(503).json({
      success: false,
      errorMsg: "데이터베이스 연결에 실패했습니다.",
    });
  }

  const username = req.user!.username.trim().toLowerCase();
  try {
    await db.collection("users").updateOne(
      { username },
      { $inc: { tokenVersion: 1 } },
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      errorMsg: "로그아웃 처리 중 오류가 발생했습니다.",
    });
  }
});

export default router;
