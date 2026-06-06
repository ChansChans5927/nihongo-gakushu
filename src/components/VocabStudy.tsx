import { useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  CornerDownRight,
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { VocabItem } from "../types";

interface VocabStudyProps {
  vocabList: VocabItem[];
  currentVocabIndex: number;
  handlePrevStudy: () => void;
  handleNextStudy: () => void;
  speakJapanese: (text: string) => void;
  currentTheme?: string;
}

export function VocabStudy({
  vocabList,
  currentVocabIndex,
  handlePrevStudy,
  handleNextStudy,
  speakJapanese,
  currentTheme = 'default'
}: VocabStudyProps) {
  const currentVocab = vocabList[currentVocabIndex];

  const isSamurai = currentTheme === 'samurai';
  const isYokai = currentTheme === 'yokai';

  return (
    <motion.div
      key="vocab-studying-screen"
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
            <BookOpen className={`w-4 h-4 ${isSamurai ? "text-amber-800" : isYokai ? "text-[#0ea5e9]" : "text-emerald-500"}`} />
            <span>단어 암기 진행률</span>
          </span>
          <span className="font-mono">
            {currentVocabIndex + 1} / {vocabList.length} 단어 ({Math.round(((currentVocabIndex + 1) / vocabList.length) * 100)}%)
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isSamurai ? "bg-amber-900/20" : isYokai ? "bg-[#0f172a]/80 shadow-[inset_0_0_5px_rgba(14,165,233,0.2)]" : "bg-slate-200"}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${isSamurai ? "bg-[#8b4513]" : isYokai ? "bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.8)]" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
            style={{ width: `${((currentVocabIndex + 1) / vocabList.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={isSamurai
        ? "bg-[#f4e8d1] border-y-[12px] border-y-[#3e2723] border-x-2 border-x-amber-900/30 rounded-md shadow-[inset_0_0_50px_rgba(139,69,19,0.15),0_10px_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col shrink-0 relative font-serif text-amber-950"
        : isYokai
          ? "bg-[#030712] border border-[#0ea5e9]/30 rounded-3xl shadow-[0_0_30px_rgba(14,165,233,0.15)] overflow-hidden flex flex-col shrink-0 relative text-slate-200"
          : "bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col shrink-0 relative"
      }>
        {isSamurai && <div className="samurai-embers"></div>}
        {isYokai && <div className="yokai-embers"></div>}

        {/* Book style index header */}
        <div className={`px-5 py-3.5 flex items-center justify-between z-10 relative ${isSamurai ? "bg-[rgba(255,255,255,0.2)] border-b border-amber-900/20" : isYokai ? "bg-[#0f172a]/80 border-b border-[#38bdf8]/30 backdrop-blur-md" : "bg-slate-50 border-b border-slate-100"}`}>
          <span className={`font-mono text-xs font-bold ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]" : "text-slate-400"}`}>
            VOCAB INDEX #{String(currentVocabIndex + 1).padStart(4, '0')}
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isSamurai ? "bg-amber-900/20 text-amber-950" : isYokai ? "bg-[#030712] text-[#0ea5e9] border border-[#38bdf8]/50" : "bg-slate-100 text-slate-700"}`}>
              {currentVocab.pos}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Vocab Character Visual Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            <div
              className={`md:col-span-4 rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ${isSamurai ? "samurai-card-texture sword-glint" : isYokai ? "bg-[#0f172a]/50 border border-[#0ea5e9]/30 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)] backdrop-blur-sm z-10" : "bg-slate-50 border border-slate-100"}`}
            >
              <div className="my-auto py-5 flex flex-col items-center justify-center gap-2">
                <div
                  className="relative group cursor-pointer inline-block"
                  onClick={() => speakJapanese(currentVocab.word)}
                >
                  <h1
                    lang="ja"
                    className={`${currentVocab.word.length >= 8 ? "text-xl sm:text-3xl" : currentVocab.word.length >= 6 ? "text-2xl sm:text-4xl" : currentVocab.word.length >= 4 ? "text-3xl sm:text-5xl" : "text-4xl sm:text-6xl"} font-serif font-semibold leading-none select-none select-all relative group cursor-pointer transition-colors ${isSamurai ? "text-amber-950 hover:text-red-800 ink-reveal" : isYokai ? "text-[#f8f9fa] hover:text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" : "text-slate-900 hover:text-emerald-600"}`}
                    title="클릭하여 발음 듣기"
                  >
                    {currentVocab.word}
                  </h1>
                </div>
                <div className="relative">
                  <span lang="ja" className={`text-xs font-mono ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-400"}`}>
                    {currentVocab.hiragana} <span lang="ko">({currentVocab.pronunciation})</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentVocab.word);
                    }}
                    className={`absolute -top-3 -right-12 p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ${isSamurai ? "bg-[#f4e8d1] border border-amber-900/30 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]" : isYokai ? "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white hover:shadow-[0_0_15px_rgba(14,165,233,0.6)]" : "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-emerald-600"}`}
                    title="단어 발음 듣기"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className={`inline-block mt-2 px-3.5 py-1.5 rounded-full text-base font-bold ${isSamurai ? "bg-[#3e2723] text-[#f4e8d1]" : isYokai ? "bg-[#0ea5e9] text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]" : "bg-slate-900 text-white"}`}>
                  {currentVocab.meaning}
                </div>
              </div>
            </div>

            {/* Right side card: Kanjis breakdown & mnemonics */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              {/* Meaning & Memorization */}
              <div className={`rounded-2xl p-4 space-y-3 relative z-10 ${isSamurai ? "bg-amber-900/10 border border-amber-900/20" : isYokai ? "bg-[#0f172a]/60 border border-[#0ea5e9]/30" : "bg-emerald-50/50 border border-emerald-200/50"}`}>
                <div className={`absolute top-2.5 right-2 ${isSamurai ? "text-amber-700" : isYokai ? "text-[#38bdf8]" : "text-emerald-500/80"}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className={`text-[13px] font-bold tracking-wider block ${isSamurai ? "text-amber-950" : isYokai ? "text-[#38bdf8]" : "text-emerald-800"}`}>
                  💡 구성 한자 하나씩 쉽게 외우기
                </span>

                <div className="space-y-3 pt-2">
                  {currentVocab.kanjiBreakdown && currentVocab.kanjiBreakdown.length > 0 ? (
                    currentVocab.kanjiBreakdown.map((kj, kjIdx) => (
                      <div
                        key={kjIdx}
                        className={`border rounded-xl p-3 sm:p-3.5 flex items-start gap-3 transition-colors ${isSamurai
                          ? "bg-[rgba(255,255,255,0.3)] border-amber-900/20 hover:border-amber-900/40"
                          : isYokai
                            ? "bg-[#0f172a]/40 border-[#38bdf8]/20 hover:border-[#38bdf8]/50"
                            : "bg-white border-slate-200/60 shadow-3xs hover:border-emerald-300"
                          }`}
                      >
                        <div
                          onClick={() => speakJapanese(kj.kanji)}
                          lang="ja"
                          className={`text-xl font-serif font-black rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${isSamurai
                            ? "text-red-800 bg-[#f4e8d1] border border-amber-900/30 hover:bg-[#f8f5ec]"
                            : isYokai
                              ? "text-[#38bdf8] bg-[#030712] border border-[#38bdf8]/50 hover:bg-[#0f172a]"
                              : "text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100"
                            }`}
                          title="클릭하여 발음 듣기"
                        >
                          {kj.kanji}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isSamurai ? "text-amber-950" : isYokai ? "text-slate-200" : "text-slate-800"}`}>
                              {kj.meaning}
                            </span>
                          </div>
                          <p className={`text-[11px] sm:text-xs leading-relaxed font-sans font-medium ${isSamurai ? "text-amber-900/70 font-serif" : isYokai ? "text-[#38bdf8]/70" : "text-slate-600"}`}>
                            {kj.mnemonic}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs italic ${isSamurai ? "text-amber-900/50" : "text-slate-400"}`}>
                      한자 분해 정보를 찾을 수 없습니다.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* LOWER EXAMPLE DIALOGUE BOX */}
          <div className={`rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden z-10 ${isSamurai ? "bg-[rgba(255,255,255,0.3)] border border-amber-900/20 text-amber-950" : isYokai ? "bg-[#030712]/80 border border-[#0ea5e9]/30 text-slate-200" : "bg-slate-900 text-slate-100"
            }`}>
            <div className={`absolute -bottom-4 -right-4 text-7xl font-sans font-bold select-none pointer-events-none ${isSamurai ? "text-amber-900/10" : isYokai ? "text-[#38bdf8]/5" : "text-slate-800 opacity-25"}`}>
              文
            </div>
            <div className={`flex items-center justify-between text-[13px] font-bold uppercase tracking-wider gap-2 ${isSamurai ? "text-amber-900/80" : isYokai ? "text-[#38bdf8]" : "text-emerald-400"}`}>
              <span>단어 예문 (例文)</span>
              <button
                onClick={() => speakJapanese(currentVocab.exampleSentence.japanese)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0 z-10 ${isSamurai ? "bg-amber-900/10 hover:bg-amber-900/20 text-amber-950" : isYokai ? "bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30" : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>예문 듣기</span>
              </button>
            </div>

            <div className="space-y-1.5 z-10 relative">
              <p lang="ja" className={`text-base sm:text-lg font-bold tracking-wide select-all ${isSamurai ? "text-amber-950" : isYokai ? "text-[#f8f9fa] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]" : "text-white"}`}>
                {currentVocab.exampleSentence.japanese}
              </p>
              <p lang="ja" className={`text-xs font-mono ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-400"}`}>
                {currentVocab.exampleSentence.hiragana}
              </p>
              <p className={`text-xs font-sans font-medium ${isSamurai ? "text-red-800" : isYokai ? "text-[#0ea5e9]" : "text-emerald-200"}`}>
                [{currentVocab.exampleSentence.pronunciation}]
              </p>
              <p className={`text-xs sm:text-sm border-t pt-1.5 mt-1.5 font-sans leading-relaxed ${isSamurai ? "text-amber-950 border-amber-900/20" : isYokai ? "text-[#e2e8f0] border-[#0ea5e9]/30" : "text-slate-300 border-white/10"
                }`}>
                {currentVocab.exampleSentence.meaning}
              </p>
            </div>
          </div>

        </div>

        {/* Footer and Navigation Action Controllers */}
        <div className={`px-5 py-4 flex items-center justify-between z-10 relative ${isSamurai ? "bg-transparent border-t border-amber-900/20" : isYokai ? "bg-transparent border-t border-[#0ea5e9]/30" : "bg-slate-50 border-t border-slate-100"
          }`}>
          <button
            onClick={handlePrevStudy}
            disabled={currentVocabIndex === 0}
            className={`py-3 px-5 text-sm font-bold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${isSamurai
                ? "bg-transparent hover:bg-amber-900/10 text-amber-950 border border-amber-900/30 rounded-none"
              : isYokai
                ? "bg-transparent hover:bg-[#0ea5e9]/20 text-[#e2e8f0] border border-[#0ea5e9]/40 rounded-lg"
                : "bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
              }`}
          >
            이전 단어
          </button>

          <div className={`text-xs font-mono hidden sm:block ${isSamurai ? "text-amber-900/70" : isYokai ? "text-[#38bdf8]/70" : "text-slate-500"}`}>
            {currentVocabIndex + 1} / {vocabList.length} 완독 진행
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
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl"
              }`}
          >
            <span className="z-10 relative">이해했음 (다음)</span>
            <ArrowRight className="w-4 h-4 z-10 relative" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
