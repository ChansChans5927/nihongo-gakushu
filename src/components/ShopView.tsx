import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";

interface ShopViewProps {
  points: number;
  unlockedThemes: string[];
  currentTheme: string;
  onGoBack: () => void;
  onThemeUpdate: () => void;
}

export function ShopView({
  points,
  unlockedThemes,
  currentTheme,
  onGoBack,
  onThemeUpdate
}: ShopViewProps) {
  const [shopMsg, setShopMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const buyTheme = async (themeId: string, cost: number) => {
    setShopMsg(null);
    try {
      const res = await fetch("/api/progress/buyTheme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId, cost })
      });
      const data = await res.json();
      if (data.success) {
        setShopMsg({ type: 'success', text: "성공적으로 구매하여 장착했습니다!" });
        onThemeUpdate();
      } else {
        setShopMsg({ type: 'error', text: data.errorMsg || "구매에 실패했습니다." });
      }
    } catch (e) {
      setShopMsg({ type: 'error', text: "네트워크 오류가 발생했습니다." });
    }
  };

  const equipTheme = async (themeId: string) => {
    setShopMsg(null);
    try {
      const res = await fetch("/api/progress/equipTheme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId })
      });
      const data = await res.json();
      if (data.success) {
        setShopMsg({ type: 'success', text: "스킨을 변경했습니다." });
        onThemeUpdate();
      } else {
        setShopMsg({ type: 'error', text: data.errorMsg || "장착에 실패했습니다." });
      }
    } catch (e) {
      setShopMsg({ type: 'error', text: "네트워크 오류가 발생했습니다." });
    }
  };

  return (
    <motion.div
      key="shop-view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      <div className="p-6 sm:p-8">
        <div className="text-center space-y-2 mb-8">
          <h4 className="text-xl sm:text-2xl font-black font-display text-slate-900">
            테마 스킨 상점
          </h4>
          <p className="text-xs text-slate-500">
            학습과 퀴즈(문제당 10P)를 통해 모은 포인트로 특별한 퀴즈 테마 스킨을 획득해 보세요!
          </p>
          <div className="inline-block mt-4 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-inner">
            내 포인트: {points.toLocaleString()} P
          </div>
        </div>

        {shopMsg && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${shopMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${shopMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
            {shopMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Default Theme */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between ${currentTheme === 'default' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30' : 'border-slate-200'}`}>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-800 text-lg">기본 스킨</h5>
              <p className="text-xs text-slate-500">가장 깔끔하고 심플한 기본 퀴즈 UI입니다.</p>
            </div>
            <div className="mt-6">
              {currentTheme === 'default' ? (
                <div className="w-full text-center py-2 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm cursor-not-allowed">
                  현재 장착 중
                </div>
              ) : (
                <button
                  onClick={() => equipTheme('default')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
                >
                  장착하기
                </button>
              )}
            </div>
          </div>

          {/* Samurai Theme */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden ${currentTheme === 'samurai' ? 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/30' : 'border-slate-200'}`}>
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Sparkles className="w-16 h-16" />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                  사무라이 스킨 ⚔️
                </h5>
                {!unlockedThemes.includes('samurai') && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                    1,000 P
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                정답을 맞힐 때마다 화면을 가르는 날카로운 검격 애니메이션과 함께 통쾌한 <strong>'서걱!'</strong> 효과음이 재생됩니다.
              </p>
            </div>
            <div className="mt-6 relative z-10">
              {currentTheme === 'samurai' ? (
                <div className="w-full text-center py-2 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm cursor-not-allowed">
                  현재 장착 중
                </div>
              ) : unlockedThemes.includes('samurai') ? (
                <button
                  onClick={() => equipTheme('samurai')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
                >
                  장착하기
                </button>
              ) : (
                <button
                  onClick={() => buyTheme('samurai', 1000)}
                  disabled={points < 1000}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  1,000 P로 구매하기
                </button>
              )}
            </div>
          </div>

          {/* Yokai Theme */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden ${currentTheme === 'yokai' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Sparkles className={`w-16 h-16 ${currentTheme === 'yokai' ? 'text-sky-400' : 'text-slate-400'}`} />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className={`font-bold text-lg flex items-center gap-1.5 ${currentTheme === 'yokai' ? 'text-sky-100' : 'text-slate-900'}`}>
                  요괴 스킨 👻
                </h5>
                {!unlockedThemes.includes('yokai') && (
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-300">
                    1,500 P
                  </span>
                )}
              </div>
              <p className={`text-xs ${currentTheme === 'yokai' ? 'text-sky-200/70' : 'text-slate-500'}`}>
                기묘한 밤의 분위기를 자아내는 다크 테마입니다. 정답을 맞힐 때 도깨비불 애니메이션과 함께 서늘한 <strong>'차링~'</strong> 효과음이 울려 퍼집니다.
              </p>
            </div>
            <div className="mt-6 relative z-10">
              {currentTheme === 'yokai' ? (
                <div className="w-full text-center py-2 bg-slate-800 text-sky-400 font-bold rounded-xl text-sm cursor-not-allowed border border-sky-500/30">
                  현재 장착 중
                </div>
              ) : unlockedThemes.includes('yokai') ? (
                <button
                  onClick={() => equipTheme('yokai')}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
                >
                  장착하기
                </button>
              ) : (
                <button
                  onClick={() => buyTheme('yokai', 1500)}
                  disabled={points < 1500}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  1,500 P로 구매하기
                </button>
              )}
            </div>
          </div>

          {/* Zen Garden Theme */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
            currentTheme === 'zen'
              ? 'zen-theme-base border-emerald-600/40 ring-2 ring-emerald-600/20 shadow-md'
              : 'border-slate-200 bg-gradient-to-br from-white to-[#f0f5f2] hover:border-emerald-300 hover:shadow-sm'
          }`}>
            {currentTheme === 'zen' && (
              <div className="zen-leaves">
                <div className="leaf-1"></div>
                <div className="leaf-2"></div>
                <div className="leaf-3"></div>
                <div className="leaf-4"></div>
                <div className="leaf-5"></div>
              </div>
            )}
            <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none z-0">
              <Sparkles className={`w-16 h-16 ${currentTheme === 'zen' ? 'text-emerald-700' : 'text-slate-400'}`} />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className={`font-bold text-lg flex items-center gap-1.5 ${currentTheme === 'zen' ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                  젠 가든 스킨 🍵
                </h5>
                {!unlockedThemes.includes('zen') && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                    1,000 P
                  </span>
                )}
              </div>
              <p className={`text-xs ${currentTheme === 'zen' ? 'text-emerald-800/80' : 'text-slate-500'}`}>
                마음이 차분해지는 단아한 젠 가든 디자인입니다. 배경에 잎사귀들이 잔잔히 흩날리며, 보기를 클릭할 때마다 맑은 물방울 파동이 일어납니다.
              </p>
            </div>
            <div className="mt-6 relative z-10">
              {currentTheme === 'zen' ? (
                <div className="w-full text-center py-2 bg-emerald-800/10 text-emerald-800 border border-emerald-800/20 font-bold rounded-xl text-sm cursor-not-allowed">
                  현재 장착 중
                </div>
              ) : unlockedThemes.includes('zen') ? (
                <button
                  onClick={() => equipTheme('zen')}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
                >
                  장착하기
                </button>
              ) : (
                <button
                  onClick={() => buyTheme('zen', 1000)}
                  disabled={points < 1000}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  1,000 P로 구매하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
