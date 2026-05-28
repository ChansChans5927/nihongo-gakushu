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
  setIsReviewMode
}: MainConfigProps) {
  const isAnyLoading = isLoading || isJlptLoading;

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
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight leading-tight">
          한 번 보면 평생 기억하는 일본어 한자 연상 암기
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto px-4">
          <span className="block">무작정 쓰면서 외우지 마세요. 가장 친숙한 스토리텔링 연상법과</span>
          <span className="block">JLPT 기출 풀이로 일본어 실력을 확실하게 완성합니다.</span>
        </p>
      </div>

      {/* Course Options Selection Panel */}
      {/* Course Options Selection Panel */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Card 1: 새로운 학습 코스 (New Study) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 pb-3 justify-between items-center flex-wrap gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className={`w-5 h-5 ${studyMode === 'vocab' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span>{studyMode === 'vocab' ? '새로운 단어 학습' : '새로운 한자 학습'}</span>
                </h3>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setStudyMode('kanji');
                      setIsReviewMode(false);
                    }}
                    disabled={isAnyLoading}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                      studyMode === 'kanji' && !isReviewMode
                        ? "bg-white text-slate-950 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    한자 공부
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudyMode('vocab');
                      setIsReviewMode(false);
                    }}
                    disabled={isAnyLoading}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                      studyMode === 'vocab' && !isReviewMode
                        ? "bg-white text-slate-950 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    단어 공부
                  </button>
                </div>
              </div>

              {/* Select box for quantity */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  공부할 개수 선택
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((num) => {
                    const currentCount = studyMode === 'vocab' ? vocabCount : kanjiCount;
                    const handleSelectCount = studyMode === 'vocab' ? () => setVocabCount(num) : () => setKanjiCount(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={handleSelectCount}
                        disabled={isAnyLoading}
                        className={`py-2 px-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                          currentCount === num
                            ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {num}개
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* JLPT Levels Select Box */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  난이도 (JLPT 레벨)
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
                      className={`py-1.5 px-0.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                        difficulty === lvl.val
                          ? (studyMode === 'vocab' ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "bg-amber-600 border-amber-600 text-white shadow-sm")
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  * N5는 기초 생활 단어/한자이며, 단계가 올라갈수록 학업 및 업무용 고급 단어/한자입니다.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
              {errorMsg && !isReviewMode && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <button
                onClick={() => (studyMode === 'vocab' ? startVocabStudy(false) : startKanjiStudy(false))}
                disabled={isAnyLoading}
                className={`w-full py-3.5 px-5 bg-gradient-to-r text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 active:scale-[0.98] ${
                  studyMode === 'vocab'
                    ? "from-slate-900 to-slate-800 hover:from-emerald-600 hover:to-teal-500"
                    : "from-slate-900 to-slate-800 hover:from-amber-600 hover:to-orange-500"
                }`}
              >
                {isLoading && !isReviewMode ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>
                      {`AI가 ${studyMode === 'vocab' ? '단어' : '한자'} 구성하는 중...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className={`w-5 h-5 ${studyMode === 'vocab' ? 'text-emerald-400 fill-emerald-300' : 'text-amber-400 fill-amber-300'}`} />
                    <span className="text-sm font-bold">
                      {studyMode === 'vocab' ? '새로운 단어 공부 시작' : '새로운 한자 공부 시작'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: 학습 기록 복습 코스 (Review) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <History className="w-5 h-5 text-indigo-500" />
                <span>나의 복습 노트</span>
              </h3>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                이미 암기 완료한 한자와 단어 목록입니다. 복습 시 이전에 외웠던 목록이 자동으로 반영됩니다.
              </p>

              <div className="space-y-3 pt-1">
                {/* Kanji Mastery Section */}
                <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>외운 한자: <strong className="text-slate-900 font-bold">{masteredKanji.length}개</strong></span>
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
                  <button
                    onClick={() => startKanjiStudy(true)}
                    disabled={isAnyLoading || masteredKanji.length === 0}
                    className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed ${
                      isReviewMode && studyMode === 'kanji' && isLoading
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isReviewMode && studyMode === 'kanji' && isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>복습할 한자를 불러오는 중...</span>
                      </>
                    ) : (
                      <>
                        <span>한자 복습 시작하기</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </>
                    )}
                  </button>
                </div>

                {/* Vocab Mastery Section */}
                <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>외운 단어: <strong className="text-slate-900 font-bold">{masteredVocab.length}개</strong></span>
                    </span>
                    {masteredVocab.length > 0 && (
                      <button
                        type="button"
                        onClick={handleResetVocabMastery}
                        disabled={isAnyLoading}
                        className="text-[10px] text-red-500 hover:text-red-600 font-bold underline bg-white px-2 py-0.5 border border-slate-200 rounded-md shadow-xs shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => startVocabStudy(true)}
                    disabled={isAnyLoading || masteredVocab.length === 0}
                    className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed ${
                      isReviewMode && studyMode === 'vocab' && isLoading
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isReviewMode && studyMode === 'vocab' && isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>복습할 단어를 불러오는 중...</span>
                      </>
                    ) : (
                      <>
                        <span>단어 복습 시작하기</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
              {errorMsg && isReviewMode && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}
              <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                * 새로운 학습 시작 시 외운 목록은 자동 제외됩니다.
              </div>
            </div>
          </div>

        </div>

        {/* Card 3: JLPT Real Past-Exam Questions Challenge Panel */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5 opacity-5">
            <Award className="w-40 h-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Column: Title & Info */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                실전 기출 평가
              </span>
              <h4 className="text-base sm:text-lg font-bold leading-snug font-display tracking-tight text-white border-b border-slate-800 pb-3">
                JLPT 기출문제 풀기
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                단어 표기부터 요미가나 문맥 빈칸 완성까지 엄선된 JLPT 기출 문제로 진짜 실력을 검증하세요. 실제 출제 수준에 최적화된 모의 평가가 생성됩니다.
              </p>
            </div>

            {/* Right Column: Choices & CTA */}
            <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800/50">
              {/* JLPT level selectors */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  목표 등급 레벨 선택
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedJlptLevel(lvl)}
                      disabled={isAnyLoading}
                      className={`py-1.5 px-0.5 text-xs font-bold rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${selectedJlptLevel === lvl
                        ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow"
                        : "bg-slate-800 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-750"
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
                <div className="grid grid-cols-4 gap-1">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setJlptCount(num)}
                      disabled={isAnyLoading}
                      className={`py-1.5 px-0.5 rounded-lg border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${jlptCount === num
                        ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow"
                        : "bg-slate-800 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-750"
                        }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={startJlptQuiz}
                  disabled={isAnyLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 hover:text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45"
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

      </div>
    </motion.div>
  );
}
