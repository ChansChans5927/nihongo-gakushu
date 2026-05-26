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
}

export function KanjiStudy({
  kanjiList,
  currentKanjiIndex,
  handlePrevStudy,
  handleNextStudy,
  speakJapanese
}: KanjiStudyProps) {
  const [activeRadical, setActiveRadical] = useState<RadicalPart | null>(null);
  
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
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>한자 암기 진행률</span>
          </span>
          <span className="font-mono">
            {currentKanjiIndex + 1} / {kanjiList.length} 한자 ({Math.round(((currentKanjiIndex + 1) / kanjiList.length) * 100)}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentKanjiIndex + 1) / kanjiList.length) * 100}%` }}
          />
        </div>
      </div>

      {/* TEXTBOOK CORE CARD: Realizing Book-Aesthetic Page */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col shrink-0">
        
        {/* Book style index header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-400 font-bold">
            INDEX #{String(currentKanjiIndex + 1).padStart(4, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded">
              GRADE: {currentKanji.grade}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
              JLPT: {currentKanji.jlptLevel}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Outer grid matching photo content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Character Card Visual Panel (Left side in Book page) */}
            <div className="md:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden">
              <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono font-bold">
                {currentKanji.strokeCount} 획
              </div>
              
              <div className="my-auto py-4">
                <div 
                  onClick={() => speakJapanese(currentKanji.kanji)}
                  className="text-7xl sm:text-8xl font-serif font-semibold text-slate-900 leading-none select-none select-all relative group cursor-pointer hover:text-amber-600 transition-colors"
                  title="클릭하여 발음 듣기"
                >
                  {currentKanji.kanji}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentKanji.kanji);
                    }}
                    className="absolute -top-2 -right-6 p-1.5 rounded-full bg-white shadow-sm border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-amber-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 cursor-pointer flex items-center justify-center"
                    title="한자 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 px-3 py-1 bg-slate-900 text-white rounded-full text-base font-bold">
                  {currentKanji.meaning}
                </div>
              </div>

              <div className="w-full text-center border-t border-slate-200/50 pt-2 text-[11px] text-slate-400 font-medium">
                스마트 획수: 명확 {currentKanji.strokeCount}획수 기준
              </div>
            </div>

            {/* STORYBOARD & MEMORIZATION EXPLANATION PANEL */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-4">
              
              {/* Associative 스토리 보드 */}
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 space-y-2 relative">
                <div className="absolute top-2.5 right-2 text-amber-400/80">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-800 tracking-wider block">
                  💡 핵심 이미지 연상 암기 키워드
                </span>
                <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                  {currentKanji.mnemonic}
                </p>
              </div>

              {/* Radicals Component Breakdown for absolute beginners */}
              {currentKanji.radicalsBreakdown && currentKanji.radicalsBreakdown.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">
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
                          className={`group bg-white border border-slate-200/60 rounded-xl p-3 shadow-3xs hover:border-amber-300 hover:bg-amber-50/10 hover:shadow-2xs active:scale-[0.99] transition-all flex items-center justify-between cursor-pointer`}
                          title={hasDetails ? "클릭하여 어원 파해 및 상세 연상 암기 비법 보기" : ""}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-lg font-serif font-black text-amber-600 bg-amber-50 rounded-lg w-9 h-9 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100/60 group-hover:scale-105 transition-all shrink-0">
                              {rad.component}
                            </span>
                            <div className="flex flex-col truncate">
                              <span className="text-xs text-slate-800 font-bold font-sans">
                                {rad.meaning}
                              </span>
                              {rad.mnemonic && (
                                <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                                  {rad.mnemonic}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {hasDetails && (
                            <div className="flex items-center gap-1 text-[9px] text-amber-700 font-black bg-amber-50/80 border border-amber-100 rounded-full px-2 py-0.5 shrink-0 group-hover:bg-amber-100 transition-colors">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
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
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                {/* Table row Onyomi */}
                <div className="grid grid-cols-12 border-b border-slate-200 shrink-0">
                  <div className="col-span-3 bg-slate-50 p-2.5 font-bold text-slate-700 flex flex-col justify-center items-center text-center border-r border-slate-200 gap-0.5">
                    <span>음독</span>
                    <span className="text-[10px] text-slate-400 font-mono">(音)</span>
                  </div>
                  <div className="col-span-9 p-2.5 bg-white space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">{currentKanji.onyomi}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">
                        {currentKanji.onyomiKorean}
                      </span>
                      <button 
                        onClick={() => speakJapanese(currentKanji.onyomi)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="음독 발음 듣기"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table row Hunyomi */}
                <div className="grid grid-cols-12 shrink-0">
                  <div className="col-span-3 bg-slate-50 p-2.5 font-bold text-slate-700 flex flex-col justify-center items-center text-center border-r border-slate-200 gap-0.5">
                    <span>훈독</span>
                    <span className="text-[10px] text-slate-400 font-mono">(訓)</span>
                  </div>
                  <div className="col-span-9 p-2.5 bg-white space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">{currentKanji.hunyomi}</span>
                      <span className="text-[10px] bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold font-mono">
                        {currentKanji.hunyomiKorean}
                      </span>
                      <button 
                        onClick={() => speakJapanese(currentKanji.hunyomi)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="훈독 발음 듣기"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
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
                  className="bg-slate-50 hover:bg-amber-50/20 border border-slate-100 hover:border-amber-100 rounded-xl p-3 space-y-1 text-xs transition-colors relative group"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm tracking-wide font-mono select-all">
                      {item.word}
                    </span>
                    <button
                      onClick={() => speakJapanese(item.word)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-slate-100 text-slate-500 cursor-pointer flex items-center justify-center shrink-0"
                      title="어휘 발음 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <span>{item.hiragana}</span>
                    <span> | </span>
                    <span className="text-slate-500">{item.pronunciation}</span>
                  </div>
                  <div className="font-semibold text-slate-700 font-sans border-t border-slate-200/40 pt-1 mt-1 text-[11px]">
                    뜻: {item.meaning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOWER EXAMPLE DIALOGUE ACCORDION BOX */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 text-slate-800 text-7xl font-sans font-bold select-none pointer-events-none opacity-25">
              文
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider gap-2">
                  <span>연상 학습 필수 예문 (例文)</span>
                  <button
                    onClick={() => speakJapanese(currentKanji.exampleSentence.japanese)}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>예문 연속 읽기</span>
                  </button>
                </div>

            <div className="space-y-1.5">
              <p className="text-base sm:text-lg font-bold tracking-wide text-white select-all">
                {currentKanji.exampleSentence.japanese}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {currentKanji.exampleSentence.hiragana}
              </p>
              <p className="text-xs text-amber-200 font-sans font-medium">
                [{currentKanji.exampleSentence.pronunciation}]
              </p>
              <p className="text-xs sm:text-sm text-slate-300 border-t border-white/10 pt-1.5 mt-1.5 font-sans leading-relaxed">
                {currentKanji.exampleSentence.meaning}
              </p>
            </div>
          </div>

        </div>

        {/* Footer and Navigation Action Controllers */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 py-4 flex items-center justify-between">
          <button
            onClick={handlePrevStudy}
            disabled={currentKanjiIndex === 0}
            className="py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-35 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            이전 한자
          </button>

          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            {currentKanjiIndex + 1} / {kanjiList.length} 완독 진행
          </div>

          <button
            onClick={handleNextStudy}
            className="py-3 px-6 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>이해했음 (다음)</span>
            <ArrowRight className="w-4 h-4" />
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
