import { motion } from "motion/react";
import {
  BookOpen,
  Zap,
  ArrowRight,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface MainConfigProps {
  kanjiCount: number;
  setKanjiCount: (count: number) => void;
  difficulty: string;
  setDifficulty: (level: string) => void;
  jlptCount: number;
  setJlptCount: (count: number) => void;
  selectedJlptLevel: string;
  setSelectedJlptLevel: (level: string) => void;
  masteredKanji: string[];
  isLoading: boolean;
  isJlptLoading: boolean;
  errorMsg: string | null;
  startKanjiStudy: () => void;
  startJlptQuiz: () => void;
  handleResetMastery: () => void;
}

export function MainConfig({
  kanjiCount,
  setKanjiCount,
  difficulty,
  setDifficulty,
  jlptCount,
  setJlptCount,
  selectedJlptLevel,
  setSelectedJlptLevel,
  masteredKanji,
  isLoading,
  isJlptLoading,
  errorMsg,
  startKanjiStudy,
  startJlptQuiz,
  handleResetMastery
}: MainConfigProps) {
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
          연상 연합 암기 특허 기법 탑재
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight leading-tight">
          망각 없는 일본어 한자 & 단어 연상 암기
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto px-4">
          무작정 쓰면서 지치지 마세요. 우리 뇌에 가장 친숙한 한글 <span className="font-semibold text-amber-600 underline">연상 연합(Mnemonic Story)</span>과 JLPT 기출 풀이로 딱 한 번만 보고도 잊지 않게 뇌에 확실히 각인시킵니다.
        </p>
      </div>

      {/* Course Options Selection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Options Panel Card */}
        <div className="md:col-span-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            단어 외우기 학습 설정
          </h3>

          <div className="space-y-4">
            {/* Select box for quantity */}
            <div>
              <label htmlFor="kanji-count-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                공부할 한자 개수 선택
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setKanjiCount(num)}
                    className={`py-3 px-2 rounded-xl border text-sm font-semibold transition-all ${kanjiCount === num
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
              <label htmlFor="jlpt-level-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                한자 난이도 (JLPT 레벨)
              </label>
              <div className="grid grid-cols-6 gap-1.5">
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
                    onClick={() => setDifficulty(lvl.val)}
                    className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${difficulty === lvl.val
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                * N5는 기초적인 생활 한자이며, 단계가 올라갈수록 학업이나 업무용 고급 한자입니다.
              </p>
            </div>

            {/* Exclusions Inventory Display */}
            {masteredKanji.length > 0 && (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-xs gap-2">
                <span className="text-slate-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>외운 한자: <strong className="text-slate-900 font-bold">{masteredKanji.length}개</strong> (공부 시작 시 자동 제외)</span>
                </span>
                <button
                  onClick={handleResetMastery}
                  className="text-[10px] text-red-500 hover:text-red-600 font-bold underline bg-white px-2.5 py-1 border border-slate-200 rounded-md shadow-xs shrink-0 cursor-pointer"
                >
                  전체 초기화
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={startKanjiStudy}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-600 hover:to-orange-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>AI가 한자 및 단어 구성하는 중...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-400 fill-amber-300" />
                <span className="text-base font-bold">단어 공부 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* JLPT Real Past-Exam Questions Challenge Panel */}
        <div className="md:col-span-2 bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5 opacity-5">
            <Award className="w-40 h-40" />
          </div>
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              실전 기출 평가
            </span>
            <h4 className="text-xl font-bold leading-snug font-display tracking-tight text-white">
              JLPT 기출문제 풀기
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              실제 시험 기법에 맞추어진 단어 표기, 요미가나, 한자 문맥 빈칸 완성까지 엄선된 문제를 격파하여 실력을 검증해 보세요.
            </p>

            {/* JLPT level selectors */}
            <div className="space-y-2 pt-1">
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                목표 등급 레벨 선택
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedJlptLevel(lvl)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${selectedJlptLevel === lvl
                        ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow"
                        : "bg-slate-800 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-750"
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose quantity - 기출문제 풀 갯수 선택 */}
            <div className="space-y-2 pt-1 font-sans">
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                출제 문항 개수 선택
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setJlptCount(num)}
                    className={`py-1.5 px-0.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${jlptCount === num
                        ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow"
                        : "bg-slate-800 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-750"
                      }`}
                  >
                    {num}개
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-800 mt-5 space-y-3">
            <button
              onClick={startJlptQuiz}
              disabled={isJlptLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 hover:text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45"
            >
              {isJlptLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>기출 자료 받는 중...</span>
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
              * 출제 확률이 높은 테마별 한자 어휘 기출 단어
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
