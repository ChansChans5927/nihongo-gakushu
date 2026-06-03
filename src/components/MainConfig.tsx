import { useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Zap,
  ArrowRight,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  History,
  Tv
} from "lucide-react";

interface MainConfigProps {
  kanjiCount: number;
  setKanjiCount: (count: number) => void;
  vocabCount: number;
  setVocabCount: (count: number) => void;
  difficulty: string;
  setDifficulty: (level: string) => void;
  jlptCount: number;
  setJlptCount: (count: number) => void;
  selectedJlptLevel: string;
  setSelectedJlptLevel: (level: string) => void;
  masteredKanji: string[];
  masteredVocab: string[];
  isLoading: boolean;
  isJlptLoading: boolean;
  errorMsg: string | null;
  startKanjiStudy: (isReview?: boolean) => void;
  startVocabStudy: (isReview?: boolean) => void;
  startJlptQuiz: () => void;
  handleResetMastery: () => void;
  handleResetVocabMastery: () => void;
  studyMode: 'kanji' | 'vocab';
  setStudyMode: (mode: 'kanji' | 'vocab') => void;
  isReviewMode: boolean;
  setIsReviewMode: (mode: boolean) => void;
  startNewsStudy: () => void;
  isNewsLoading: boolean;
  newsErrorMsg: string | null;
  points?: number;
  unlockedThemes?: string[];
  currentTheme?: string;
  currentUser?: any;
  onThemeUpdate?: () => void;
}

