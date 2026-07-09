import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Sparkles, ArrowLeft, Lock } from "lucide-react";
import { getTheme } from "../theme";

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
  const theme = getTheme(currentTheme);

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
      className={`max-w-3xl mx-auto w-full ${theme.cardContainer} overflow-hidden`}
    >
      <div className={`flex items-center justify-between px-6 py-4 border-b transition-colors duration-300 ${theme.cardHeaderBg} ${theme.tableBorder}`}>
        <button
          onClick={onGoBack}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${theme.wordSubText}`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className={`text-sm font-bold ${theme.breakdownKanjiMeaning}`}>테마 상점</span>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      <div className="p-6 sm:p-8">
        <div className="text-center space-y-2 mb-8">
          <h4 className={`text-xl sm:text-2xl font-black font-display ${theme.breakdownKanjiMeaning}`}>
            테마 스킨 상점
          </h4>
          <p className={`text-xs ${theme.wordSubText}`}>
            학습과 퀴즈(문제당 10P)를 통해 모은 포인트로 특별한 퀴즈 테마 스킨을 획득해 보세요!
          </p>
          <div className={`inline-block mt-4 px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-inner ${theme.badgeGradeBg}`}>
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
          {/* 1. Default Theme */}
          <div className={`flex flex-col justify-between border rounded-2xl p-5 transition-all duration-300 ${currentTheme === 'default' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30' : `${theme.wordPanelBg} ${theme.tableBorder} opacity-75`}`}>
            <div>
              <div className="flex items-center justify-between">
                <h5 className={`font-bold ${currentTheme === 'default' ? 'text-indigo-950' : theme.breakdownKanjiMeaning}`}>기본 스킨</h5>
                <span className="text-[10px] bg-slate-500/10 text-slate-500 font-semibold px-2 py-0.5 rounded">보유함</span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${currentTheme === 'default' ? 'text-indigo-900/80' : theme.wordSubText}`}>
                기본 스타일의 깔끔하고 심플한 테마입니다.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100/10">
              {currentTheme === 'default' ? (
                <div className="w-full text-center py-2 bg-indigo-600/10 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>장착 완료</span>
                </div>
              ) : (
                <button
                  onClick={() => equipTheme('default')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer hover:shadow"
                >
                  장착하기
                </button>
              )}
            </div>
          </div>

          {/* 2. Samurai Theme */}
          <div className={`flex flex-col justify-between border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${currentTheme === 'samurai' ? 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/30' : `${theme.wordPanelBg} ${theme.tableBorder} opacity-75`}`}>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-5 rotate-45 border-r border-t border-slate-900 pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between">
                <h5 className={`font-bold ${currentTheme === 'samurai' ? 'text-amber-950 font-serif' : theme.breakdownKanjiMeaning}`}>사무라이 스킨</h5>
                {unlockedThemes.includes('samurai') ? (
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 font-semibold px-2 py-0.5 rounded">보유함</span>
                ) : (
                  <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> 800P
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${currentTheme === 'samurai' ? 'text-amber-900/80 font-serif' : theme.wordSubText}`}>
                보기를 선택할 때 검격 효과음과 슬래시 애니메이션이 나타납니다.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100/10">
              {currentTheme === 'samurai' ? (
                <div className="w-full text-center py-2 bg-amber-600/10 text-amber-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>장착 완료</span>
                </div>
              ) : unlockedThemes.includes('samurai') ? (
                <button
                  onClick={() => equipTheme('samurai')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer hover:shadow"
                >
                  장착하기
                </button>
              ) : (
                <button
                  onClick={() => buyTheme('samurai', 800)}
                  disabled={points < 800}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {points >= 800 ? '구매하기 (800P)' : '포인트 부족'}
                </button>
              )}
            </div>
          </div>

          {/* Yokai Theme */}
          <div className={`flex flex-col justify-between border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${currentTheme === 'yokai' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-slate-900' : `${theme.wordPanelBg} ${theme.tableBorder} opacity-75`}`}>
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Sparkles className={`w-16 h-16 ${currentTheme === 'yokai' ? 'text-sky-400' : 'text-slate-400'}`} />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className={`font-bold text-lg flex items-center gap-1.5 ${currentTheme === 'yokai' ? 'text-sky-100' : theme.breakdownKanjiMeaning}`}>
                  요괴 스킨
                </h5>
                {!unlockedThemes.includes('yokai') && (
                  <span className="bg-sky-500/10 text-sky-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20">
                    1,500 P
                  </span>
                )}
              </div>
              <p className={`text-xs ${currentTheme === 'yokai' ? 'text-sky-200/70' : theme.wordSubText}`}>
                어두운 배경 톤에 도깨비불 연출과 종소리 효과음이 적용됩니다.
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
          <div className={`flex flex-col justify-between border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
            currentTheme === 'zen'
              ? 'zen-theme-base border-emerald-600/40 ring-2 ring-emerald-600/20 shadow-md'
              : `${theme.wordPanelBg} ${theme.tableBorder} opacity-75 hover:border-emerald-300 hover:shadow-2xs`
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
                <h5 className={`font-bold text-lg flex items-center gap-1.5 ${currentTheme === 'zen' ? 'text-emerald-950 font-black' : theme.breakdownKanjiMeaning}`}>
                  젠 가든 스킨
                </h5>
                {!unlockedThemes.includes('zen') && (
                  <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    1,000 P
                  </span>
                )}
              </div>
              <p className={`text-xs ${currentTheme === 'zen' ? 'text-emerald-800/80' : theme.wordSubText}`}>
                잔잔하게 흩날리는 잎사귀 효과와 물방울 소리가 특징입니다.
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

          {/* Chalkboard Theme */}
          <div className={`flex flex-col justify-between border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
            currentTheme === 'chalkboard'
              ? 'chalkboard-theme-base border-emerald-600/40 ring-2 ring-emerald-600/20 shadow-md'
              : `${theme.wordPanelBg} ${theme.tableBorder} opacity-75 hover:border-emerald-300 hover:shadow-2xs`
          }`}>
            {currentTheme === 'chalkboard' && (
              <div className="chalkboard-dust-particles">
                <div className="chalk-dust" style={{ left: '10%', animationDelay: '0s' }}></div>
                <div className="chalk-dust" style={{ left: '30%', animationDelay: '-3s' }}></div>
                <div className="chalk-dust" style={{ left: '50%', animationDelay: '-6s' }}></div>
                <div className="chalk-dust" style={{ left: '70%', animationDelay: '-9s' }}></div>
                <div className="chalk-dust" style={{ left: '90%', animationDelay: '-12s' }}></div>
              </div>
            )}
            <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none z-0">
              <Sparkles className={`w-16 h-16 ${currentTheme === 'chalkboard' ? 'text-yellow-300' : 'text-slate-400'}`} />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className={`font-bold text-lg flex items-center gap-1.5 ${currentTheme === 'chalkboard' ? 'text-yellow-300 font-black' : theme.breakdownKanjiMeaning}`}>
                  분필 칠판 스킨
                </h5>
                {!unlockedThemes.includes('chalkboard') && (
                  <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    1,200 P
                  </span>
                )}
              </div>
              <p className={`text-xs ${currentTheme === 'chalkboard' ? 'text-emerald-100/80' : theme.wordSubText}`}>
                초록 칠판 배경에 분필 가루 입자 효과와 사각거리는 효과음이 적용됩니다.
              </p>
            </div>
            <div className="mt-6 relative z-10">
              {currentTheme === 'chalkboard' ? (
                <div className="w-full text-center py-2 bg-emerald-800/10 text-yellow-300 border border-emerald-800/20 font-bold rounded-xl text-sm cursor-not-allowed">
                  현재 장착 중
                </div>
              ) : unlockedThemes.includes('chalkboard') ? (
                <button
                  onClick={() => equipTheme('chalkboard')}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer"
                >
                  장착하기
                </button>
              ) : (
                <button
                  onClick={() => buyTheme('chalkboard', 1200)}
                  disabled={points < 1200}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  1,200 P로 구매하기
                </button>
              )}
            </div>
          </div>

          {/* Golden Sakura Theme */}
          <div className={`flex flex-col justify-between border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
            currentTheme === 'golden_sakura'
              ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20'
              : `${theme.wordPanelBg} ${theme.tableBorder} opacity-75 hover:border-rose-350 hover:shadow-2xs`
          }`}>
            <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none z-0">
              <Sparkles className={`w-16 h-16 ${currentTheme === 'golden_sakura' ? 'text-rose-500' : 'text-slate-400'}`} />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className={`font-bold text-lg flex items-center gap-1.5 ${currentTheme === 'golden_sakura' ? 'text-rose-900 font-black' : theme.breakdownKanjiMeaning}`}>
                  골든 사쿠라 테마
                </h5>
                {unlockedThemes.includes('golden_sakura') ? (
                  <span className="text-[10px] bg-rose-500/10 text-rose-600 font-bold px-2 py-0.5 rounded">보유함</span>
                ) : (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-300">잔디 30일 보상</span>
                )}
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${currentTheme === 'golden_sakura' ? 'text-rose-900/80' : theme.wordSubText}`}>
                화사한 벚꽃 핑크 톤에 흩날리는 벚꽃잎 애니메이션 효과가 적용됩니다.
              </p>
            </div>
            <div className="mt-6 relative z-10 pt-3 border-t border-slate-100/10">
              {currentTheme === 'golden_sakura' ? (
                <div className="w-full text-center py-2 bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-not-allowed">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>장착 완료</span>
                </div>
              ) : unlockedThemes.includes('golden_sakura') ? (
                <button
                  onClick={() => equipTheme('golden_sakura')}
                  className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer hover:shadow"
                >
                  장착하기
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 bg-slate-200 text-slate-400 font-bold rounded-xl text-xs border border-slate-300 cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>잔디 30일 완료 시 해금</span>
                </button>
              )}
            </div>
          </div>

          {/* Golden Aura Theme */}
          <div className={`flex flex-col justify-between border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
            currentTheme === 'golden_aura'
              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-stone-900/40 shadow-md shadow-amber-500/10'
              : `${theme.wordPanelBg} ${theme.tableBorder} opacity-75 hover:border-amber-300 hover:shadow-2xs`
          }`}>
            <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none z-0">
              <Sparkles className={`w-16 h-16 ${currentTheme === 'golden_aura' ? 'text-amber-500' : 'text-slate-400'}`} />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className={`font-bold text-lg flex items-center gap-1.5 ${currentTheme === 'golden_aura' ? 'text-amber-400 font-black' : theme.breakdownKanjiMeaning}`}>
                  황금빛 오라 테마
                </h5>
                {unlockedThemes.includes('golden_aura') ? (
                  <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 rounded border border-amber-500/20">보유함</span>
                ) : (
                  <span className="text-[10px] bg-amber-950 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">잔디 100일 보상</span>
                )}
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${currentTheme === 'golden_aura' ? 'text-amber-100/70' : theme.wordSubText}`}>
                다크 차콜 테마에 영롱하게 일렁이는 황금빛 아우라 파티클 효과가 적용됩니다.
              </p>
            </div>
            <div className="mt-6 relative z-10 pt-3 border-t border-slate-100/10">
              {currentTheme === 'golden_aura' ? (
                <div className="w-full text-center py-2 bg-stone-850 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-not-allowed">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>장착 완료</span>
                </div>
              ) : unlockedThemes.includes('golden_aura') ? (
                <button
                  onClick={() => equipTheme('golden_aura')}
                  className="w-full py-2 bg-amber-500 hover:bg-[#d97706] text-[#1c1917] font-bold rounded-xl text-xs transition-all cursor-pointer hover:shadow"
                >
                  장착하기
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 bg-slate-200 text-slate-400 font-bold rounded-xl text-xs border border-slate-300 cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>잔디 100일 완료 시 해금</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
