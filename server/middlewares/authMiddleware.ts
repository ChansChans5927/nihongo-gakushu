import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env.ts";
import { getDB } from "../db.ts";

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, errorMsg: "인증 토큰이 누락되었습니다." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, errorMsg: "올바르지 않은 토큰 형식입니다." });
  }

  let decoded: { username?: unknown; tokenVersion?: unknown };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as typeof decoded;
  } catch {
    return res.status(401).json({ success: false, errorMsg: "유효하지 않거나 만료된 토큰입니다." });
  }

  if (
    typeof decoded.username !== "string" ||
    !Number.isInteger(decoded.tokenVersion)
  ) {
    return res.status(401).json({ success: false, errorMsg: "유효하지 않은 인증 토큰입니다." });
  }

  const db = getDB();
  if (!db) {
    return res.status(503).json({ success: false, errorMsg: "데이터베이스 연결에 실패했습니다." });
  }

  try {
    const user = await db.collection("users").findOne(
      { username: decoded.username },
      { projection: { tokenVersion: 1 } },
    );
    const currentTokenVersion = Number.isInteger(user?.tokenVersion)
      ? user.tokenVersion
      : 0;
    if (!user || decoded.tokenVersion !== currentTokenVersion) {
      return res.status(401).json({ success: false, errorMsg: "폐기되었거나 만료된 인증 토큰입니다." });
    }

    req.user = { username: decoded.username };
    next();
  } catch (error) {
    console.error("Authentication database lookup error:", error);
    return res.status(503).json({
      success: false,
      errorMsg: "인증 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
}
