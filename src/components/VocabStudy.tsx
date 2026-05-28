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
}

export function VocabStudy({
  vocabList,
  currentVocabIndex,
  handlePrevStudy,
  handleNextStudy,
  speakJapanese
}: VocabStudyProps) {
  const currentVocab = vocabList[currentVocabIndex];

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
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>단어 암기 진행률</span>
          </span>
          <span className="font-mono">
            {currentVocabIndex + 1} / {vocabList.length} 단어 ({Math.round(((currentVocabIndex + 1) / vocabList.length) * 100)}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentVocabIndex + 1) / vocabList.length) * 100}%` }}
          />
        </div>
      </div>

      {/* TEXTBOOK CORE CARD: Realizing Book-Aesthetic Page */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col shrink-0">
        
        {/* Book style index header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-400 font-bold">
            VOCAB INDEX #{String(currentVocabIndex + 1).padStart(4, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
              JLPT: {currentVocab.jlptLevel}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Vocab Character Visual Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left side card: Large Word Display */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center relative overflow-hidden">
              <div className="my-auto py-3 space-y-2">
                <div 
                  onClick={() => speakJapanese(currentVocab.word)}
                  className="text-4xl sm:text-6xl font-serif font-semibold text-slate-900 leading-none select-none select-all relative group cursor-pointer hover:text-emerald-600 transition-colors"
                  title="클릭하여 발음 듣기"
                >
                  {currentVocab.word}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentVocab.word);
                    }}
                    className="absolute -top-4 -right-6 p-1.5 rounded-full bg-white shadow-sm border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-emerald-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 cursor-pointer flex items-center justify-center"
                    title="단어 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs text-slate-400 font-mono">
                  {currentVocab.hiragana} ({currentVocab.pronunciation})
                </div>

                <div className="inline-block mt-2 px-3.5 py-1.5 bg-slate-900 text-white rounded-full text-base font-bold">
                  {currentVocab.meaning}
                </div>
              </div>

              <div className="w-full text-center border-t border-slate-200/50 pt-2 text-[10px] text-slate-450 font-medium">
                구성 한자 정보 포함 단어
              </div>
            </div>

            {/* Right side card: Kanjis breakdown & mnemonics */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              
              <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-4 space-y-3 relative">
                <div className="absolute top-2.5 right-2 text-emerald-500/80">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 tracking-wider block">
                  💡 구성 한자 하나씩 쉽게 외우기
                </span>
                
                <div className="space-y-3">
                  {currentVocab.kanjiBreakdown && currentVocab.kanjiBreakdown.length > 0 ? (
                    currentVocab.kanjiBreakdown.map((kj, kjIdx) => (
                      <div 
                        key={kjIdx}
                        className="bg-white border border-slate-200/60 rounded-xl p-3 sm:p-3.5 shadow-3xs flex items-start gap-3 hover:border-emerald-300 transition-colors"
                      >
                        <div 
                          onClick={() => speakJapanese(kj.kanji)}
                          className="text-xl font-serif font-black text-emerald-700 bg-emerald-50 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors shrink-0"
                          title="클릭하여 발음 듣기"
                        >
                          {kj.kanji}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-850">
                              {kj.meaning}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-sans font-medium">
                            {kj.mnemonic}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      한자 분해 정보를 찾을 수 없습니다.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* LOWER EXAMPLE DIALOGUE BOX */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 text-slate-800 text-7xl font-sans font-bold select-none pointer-events-none opacity-25">
              文
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider gap-2">
              <span>단어 예문 (例文)</span>
              <button
                onClick={() => speakJapanese(currentVocab.exampleSentence.japanese)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>예문 듣기</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-base sm:text-lg font-bold tracking-wide text-white select-all">
                {currentVocab.exampleSentence.japanese}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {currentVocab.exampleSentence.hiragana}
              </p>
              <p className="text-xs text-emerald-200 font-sans font-medium">
                [{currentVocab.exampleSentence.pronunciation}]
              </p>
              <p className="text-xs sm:text-sm text-slate-300 border-t border-white/10 pt-1.5 mt-1.5 font-sans leading-relaxed">
                {currentVocab.exampleSentence.meaning}
              </p>
            </div>
          </div>

        </div>

        {/* Footer and Navigation Action Controllers */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 py-4 flex items-center justify-between">
          <button
            onClick={handlePrevStudy}
            disabled={currentVocabIndex === 0}
            className="py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-35 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            이전 단어
          </button>

          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            {currentVocabIndex + 1} / {vocabList.length} 완독 진행
          </div>

          <button
            onClick={handleNextStudy}
            className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>이해했음 (다음)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
