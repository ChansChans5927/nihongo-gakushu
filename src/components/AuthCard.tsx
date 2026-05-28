import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Lock, LogIn, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { UserSession } from "../types";

interface AuthCardProps {
  onAuthSuccess: (user: UserSession) => void;
}

export function AuthCard({ onAuthSuccess }: AuthCardProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isLogin && trimmedPass !== confirmPassword.trim()) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });

      const resData = await response.json();

      if (resData.success && resData.user) {
        onAuthSuccess(resData.user);
      } else {
        setErrorMsg(resData.errorMsg || "인증 처리 중 오류가 발생했습니다.");
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setErrorMsg("서버와의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTab = (loginTab: boolean) => {
    setIsLogin(loginTab);
    setErrorMsg(null);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl text-white shadow-md mx-auto">
            {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-display font-extrabold text-slate-950 tracking-tight">
            {isLogin ? "로그인" : "새로운 회원가입"}
          </h2>
          <p className="text-xs text-slate-500">
            {isLogin
              ? "학습 기록을 DB에 저장하여 언제든 이어 공부할 수 있습니다."
              : "비밀번호는 암호화(Salting+Hashing)되어 안전하게 보관됩니다."}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button
            type="button"
            onClick={() => toggleTab(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isLogin ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => toggleTab(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isLogin ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMsg}</div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              아이디
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용자 아이디 입력"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              비밀번호
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900"
                required
              />
            </div>
          </div>

          {/* Confirm Password (only for Registration) */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 overflow-hidden"
            >
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                비밀번호 확인
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 확인 입력"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900"
                  required
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 bg-gradient-to-r ${
              isLogin ? "from-slate-900 to-slate-800" : "from-amber-500 to-rose-500"
            } text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98] mt-2`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "로그인하기" : "가입 및 로그인"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
