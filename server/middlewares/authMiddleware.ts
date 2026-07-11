import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env.ts";

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, errorMsg: "인증 토큰이 누락되었습니다." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, errorMsg: "올바르지 않은 토큰 형식입니다." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.user = { username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, errorMsg: "유효하지 않거나 만료된 토큰입니다." });
  }
}