export function MainConfig({
  kanjiCount,
  setKanjiCount,
  vocabCount,
  setVocabCount,
  difficulty,
  setDifficulty,
  jlptCount,
  setJlptCount,
  selectedJlptLevel,
  setSelectedJlptLevel,
  masteredKanji,
  masteredVocab,
  isLoading,
  isJlptLoading,
  errorMsg,
  startKanjiStudy,
  startVocabStudy,
  startJlptQuiz,
  handleResetMastery,
  handleResetVocabMastery,
  studyMode,
  setStudyMode,
  isReviewMode,
  setIsReviewMode,
  startNewsStudy,
  isNewsLoading,
  newsErrorMsg,
  points = 0,
  unlockedThemes = ["default"],
  currentTheme = "default",
  currentUser,
  onThemeUpdate
}: MainConfigProps) {
  const isAnyLoading = isLoading || isJlptLoading || isNewsLoading;

  const [activeTab, setActiveTab] = useState<'kanji' | 'vocab' | 'jlpt' | 'news' | 'shop'>(
    studyMode === 'vocab' ? 'vocab' : 'kanji'
  );

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
        if (onThemeUpdate) onThemeUpdate();
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
        if (onThemeUpdate) onThemeUpdate();
      } else {
        setShopMsg({ type: 'error', text: data.errorMsg || "장착에 실패했습니다." });
      }
    } catch (e) {
      setShopMsg({ type: 'error', text: "네트워크 오류가 발생했습니다." });
    }
  };

  return (
    <motion.div
      key="config-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 w-full"
    >
      {/* Eye-catching textbook banner header */}
      <div className="text-center py-6 sm:py-8 space-y-3 relative overflow-hidden rounded-3xl bg-radial from-amber-500/10 via-rose-500/5 to-transparent border border-slate-200/30">
        <div className="absolute top-4 left-4 text-slate-200 text-6xl font-display font-extrabold select-none pointer-events-none opacity-20">日</div>
        <div className="absolute bottom-4 right-4 text-slate-200 text-6xl font-display font-extrabold select-none pointer-events-none opacity-20 font-serif">見</div>
        <div className="inline-flex items-center gap-1 bg-amber-100/80 text-amber-800 border border-amber-200/60 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          지루한 암기 없는 스토리텔링 학습법
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight leading-tight break-keep">
          한 번 보면 평생 기억하는<br className="block sm:hidden" /> 일본어 한자 연상 암기
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto px-4">
          <span className="block">무작정 쓰면서 외우지 마세요. <br className="block sm:hidden" />가장 친숙한 스토리텔링 연상법과</span>
          <span className="block">JLPT 기출 풀이로 <br className="block sm:hidden" />일본어 실력을 확실하게 완성합니다.</span>
        </p>

        {currentUser && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-amber-200 shadow-sm px-3 py-1.5 rounded-2xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={() => setActiveTab('shop')}>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Points</span>
            <strong className="text-slate-800 font-mono font-black text-sm">{points.toLocaleString()} <span className="text-amber-500">P</span></strong>
          </div>
        )}
      </div>

      {/* Tab Selector Pills */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50 max-w-lg mx-auto mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('kanji');
            setStudyMode('kanji');
          }}
          disabled={isAnyLoading}
          className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none ${activeTab === 'kanji'
            ? "bg-white text-amber-600 shadow-sm border border-slate-200/20"
            : "text-slate-500 hover:text-slate-800"
            }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">한자 학습</span>
          <span className="inline sm:hidden">한자</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('vocab');
            setStudyMode('vocab');
          }}
          disabled={isAnyLoading}
          className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none ${activeTab === 'vocab'
            ? "bg-white text-emerald-600 shadow-sm border border-slate-200/20"
            : "text-slate-500 hover:text-slate-800"
            }`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">단어 학습</span>
          <span className="inline sm:hidden">단어</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('jlpt');
          }}
          disabled={isAnyLoading}
          className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none ${activeTab === 'jlpt'
            ? "bg-white text-rose-600 shadow-sm border border-slate-200/20"
            : "text-slate-500 hover:text-slate-800"
            }`}
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">JLPT 평가</span>
          <span className="inline sm:hidden">JLPT</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('news');
          }}
          disabled={isAnyLoading}
          className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none ${activeTab === 'news'
            ? "bg-white text-rose-600 shadow-sm border border-slate-200/20"
            : "text-slate-500 hover:text-slate-800"
            }`}
        >
          <Tv className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">뉴스 학습</span>
          <span className="inline sm:hidden">뉴스</span>
        </button>
        {currentUser && (
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            disabled={isAnyLoading}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none ${activeTab === 'shop'
              ? "bg-white text-purple-600 shadow-sm border border-slate-200/20"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">테마 상점</span>
            <span className="inline sm:hidden">상점</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'kanji' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: 새로운 한자 학습 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>새로운 한자 학습</span>
              </h3>

              {/* Select box for quantity */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  공부할 한자 개수 선택
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setKanjiCount(num)}
                      disabled={isAnyLoading}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${kanjiCount === num
                        ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>

              {/* JLPT Levels Select Box */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  한자 난이도 (JLPT 레벨)
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    { val: "all", label: "전체" },
                    { val: "N5", label: "N5" },
                    { val: "N4", label: "N4" },
                    { val: "N3", label: "N3" },
                    { val: "N2", label: "N2" },
                    { val: "N1", label: "N1" }
                  ].map((lvl) => (
                    <button
                      key={lvl.val}
                      type="button"
                      onClick={() => setDifficulty(lvl.val)}
                      disabled={isAnyLoading}
                      className={`py-1.5 px-0.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${difficulty === lvl.val
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  * N5는 기초 생활 한자이며, 단계가 올라갈수록 학업 및 업무용 고급 한자입니다.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
              {errorMsg && !isReviewMode && studyMode === 'kanji' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startKanjiStudy(false)}
                disabled={isAnyLoading}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-600 hover:to-orange-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 active:scale-[0.98]"
              >
                {isLoading && !isReviewMode ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>학습 데이터를 불러오는 중...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-300" />
                    <span className="text-sm font-bold">새로운 한자 공부 시작</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: 한자 복습 노트 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <History className="w-5 h-5 text-indigo-500" />
                <span>한자 복습 노트</span>
              </h3>

              <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>외운 한자: <strong className="text-slate-900 font-bold text-sm">{masteredKanji.length}개</strong></span>
                </span>
                {masteredKanji.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetMastery}
                    disabled={isAnyLoading}
                    className="text-[10px] text-red-500 hover:text-red-600 font-bold underline bg-white px-2 py-0.5 border border-slate-200 rounded-md shadow-xs shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    초기화
                  </button>
                )}
              </div>

              {/* Scrollable list of mastered Kanjis */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">외운 한자 목록</span>
                {masteredKanji.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {masteredKanji.map((char) => (
                      <span key={char} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-150 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                        {char}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 border border-slate-100 rounded-xl">
                    아직 외운 한자가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
              {errorMsg && isReviewMode && studyMode === 'kanji' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startKanjiStudy(true)}
                disabled={isAnyLoading || masteredKanji.length === 0}
                className={`w-full py-3.5 px-5 text-sm font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed ${isReviewMode && studyMode === 'kanji' && isLoading
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {isReviewMode && studyMode === 'kanji' && isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>복습할 한자를 불러오는 중...</span>
                  </>
                ) : (
                  <>
                    <span>외운 한자 복습하기</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: 새로운 단어 학습 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-5 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <span>새로운 단어 학습</span>
              </h3>

              {/* Select box for quantity */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  공부할 단어 개수 선택
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setVocabCount(num)}
                      disabled={isAnyLoading}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${vocabCount === num
                        ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>

              {/* JLPT Levels Select Box */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  단어 난이도 (JLPT 레벨)
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    { val: "all", label: "전체" },
                    { val: "N5", label: "N5" },
                    { val: "N4", label: "N4" },
                    { val: "N3", label: "N3" },
                    { val: "N2", label: "N2" },
                    { val: "N1", label: "N1" }
                  ].map((lvl) => (
                    <button
                      key={lvl.val}
                      type="button"
                      onClick={() => setDifficulty(lvl.val)}
                      disabled={isAnyLoading}
                      className={`py-1.5 px-0.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${difficulty === lvl.val
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  * N5는 기초 생활 단어이며, 단계가 올라갈수록 학업 및 업무용 고급 단어입니다.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
              {errorMsg && !isReviewMode && studyMode === 'vocab' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startVocabStudy(false)}
                disabled={isAnyLoading}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-emerald-600 hover:to-teal-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 active:scale-[0.98]"
              >
                {isLoading && !isReviewMode ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>학습 데이터를 불러오는 중...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-emerald-400 fill-emerald-300" />
                    <span className="text-sm font-bold">새로운 단어 공부 시작</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: 단어 복습 노트 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <History className="w-5 h-5 text-indigo-500" />
                <span>단어 복습 노트</span>
              </h3>

              <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>외운 단어: <strong className="text-slate-900 font-bold text-sm">{masteredVocab.length}개</strong></span>
                </span>
                {masteredVocab.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetVocabMastery}
                    disabled={isAnyLoading}
                    className="text-[10px] text-red-500 hover:text-red-600 font-bold underline bg-white px-2.5 py-1 border border-slate-200 rounded-md shadow-xs shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    초기화
                  </button>
                )}
              </div>

              {/* Scrollable list of mastered Vocabulary */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">외운 단어 목록</span>
                {masteredVocab.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {masteredVocab.map((word) => (
                      <span key={word} className="px-2.5 py-0.5 bg-white border border-slate-150 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                        {word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 border border-slate-100 rounded-xl">
                    아직 외운 단어가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
              {errorMsg && isReviewMode && studyMode === 'vocab' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startVocabStudy(true)}
                disabled={isAnyLoading || masteredVocab.length === 0}
                className={`w-full py-3.5 px-5 text-sm font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed ${isReviewMode && studyMode === 'vocab' && isLoading
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {isReviewMode && studyMode === 'vocab' && isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>복습할 단어를 불러오는 중...</span>
                  </>
                ) : (
                  <>
                    <span>외운 단어 복습하기</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jlpt' && (
        <div className="max-w-2xl mx-auto bg-slate-900 text-white rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none select-none">
            <Award className="w-40 h-40 text-white" />
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                실전 기출 평가
              </span>
              <h4 className="text-lg sm:text-xl font-bold leading-snug font-display tracking-tight text-white">
                JLPT 기출문제 풀기
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                단어 표기부터 요미가나 문맥 빈칸 완성까지 엄선된 JLPT 기출 문제로 진짜 실력을 검증하세요. 실제 시험 유형이 완벽하게 반영됩니다.
              </p>
            </div>

            <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
              {/* JLPT level selectors */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  목표 등급 레벨 선택
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedJlptLevel(lvl)}
                      disabled={isAnyLoading}
                      className={`py-1.5 px-0.5 text-xs font-bold rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${selectedJlptLevel === lvl
                        ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow"
                        : "bg-slate-800 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-700"
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choose quantity */}
              <div className="space-y-2 font-sans">
                <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  출제 문항 개수 선택
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setJlptCount(num)}
                      disabled={isAnyLoading}
                      className={`py-1.5 px-0.5 rounded-lg border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${jlptCount === num
                        ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow"
                        : "bg-slate-800 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-700"
                        }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={startJlptQuiz}
                  disabled={isAnyLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 hover:text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45"
                >
                  {isJlptLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>기출 자료 받는 중...</span>
                    </>
                  ) : isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>학습 준비 대기 중...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>JLPT {selectedJlptLevel} 기출문제 시작</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <div className="text-[10px] text-slate-400 text-center">
                  * 실제 시험 유형 완벽 반영
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-rose-900/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-rose-700/60 transition-all duration-500">
          <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none select-none">
            <Tv className="w-56 h-56 text-white transform rotate-12" />
          </div>

          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

          <div className="space-y-8 relative z-10">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30 backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                뉴스 연계 실전 시사 학습
              </span>
              <h4 className="text-xl sm:text-2xl font-black leading-snug font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-100 to-white drop-shadow-sm">
                유튜브 뉴스 자막과 어휘 퀴즈
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                일본 주요 뉴스 채널(TBS, ANN, FNN, 니혼TV, 요미우리TV)의 쇼츠 영상 중 <strong className="text-rose-300 font-bold">시청 가능한 뉴스가 무작위로</strong> 선정됩니다.
                실제 원어민 아나운서의 명확한 발음을 들으며 시사 어휘 연상 학습과 사지선다 객관식 퀴즈를 즐겨 보세요!
              </p>
            </div>

            <div className="pt-2 space-y-4">
              {newsErrorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 text-red-200 text-xs rounded-xl flex items-start gap-2 text-left backdrop-blur-sm shadow-md animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div>{newsErrorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={startNewsStudy}
                disabled={isAnyLoading || isNewsLoading}
                className="relative w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-orange-500 text-white font-black rounded-2xl text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed group/btn overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
                {isNewsLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>학습 데이터를 불러오는 중...</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-5 h-5 text-rose-100 shrink-0 group-hover/btn:scale-110 transition-transform" />
                    <span>랜덤 뉴스 학습 시작하기</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shop' && currentUser && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center space-y-2 mb-8">
            <h4 className="text-xl sm:text-2xl font-black font-display text-slate-900">
              테마 스킨 상점
            </h4>
            <p className="text-xs text-slate-500">
              퀴즈 정답(1문제 당 10P)을 통해 획득한 포인트로 특별한 퀴즈 스킨을 구매하세요!
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  정답을 맞힐 때마다 붓글씨 애니메이션과 함께 통쾌한 <strong>'서걱!'</strong> 효과음이 재생됩니다.
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
          </div>
        </div>
      )}
    </motion.div>
  );
}
