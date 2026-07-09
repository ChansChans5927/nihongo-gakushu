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
  History
} from "lucide-react";
import { getTheme } from "../theme";
import { StudyGrass } from "./StudyGrass";

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
  points?: number;
  unlockedThemes?: string[];
  currentTheme?: string;
  currentUser?: any;
  onThemeUpdate?: () => void;
  onOpenShop: () => void;
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
  points = 0,
  unlockedThemes = ["default"],
  currentTheme = "default",
  currentUser,
  onThemeUpdate,
  onOpenShop
}: MainConfigProps) {
  const isAnyLoading = isLoading || isJlptLoading;
  const theme = getTheme(currentTheme);

  const [activeTab, setActiveTab] = useState<'kanji' | 'vocab' | 'jlpt'>(
    studyMode === 'vocab' ? 'vocab' : 'kanji'
  );

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
      <div className={`text-center pt-5 pb-6 sm:py-8 space-y-3 relative overflow-hidden rounded-3xl bg-radial from-amber-500/10 via-rose-500/5 to-transparent border transition-colors duration-300 ${theme.tableBorder}`}>
        <div className={`absolute top-4 left-4 text-6xl font-display font-extrabold select-none pointer-events-none opacity-10 hidden sm:block ${theme.wordSubText}`}>日</div>
        <div className={`absolute bottom-4 right-4 text-6xl font-display font-extrabold select-none pointer-events-none opacity-10 font-serif hidden sm:block ${theme.wordSubText}`}>見</div>

        <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm animate-pulse relative z-10">
          <Sparkles className="w-3.5 h-3.5" />
          지루한 암기 없는 스토리텔링 학습법
        </div>

        <h2 className={`text-2xl sm:text-4xl font-display font-extrabold tracking-tight leading-tight break-keep relative z-10 transition-colors duration-300 ${theme.breakdownKanjiMeaning}`}>
          한 번 보면 평생 기억하는<br className="block sm:hidden" /> 일본어 한자 연상 암기
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto px-4 relative z-10 transition-colors duration-300 ${theme.wordSubText}`}>
          <span className="block">무작정 쓰면서 외우지 마세요. <br className="block sm:hidden" />가장 친숙한 스토리텔링 연상법과</span>
          <span className="block">JLPT 기출 풀이로 <br className="block sm:hidden" />일본어 실력을 확실하게 완성합니다.</span>
        </p>
      </div>

      {/* Tab Selector Pills */}
      <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border max-w-lg mx-auto mb-6 transition-colors duration-300 ${theme.wordPanelBg} ${theme.tableBorder}`}>
        <button
          type="button"
          onClick={() => {
            setActiveTab('kanji');
            setStudyMode('kanji');
          }}
          disabled={isAnyLoading}
          className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none ${activeTab === 'kanji'
            ? theme.choiceBtnSelected
            : `${theme.choiceBtnBase} border-transparent bg-transparent`
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
            ? theme.choiceBtnSelected
            : `${theme.choiceBtnBase} border-transparent bg-transparent`
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
            ? theme.choiceBtnSelected
            : `${theme.choiceBtnBase} border-transparent bg-transparent`
            }`}
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">JLPT 평가</span>
          <span className="inline sm:hidden">JLPT</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'kanji' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: 새로운 한자 학습 */}
          <div className={`border rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between transition-colors duration-300 ${theme.cardContainer}`}>
            <div className="space-y-4 flex-1">
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 border-b pb-3 ${theme.breakdownKanjiMeaning} ${theme.tableBorder}`}>
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>새로운 한자 학습</span>
              </h3>

              {/* Select box for quantity */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${theme.wordSubText}`}>
                  공부할 한자 개수 선택
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setKanjiCount(num)}
                      disabled={isAnyLoading}
                      className={`py-2 px-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${kanjiCount === num
                        ? theme.choiceBtnSelected
                        : theme.choiceBtnBase
                        }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>

              {/* JLPT Levels Select Box */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${theme.wordSubText}`}>
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
                      className={`py-1.5 px-0.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${difficulty === lvl.val
                        ? theme.choiceBtnSelected
                        : theme.choiceBtnBase
                        }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <p className={`text-[10px] mt-2 leading-relaxed ${theme.wordSubText}`}>
                  * N5는 기초 생활 한자이며, 단계가 올라갈수록 학업 및 업무용 고급 한자입니다.
                </p>
              </div>
            </div>

            <div className={`pt-4 border-t mt-auto space-y-4 ${theme.tableBorder}`}>
              {errorMsg && !isReviewMode && studyMode === 'kanji' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startKanjiStudy(false)}
                disabled={isAnyLoading}
                className={`w-full py-3.5 px-5 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 active:scale-[0.98] shadow-md ${theme.btnPrimary}`}
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
          <div className={`border rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between transition-colors duration-300 ${theme.cardContainer}`}>
            <div className="space-y-4 flex-1">
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-1.5 border-b pb-3 ${theme.breakdownKanjiMeaning} ${theme.tableBorder}`}>
                <History className="w-5 h-5 text-indigo-500" />
                <span>한자 복습 노트</span>
              </h3>

              <div className={`flex items-center justify-between text-xs p-3 rounded-xl border ${theme.wordPanelBg} ${theme.tableBorder}`}>
                <span className={`font-semibold flex items-center gap-1.5 ${theme.wordSubText}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>외운 한자: <strong className={`font-bold text-sm ${theme.breakdownKanjiMeaning}`}>{masteredKanji.length}개</strong></span>
                </span>
                {masteredKanji.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetMastery}
                    disabled={isAnyLoading}
                    className={`text-[10px] font-bold underline px-2.5 py-1 rounded-md shadow-3xs shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${theme.btnSecondary}`}
                  >
                    초기화
                  </button>
                )}
              </div>

              {/* Scrollable list of mastered Kanjis */}
              <div className="space-y-2">
                <span className={`block text-[10px] font-semibold tracking-wider uppercase ${theme.wordSubText}`}>외운 한자 목록</span>
                {masteredKanji.length > 0 ? (
                  <div className={`flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl border transition-all ${theme.radicalsBoxBg} ${theme.tableBorder}`}>
                    {masteredKanji.map((char) => (
                      <span key={char} className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-bold shadow-3xs transition-transform hover:scale-105 active:scale-95 ${theme.breakdownKanjiBox}`}>
                        {char}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 text-xs rounded-xl border ${theme.radicalsBoxBg} ${theme.tableBorder} ${theme.wordSubText}`}>
                    아직 외운 한자가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className={`pt-4 border-t mt-auto space-y-4 ${theme.tableBorder}`}>
              {errorMsg && isReviewMode && studyMode === 'kanji' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startKanjiStudy(true)}
                disabled={isAnyLoading || masteredKanji.length === 0}
                className={`w-full py-3.5 px-5 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed ${isReviewMode && studyMode === 'kanji' && isLoading
                  ? theme.btnPrimary
                  : theme.btnSecondary
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
                    <ArrowRight className={`w-3.5 h-3.5 ${theme.wordSubText}`} />
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
          <div className={`border rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between transition-colors duration-300 ${theme.cardContainer}`}>
            <div className="space-y-4 flex-1">
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 border-b pb-3 ${theme.breakdownKanjiMeaning} ${theme.tableBorder}`}>
                <Zap className="w-5 h-5 text-emerald-500" />
                <span>새로운 단어 학습</span>
              </h3>

              {/* Select box for quantity */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${theme.wordSubText}`}>
                  공부할 단어 개수 선택
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setVocabCount(num)}
                      disabled={isAnyLoading}
                      className={`py-2 px-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${vocabCount === num
                        ? theme.choiceBtnSelected
                        : theme.choiceBtnBase
                        }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>

              {/* JLPT Levels Select Box */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${theme.wordSubText}`}>
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
                      className={`py-1.5 px-0.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${difficulty === lvl.val
                        ? theme.choiceBtnSelected
                        : theme.choiceBtnBase
                        }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <p className={`text-[10px] mt-2 leading-relaxed ${theme.wordSubText}`}>
                  * N5는 기초 생활 단어이며, 단계가 올라갈수록 학업 및 업무용 고급 어휘가 수록되어 있습니다.
                </p>
              </div>
            </div>

            <div className={`pt-4 border-t mt-auto space-y-4 ${theme.tableBorder}`}>
              {errorMsg && !isReviewMode && studyMode === 'vocab' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startVocabStudy(false)}
                disabled={isAnyLoading}
                className={`w-full py-3.5 px-5 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 active:scale-[0.98] shadow-md ${theme.btnPrimary}`}
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
          <div className={`border rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between transition-colors duration-300 ${theme.cardContainer}`}>
            <div className="space-y-4 flex-1">
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-1.5 border-b pb-3 ${theme.breakdownKanjiMeaning} ${theme.tableBorder}`}>
                <History className="w-5 h-5 text-indigo-500" />
                <span>단어 복습 노트</span>
              </h3>

              <div className={`flex items-center justify-between text-xs p-3 rounded-xl border ${theme.wordPanelBg} ${theme.tableBorder}`}>
                <span className={`font-semibold flex items-center gap-1.5 ${theme.wordSubText}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>외운 단어: <strong className={`font-bold text-sm ${theme.breakdownKanjiMeaning}`}>{masteredVocab.length}개</strong></span>
                </span>
                {masteredVocab.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetVocabMastery}
                    disabled={isAnyLoading}
                    className={`text-[10px] font-bold underline px-2.5 py-1 rounded-md shadow-3xs shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${theme.btnSecondary}`}
                  >
                    초기화
                  </button>
                )}
              </div>

              {/* Scrollable list of mastered Vocabs */}
              <div className="space-y-2">
                <span className={`block text-[10px] font-semibold tracking-wider uppercase ${theme.wordSubText}`}>외운 단어 목록</span>
                {masteredVocab.length > 0 ? (
                  <div className={`flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl border transition-all ${theme.radicalsBoxBg} ${theme.tableBorder}`}>
                    {masteredVocab.map((word) => (
                      <span key={word} className={`px-2 py-1 flex items-center justify-center rounded-xl text-xs font-bold shadow-3xs transition-transform hover:scale-105 active:scale-95 ${theme.breakdownKanjiBox}`}>
                        {word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 text-xs rounded-xl border ${theme.radicalsBoxBg} ${theme.tableBorder} ${theme.wordSubText}`}>
                    아직 외운 단어가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className={`pt-4 border-t mt-auto space-y-4 ${theme.tableBorder}`}>
              {errorMsg && isReviewMode && studyMode === 'vocab' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => startVocabStudy(true)}
                disabled={isAnyLoading || masteredVocab.length === 0}
                className={`w-full py-3.5 px-5 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed ${isReviewMode && studyMode === 'vocab' && isLoading
                  ? theme.btnPrimary
                  : theme.btnSecondary
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
        <div className={`max-w-2xl mx-auto border p-5 sm:p-6 shadow-xl relative overflow-hidden transition-colors duration-300 ${theme.cardContainer}`}>
          <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none select-none">
            <Award className={`w-40 h-40 ${theme.breakdownKanjiMeaning}`} />
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-3">
              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${theme.wordPanelBg} ${theme.tableBorder} ${theme.breakdownKanjiMeaning}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                실전 기출 평가
              </span>
              <h4 className={`text-lg sm:text-xl font-bold leading-snug font-display tracking-tight transition-colors duration-300 ${theme.breakdownKanjiMeaning}`}>
                JLPT 기출문제 풀기
              </h4>
              <p className={`text-xs max-w-md mx-auto leading-relaxed transition-colors duration-300 ${theme.wordSubText}`}>
                엄선된 JLPT 기출 문제로 진짜 실력을 검증하세요.
              </p>
            </div>

            <div className={`space-y-4 p-4 sm:p-5 rounded-2xl border transition-colors duration-300 ${theme.wordPanelBg} ${theme.tableBorder}`}>
              {/* JLPT level selectors */}
              <div className="space-y-2">
                <span className={`block text-[10px] font-semibold tracking-wider uppercase ${theme.wordSubText}`}>
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
                        ? theme.choiceBtnSelected
                        : theme.choiceBtnBase
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choose quantity */}
              <div className="space-y-2 font-sans">
                <span className={`block text-[10px] font-semibold tracking-wider uppercase ${theme.wordSubText}`}>
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
                        ? theme.choiceBtnSelected
                        : theme.choiceBtnBase
                        }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>

              <div className={`pt-4 border-t space-y-2 ${theme.tableBorder}`}>
                <button
                  type="button"
                  onClick={startJlptQuiz}
                  disabled={isAnyLoading}
                  className={`w-full py-3.5 px-4 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 ${theme.btnPrimary}`}
                >
                  {isJlptLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span>기출 자료 받는 중...</span>
                    </>
                  ) : isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span>학습 준비 대기 중...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>JLPT {selectedJlptLevel} 기출문제 시작</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <div className={`text-[10px] text-center ${theme.wordSubText}`}>
                  * 실제 시험 유형 완벽 반영
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📅 학습 잔디 성장판 및 보상 보드 */}
      <div className="mt-8">
        <StudyGrass />
      </div>

    </motion.div>
  );
}
