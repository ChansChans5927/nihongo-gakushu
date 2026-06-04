import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  CornerDownRight,
  ArrowRight
} from "lucide-react";
import { KanjiItem, RadicalPart } from "../types";
import { RadicalModal } from "./RadicalModal";

interface KanjiStudyProps {
  kanjiList: KanjiItem[];
  currentKanjiIndex: number;
  handlePrevStudy: () => void;
  handleNextStudy: () => void;
  speakJapanese: (text: string) => void;
  currentTheme?: string;
}

export function KanjiStudy({
  kanjiList,
  currentKanjiIndex,
  handlePrevStudy,
  handleNextStudy,
  speakJapanese,
  currentTheme = 'default'
}: KanjiStudyProps) {
  const [activeRadical, setActiveRadical] = useState<RadicalPart | null>(null);

  const isSamurai = currentTheme === 'samurai';
  const isYokai = currentTheme === 'yokai';

  const currentKanji = kanjiList[currentKanjiIndex];

  return (
    <motion.div
      key="studying-screen"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 w-full"
    >
      {/* Progress Tracker Slider Header */}
      <div className="space-y-2">
        <div className={`flex items-center justify-between text-xs font-semibold ${isSamurai ? "text-amber-900" : isYokai ? "text-[#38bdf8]/70" : "text-slate-500"}`}>
          <span className="flex items-center gap-1">
            <BookOpen className={`w-4 h-4 ${isSamurai ? "text-amber-800" : isYokai ? "text-[#0ea5e9]" : "text-amber-500"}`} />
            <span>한자 암기 진행률</span>
          </span>
          <span className="font-mono">
            {currentKanjiIndex + 1} / {kanjiList.length} 한자 ({Math.round(((currentKanjiIndex + 1) / kanjiList.length) * 100)}%)
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isSamurai ? "bg-amber-900/20" : isYokai ? "bg-[#0f172a]/80 shadow-[inset_0_0_5px_rgba(14,165,233,0.2)]" : "bg-slate-200"}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${isSamurai ? "bg-[#8b4513]" : isYokai ? "bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.8)]" : "bg-gradient-to-r from-amber-500 to-rose-500"}`}
            style={{ width: `${((currentKanjiIndex + 1) / kanjiList.length) * 100}%` }}
          />
        </div>
      </div>

      {/* TEXTBOOK CORE CARD: Realizing Book-Aesthetic Page */}
      <div className={isSamurai
        ? "bg-[#f4e8d1] border-y-[12px] border-y-[#3e2723] border-x-2 border-x-amber-900/30 rounded-md shadow-[inset_0_0_50px_rgba(139,69,19,0.15),0_10px_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col shrink-0 relative font-serif text-amber-950"
        : isYokai
        ? "yokai-theme-base rounded-xl overflow-hidden flex flex-col shrink-0 relative font-sans text-slate-200"
        : "bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col shrink-0 relative"
      }>
        {isSamurai && <div className="samurai-embers"></div>}
        {isYokai && <div className="yokai-embers"></div>}

        {/* Book style index header */}
        <div className={`px-5 py-3.5 flex items-center justify-between z-10 relative ${isSamurai ? "bg-[rgba(255,255,255,0.2)] border-b border-amber-900/20" : isYokai ? "bg-[#0f172a]/80 border-b border-[#38bdf8]/30 backdrop-blur-md" : "bg-slate-50 border-b border-slate-100"}`}>
          <span className={`font-mono text-xs font-bold ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]" : "text-slate-400"}`}>
            INDEX #{String(currentKanjiIndex + 1).padStart(4, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isSamurai ? "bg-[#3e2723] text-[#f4e8d1] border border-amber-900/50" : isYokai ? "bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
              GRADE: {currentKanji.grade}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isSamurai ? "bg-amber-900/20 text-amber-950" : isYokai ? "bg-[#030712] text-[#0ea5e9] border border-[#38bdf8]/50" : "bg-slate-100 text-slate-700"}`}>
              JLPT: {currentKanji.jlptLevel}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">

          {/* Outer grid matching photo content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">

            {/* Character Card Visual Panel (Left side in Book page) */}
            <div
              className={`md:col-span-4 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ${isSamurai ? "samurai-card-texture sword-glint" : isYokai ? "bg-[#0f172a]/50 border border-[#0ea5e9]/30 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)] backdrop-blur-sm z-10" : "bg-slate-50 border border-slate-100"}`}
            >
              <div className={`absolute top-2 left-2 text-[10px] font-mono font-bold ${isSamurai ? "text-amber-950/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-400"}`}>
                {currentKanji.strokeCount} 획
              </div>

              <div className="my-auto py-4">
                <div
                  key={`kanji-${currentKanji.kanji}`}
                  onClick={() => speakJapanese(currentKanji.kanji)}
                  className={`text-7xl sm:text-8xl font-serif font-semibold leading-none select-none select-all relative group cursor-pointer transition-colors ${isSamurai ? "text-amber-950 hover:text-red-800 ink-reveal" : isYokai ? "text-[#f8f9fa] hover:text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" : "text-slate-900 hover:text-amber-600"}`}
                  title="클릭하여 발음 듣기"
                >
                  {currentKanji.kanji}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentKanji.kanji);
                    }}
                    className={`absolute -top-2 -right-10 p-1.5 rounded-full shadow-sm transition-all opacity-100 cursor-pointer flex items-center justify-center ${isSamurai ? "bg-[#f4e8d1] border border-amber-900/30 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]" : isYokai ? "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white hover:shadow-[0_0_15px_rgba(14,165,233,0.6)]" : "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-amber-600"}`}
                    title="한자 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className={`mt-4 px-3 py-1 rounded-full text-base font-bold ${isSamurai ? "bg-[#3e2723] text-[#f4e8d1]" : isYokai ? "bg-[#030712] text-[#e2e8f0] border border-[#0ea5e9]/40 shadow-[0_0_10px_rgba(14,165,233,0.2)]" : "bg-slate-900 text-white"}`}>
                  {currentKanji.meaning}
                </div>
              </div>


            </div>

            {/* STORYBOARD & MEMORIZATION EXPLANATION PANEL */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-4">

              {/* Associative 스토리 보드 */}
              <div className={`rounded-2xl p-4 space-y-2 relative z-10 ${isSamurai ? "bg-amber-900/10 border border-amber-900/20" : isYokai ? "bg-[#0f172a]/60 border border-[#0ea5e9]/30" : "bg-amber-50/50 border border-amber-200/50"}`}>
                <div className={`absolute top-2.5 right-2 ${isSamurai ? "text-amber-700" : isYokai ? "text-[#38bdf8]" : "text-amber-400/80"}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold tracking-wider block ${isSamurai ? "text-amber-950" : isYokai ? "text-[#38bdf8]" : "text-amber-800"}`}>
                  💡 핵심 이미지 연상 암기 키워드
                </span>
                <p className={`text-sm sm:text-base font-medium leading-relaxed ${isSamurai ? "text-amber-950 font-serif" : isYokai ? "text-slate-200" : "text-slate-800"}`}>
                  {currentKanji.mnemonic}
                </p>
              </div>

              {/* Radicals Component Breakdown for absolute beginners */}
              {currentKanji.radicalsBreakdown && currentKanji.radicalsBreakdown.length > 0 && (
                <div className={`rounded-2xl p-4 space-y-3 z-10 relative ${isSamurai ? "bg-transparent border border-amber-900/20" : isYokai ? "bg-[#030712]/50 border border-[#0ea5e9]/20" : "bg-slate-50 border border-slate-200/80"}`}>
                  <span className={`text-[10px] font-bold tracking-wider block uppercase ${isSamurai ? "text-amber-900/80" : isYokai ? "text-[#38bdf8]/80" : "text-slate-500"}`}>
                    🧩 초보자를 위한 한자 파해 (부수 구성요소 클릭해서 쉽게 외우기)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {currentKanji.radicalsBreakdown.map((rad, radIdx) => {
                      const hasDetails = !!(rad.mnemonic || rad.onyomi || rad.hunyomi);
                      return (
                        <div
                          key={radIdx}
                          onClick={() => {
                            if (hasDetails) {
                              setActiveRadical(rad);
                            }
                          }}
                          className={`group rounded-xl p-3 transition-all flex items-center justify-between cursor-pointer ${isSamurai
                              ? "bg-[rgba(255,255,255,0.3)] border border-amber-900/20 hover:border-amber-900/40 hover:bg-[rgba(255,255,255,0.5)]"
                              : isYokai
                              ? "bg-[#0f172a]/80 border border-[#38bdf8]/20 hover:border-[#38bdf8]/50 hover:bg-[#0f172a] shadow-[inset_0_0_10px_rgba(14,165,233,0.05)]"
                              : "bg-white border border-slate-200/60 shadow-3xs hover:border-amber-300 hover:bg-amber-50/10 hover:shadow-2xs active:scale-[0.99]"
                            }`}
                          title={hasDetails ? "클릭하여 어원 파해 및 상세 연상 암기 비법 보기" : ""}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className={`text-lg font-serif font-black rounded-lg w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-all shrink-0 ${isSamurai
                                ? "text-red-800 bg-[#f4e8d1] border border-amber-900/30 group-hover:bg-[#f8f5ec]"
                                : isYokai
                                ? "text-[#38bdf8] bg-[#030712] border border-[#38bdf8]/40 group-hover:bg-[#0f172a]"
                                : "text-amber-600 bg-amber-50 border border-amber-100 group-hover:bg-amber-100/60"
                              }`}>
                              {rad.component}
                            </span>
                            <div className="flex flex-col truncate">
                              <span className={`text-xs font-bold font-sans ${isSamurai ? "text-amber-950" : isYokai ? "text-slate-200" : "text-slate-800"}`}>
                                {rad.meaning}
                              </span>
                              {rad.mnemonic && (
                                <p className={`text-[10px] font-sans truncate mt-0.5 ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-400"}`}>
                                  {rad.mnemonic}
                                </p>
                              )}
                            </div>
                          </div>

                          {hasDetails && (
                            <div className={`flex items-center gap-1 text-[9px] font-black rounded-full px-2 py-0.5 shrink-0 transition-colors ${isSamurai
                                ? "text-red-900 bg-amber-900/10 border border-amber-900/20"
                                : isYokai
                                ? "text-[#0ea5e9] bg-[#0f172a] border border-[#0ea5e9]/40 group-hover:bg-[#0ea5e9]/20"
                                : "text-amber-700 bg-amber-50/80 border border-amber-100 group-hover:bg-amber-100"
                              }`}>
                              <Sparkles className={`w-2.5 h-2.5 ${isSamurai ? "text-red-700" : isYokai ? "text-[#38bdf8]" : "text-amber-500"}`} />
                              <span>파해 보기</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reading Table structure inspired accurately from the book screenshot */}
              <div className={`border rounded-xl overflow-hidden text-xs z-10 relative ${isSamurai ? "border-amber-900/20" : isYokai ? "border-[#0ea5e9]/30" : "border-slate-200"}`}>
                {/* Table row Onyomi */}
                <div className={`grid grid-cols-12 border-b shrink-0 ${isSamurai ? "border-amber-900/20" : isYokai ? "border-[#0ea5e9]/30" : "border-slate-200"}`}>
                  <div className={`col-span-3 p-2.5 font-bold flex flex-col justify-center items-center text-center border-r gap-0.5 ${isSamurai ? "bg-[rgba(255,255,255,0.2)] text-amber-950 border-amber-900/20" : isYokai ? "bg-[#030712]/80 text-[#38bdf8] border-[#0ea5e9]/30" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>
                    <span>음독</span>
                    <span className={`text-[10px] font-mono ${isSamurai ? "text-amber-900/60" : isYokai ? "text-[#38bdf8]/60" : "text-slate-400"}`}>(音)</span>
                  </div>
                  <div className={`col-span-9 p-2.5 space-y-1 ${isSamurai ? "bg-transparent" : isYokai ? "bg-[#0f172a]/50" : "bg-white"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold font-mono ${isSamurai ? "text-amber-950" : isYokai ? "text-[#f8f9fa]" : "text-slate-900"}`}>{currentKanji.onyomi}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${isSamurai ? "bg-amber-900/10 text-amber-900" : isYokai ? "bg-[#0ea5e9]/20 text-[#38bdf8]" : "bg-amber-100 text-amber-900"
                        }`}>
                        {currentKanji.onyomiKorean}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(currentKanji.onyomi);
                        }}
                        className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ml-1 ${
                          isSamurai 
                            ? "bg-[#f4e8d1] border border-amber-900/30 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]" 
                            : isYokai
                            ? "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white"
                            : "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-emerald-600"
                        }`}
                        title="음독 발음 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table row Hunyomi */}
                <div className="grid grid-cols-12 shrink-0">
                  <div className={`col-span-3 p-2.5 font-bold flex flex-col justify-center items-center text-center border-r gap-0.5 ${isSamurai ? "bg-[rgba(255,255,255,0.2)] text-amber-950 border-amber-900/20" : isYokai ? "bg-[#030712]/80 text-[#38bdf8] border-[#0ea5e9]/30" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>
                    <span>훈독</span>
                    <span className={`text-[10px] font-mono ${isSamurai ? "text-amber-900/60" : isYokai ? "text-[#38bdf8]/60" : "text-slate-400"}`}>(訓)</span>
                  </div>
                  <div className={`col-span-9 p-2.5 space-y-1 ${isSamurai ? "bg-transparent" : isYokai ? "bg-[#0f172a]/50" : "bg-white"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold font-mono ${isSamurai ? "text-amber-950" : isYokai ? "text-[#f8f9fa]" : "text-slate-900"}`}>{currentKanji.hunyomi?.replace(/\./g, "")}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${isSamurai ? "bg-red-900/10 text-red-900" : isYokai ? "bg-rose-900/20 text-rose-400 border border-rose-900/50" : "bg-rose-100 text-rose-900"
                        }`}>
                        {currentKanji.hunyomiKorean}
                      </span>
                      {currentKanji.hunyomi && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(currentKanji.hunyomi!.replace(/\./g, ""));
                          }}
                          className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ml-1 ${
                            isSamurai 
                              ? "bg-[#f4e8d1] border border-amber-900/30 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]" 
                              : isYokai
                              ? "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white"
                              : "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-emerald-600"
                          }`}
                          title="훈독 발음 듣기"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* RELATED CONTEXT WORDS SECTION & PRACTICAL STUDY */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <CornerDownRight className="w-3.5 h-3.5 text-amber-500" />
              연관 핵심 어휘 확장하기
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentKanji.relatedWords.map((item, idx) => (
                <div
                  key={idx}
                  className={`border rounded-xl p-3 space-y-1 text-xs transition-colors relative group z-10 ${isSamurai
                      ? "bg-transparent hover:bg-[rgba(255,255,255,0.2)] border-amber-900/20 hover:border-amber-900/40"
                      : isYokai
                      ? "bg-[#030712]/50 hover:bg-[#0ea5e9]/10 border-[#0ea5e9]/20 hover:border-[#0ea5e9]/50"
                      : "bg-slate-50 hover:bg-amber-50/20 border-slate-100 hover:border-amber-100"
                    }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`font-bold text-sm tracking-wide font-mono select-all ${isSamurai ? "text-amber-950" : isYokai ? "text-[#f8f9fa]" : "text-slate-900"}`}>
                      {item.word}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakJapanese(item.word);
                      }}
                      className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ${
                        isSamurai 
                          ? "bg-[#f4e8d1] border border-amber-900/30 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]" 
                          : isYokai
                          ? "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white"
                          : "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-emerald-600"
                      }`}
                      title="발음 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-mono ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-400"}`}>
                    <span>{item.hiragana}</span>
                    <span> | </span>
                    <span className={isSamurai ? "text-amber-950" : isYokai ? "text-[#38bdf8]" : "text-slate-500"}>{item.pronunciation}</span>
                  </div>
                  <div className={`font-semibold font-sans border-t pt-1 mt-1 text-[11px] ${isSamurai ? "text-amber-900 border-amber-900/20" : isYokai ? "text-slate-300 border-[#0ea5e9]/30" : "text-slate-700 border-slate-200/40"
                    }`}>
                    뜻: {item.meaning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOWER EXAMPLE DIALOGUE ACCORDION BOX */}
          <div className={`rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden z-10 ${isSamurai ? "bg-[rgba(255,255,255,0.3)] border border-amber-900/20 text-amber-950" : isYokai ? "bg-[#030712]/80 border border-[#0ea5e9]/30 text-slate-200" : "bg-slate-900 text-slate-100"
            }`}>
            <div className={`absolute -bottom-4 -right-4 text-7xl font-sans font-bold select-none pointer-events-none ${isSamurai ? "text-amber-900/10" : isYokai ? "text-[#38bdf8]/5" : "text-slate-800 opacity-25"}`}>
              文
            </div>
            <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider gap-2 ${isSamurai ? "text-amber-900/80" : isYokai ? "text-[#38bdf8]" : "text-amber-400"}`}>
              <span>연상 학습 필수 예문 (例文)</span>
              <button
                onClick={() => speakJapanese(currentKanji.exampleSentence.japanese)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0 z-10 ${isSamurai ? "bg-amber-900/10 hover:bg-amber-900/20 text-amber-950" : isYokai ? "bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30" : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>예문 연속 읽기</span>
              </button>
            </div>

            <div className="space-y-1.5 z-10 relative">
              <p className={`text-base sm:text-lg font-bold tracking-wide select-all ${isSamurai ? "text-amber-950" : isYokai ? "text-[#f8f9fa] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]" : "text-white"}`}>
                {currentKanji.exampleSentence.japanese}
              </p>
              <p className={`text-xs font-mono ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-400"}`}>
                {currentKanji.exampleSentence.hiragana}
              </p>
              <p className={`text-xs font-sans font-medium ${isSamurai ? "text-red-800" : isYokai ? "text-[#0ea5e9]" : "text-amber-200"}`}>
                [{currentKanji.exampleSentence.pronunciation}]
              </p>
              <p className={`text-xs sm:text-sm border-t pt-1.5 mt-1.5 font-sans leading-relaxed ${isSamurai ? "text-amber-950 border-amber-900/20" : isYokai ? "text-[#e2e8f0] border-[#0ea5e9]/30" : "text-slate-300 border-white/10"
                }`}>
                {currentKanji.exampleSentence.meaning}
              </p>
            </div>
          </div>

        </div>

        {/* Footer and Navigation Action Controllers */}
        <div className={`px-5 py-4 flex items-center justify-between z-10 relative ${isSamurai ? "bg-transparent border-t border-amber-900/20" : isYokai ? "bg-transparent border-t border-[#0ea5e9]/30" : "bg-slate-50 border-t border-slate-100"
          }`}>
          <button
            onClick={handlePrevStudy}
            disabled={currentKanjiIndex === 0}
            className={`py-2.5 px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${isSamurai
                ? "bg-transparent hover:bg-amber-900/10 text-amber-950 border border-amber-900/30 rounded-none"
                : isYokai
                ? "bg-transparent hover:bg-[#0ea5e9]/20 text-[#e2e8f0] border border-[#0ea5e9]/40 rounded-lg"
                : "bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
              }`}
          >
            이전 한자
          </button>

          <div className={`text-xs font-mono hidden sm:block ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-500"}`}>
            {currentKanjiIndex + 1} / {kanjiList.length} 완독 진행
          </div>

          <button
            onClick={(e) => {
              if (isYokai) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('div');
                ripple.className = 'yokai-ripple';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
                ripple.style.transform = `translate(-50%, -50%) scale(0)`;
                
                e.currentTarget.appendChild(ripple);
                
                setTimeout(() => {
                  ripple.remove();
                }, 500);
              }
              handleNextStudy();
            }}
            className={`py-3 px-6 text-sm font-bold shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 overflow-hidden relative ${isSamurai
                ? "bg-[#3e2723] hover:bg-[#2d1b18] text-[#f4e8d1] rounded-none border border-amber-900/50"
                : isYokai
                ? "yokai-button-selected text-white rounded-lg border border-[#38bdf8] shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                : "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl"
              }`}
          >
            <span className="z-10 relative">이해했음 (다음)</span>
            <ArrowRight className="w-4 h-4 z-10 relative" />
          </button>
        </div>

      </div>

      {/* Radical Modal popup inside the studying screen */}
      <AnimatePresence>
        {activeRadical && (
          <RadicalModal
            activeRadical={activeRadical}
            onClose={() => setActiveRadical(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
