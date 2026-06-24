import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  CornerDownRight,
  ArrowRight,
  Star
} from "lucide-react";
import { KanjiItem, RadicalPart } from "../types";
import { RadicalModal } from "./RadicalModal";
import { getTheme } from "../theme";

interface KanjiStudyProps {
  kanjiList: KanjiItem[];
  currentKanjiIndex: number;
  handlePrevStudy: () => void;
  handleNextStudy: () => void;
  speakJapanese: (text: string) => void;
  currentTheme?: string;
  bookmarkedKanjis: string[];
  onToggleBookmark: (type: "kanji" | "vocab", item: string) => void;
}

export function KanjiStudy({
  kanjiList,
  currentKanjiIndex,
  handlePrevStudy,
  handleNextStudy,
  speakJapanese,
  currentTheme = 'default',
  bookmarkedKanjis,
  onToggleBookmark
}: KanjiStudyProps) {
  const [activeRadical, setActiveRadical] = useState<RadicalPart | null>(null);

  const theme = getTheme(currentTheme);
  const isSamurai = theme.isSamurai;
  const isYokai = theme.isYokai;
  const isZen = theme.isZen;

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
        <div className={`flex items-center justify-between text-xs font-semibold ${theme.headerTextColor}`}>
          <span className="flex items-center gap-1">
            <BookOpen className={`w-4 h-4 ${theme.headerIconColorKanji}`} />
            <span>한자 암기 진행률</span>
          </span>
          <span className="font-mono">
            {currentKanjiIndex + 1} / {kanjiList.length} 한자 ({Math.round(((currentKanjiIndex + 1) / kanjiList.length) * 100)}%)
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressTrackBg}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${theme.progressBarBg}`}
            style={{ width: `${((currentKanjiIndex + 1) / kanjiList.length) * 100}%` }}
          />
        </div>
      </div>

      {/* TEXTBOOK CORE CARD: Realizing Book-Aesthetic Page */}
      <div className={`${theme.cardContainer} overflow-hidden flex flex-col shrink-0 relative font-sans`}>
        {isSamurai && <div className="samurai-embers"></div>}
        {isYokai && (
          <div className="yokai-wisps-container">
            <div className="yokai-wisp yokai-wisp-1"></div>
            <div className="yokai-wisp yokai-wisp-2"></div>
            <div className="yokai-wisp yokai-wisp-3"></div>
            <div className="yokai-wisp yokai-wisp-4"></div>
          </div>
        )}
        {isZen && (
          <div className="zen-leaves">
            <div className="leaf-1"></div>
            <div className="leaf-2"></div>
            <div className="leaf-3"></div>
            <div className="leaf-4"></div>
            <div className="leaf-5"></div>
          </div>
        )}

        {/* Book style index header */}
        <div className={`px-5 py-3.5 flex items-center justify-between z-10 relative ${theme.cardHeaderBg}`}>
          <span className={`font-mono text-xs font-bold ${theme.cardIndexText}`}>
            INDEX #{String(currentKanjiIndex + 1).padStart(4, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${theme.badgeGradeBg}`}>
              GRADE: {currentKanji.grade}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${theme.badgeBg}`}>
              JLPT: {currentKanji.jlptLevel}
            </span>
        </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">

          {/* Outer grid matching photo content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Character Card Visual Panel (Left side in Book page) */}
            <div
              className={`md:col-span-4 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ${theme.wordPanelBg}`}
            >
              <div className={`absolute top-2 left-2 text-[10px] font-mono font-bold ${theme.strokeCountText}`}>
                {currentKanji.strokeCount} 획
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark("kanji", currentKanji.kanji);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-95 focus:outline-none z-20"
                title="북마크 토글"
              >
                <Star
                  className={`w-5 h-5 transition-all ${
                    bookmarkedKanjis.includes(currentKanji.kanji)
                      ? "text-amber-500 fill-amber-500 scale-110"
                      : "text-slate-400 fill-none"
                  }`}
                />
              </button>

              <div className="my-auto py-4">
                <div
                  key={`kanji-${currentKanji.kanji}`}
                  lang="ja"
                  className={`text-7xl sm:text-8xl font-serif font-semibold leading-none select-none select-all relative group transition-colors ${theme.kanjiTextHover}`}
                >
                  {currentKanji.kanji}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentKanji.kanji);
                    }}
                    className={`absolute -top-4 -right-6 p-1.5 rounded-full shadow-sm transition-all opacity-100 cursor-pointer flex items-center justify-center ${theme.kanjiAudioBtn}`}
                    title="한자 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className={`mt-4 px-3 py-1 rounded-full text-base font-bold ${theme.kanjiMeaningBadge}`}>
                  {currentKanji.meaning}
                </div>
              </div>

            </div>

            {/* STORYBOARD & MEMORIZATION EXPLANATION PANEL */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-4">

              {/* Associative 스토리 보드 */}
              <div className={`rounded-2xl p-4 space-y-2 relative z-10 ${theme.mnemonicPanelBg}`}>
                <div className={`absolute top-2.5 right-2 ${theme.mnemonicIconColor}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold tracking-wider block ${theme.mnemonicTitleColor}`}>
                  💡 핵심 이미지 연상 암기 키워드
                </span>
                <p className={`text-sm sm:text-base font-medium leading-relaxed ${theme.radicalKanjiMeaning}`}>
                  {currentKanji.mnemonic}
                </p>
              </div>

              {/* Radicals Component Breakdown for absolute beginners */}
              {currentKanji.radicalsBreakdown && currentKanji.radicalsBreakdown.length > 0 && (
                <div className={`rounded-2xl p-4 space-y-3 z-10 relative ${theme.radicalsBoxBg}`}>
                  <span className={`text-[10px] font-bold tracking-wider block uppercase ${theme.questionInstructionColor}`}>
                    🧩 구성 자형 분해 (각 부수를 클릭하여 어원과 의미를 확인해 보세요)
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
                          className={`group rounded-xl p-3 transition-all flex items-center justify-between cursor-pointer ${theme.radicalItemBg}`}
                          title={hasDetails ? "클릭하여 어원 파해 및 상세 연상 암기 비법 보기" : ""}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span lang="ja" className={`text-lg font-serif font-black rounded-lg w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-all shrink-0 ${theme.radicalKanjiBox}`}>
                              {rad.component}
                            </span>
                            <div className="flex flex-col truncate">
                              <span className={`text-xs font-bold font-sans ${theme.radicalKanjiMeaning}`}>
                                {rad.meaning}
                              </span>
                              {rad.mnemonic && (
                                <p className={`text-[10px] font-sans truncate mt-0.5 ${theme.relatedWordSubText}`}>
                                  {rad.mnemonic}
                                </p>
                              )}
                            </div>
                          </div>

                          {hasDetails && (
                            <div className={`flex items-center gap-1 text-[9px] font-black rounded-full px-2 py-0.5 shrink-0 transition-colors ${theme.radicalItemBadge}`}>
                              <Sparkles className={`w-2.5 h-2.5 ${theme.radicalItemBadgeIcon}`} />
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
              <div className={`border rounded-xl overflow-hidden text-xs z-10 relative ${theme.tableBorder}`}>
                {/* Table row Onyomi */}
                <div className={`grid grid-cols-12 border-b shrink-0 ${theme.tableBorder}`}>
                  <div className={`col-span-3 p-2.5 font-bold flex flex-col justify-center items-center text-center border-r gap-0.5 ${theme.tableHeaderCol}`}>
                    <span>음독</span>
                    <span className={`text-[10px] font-mono ${theme.tableHeaderLabelText}`}>(音)</span>
                  </div>
                  <div className={`col-span-9 p-2.5 space-y-1 ${theme.tableValueCol}`}>
                    <div className="flex items-center gap-2">
                      <span lang="ja" className={`text-sm font-bold font-mono ${theme.tableJapText}`}>{currentKanji.onyomi}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${theme.tableOnyomiKoreanBadge}`}>
                        {currentKanji.onyomiKorean}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(currentKanji.onyomi);
                        }}
                        className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ml-1 ${theme.tableAudioBtn}`}
                        title="음독 발음 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table row Hunyomi */}
                <div className="grid grid-cols-12 shrink-0">
                  <div className={`col-span-3 p-2.5 font-bold flex flex-col justify-center items-center text-center border-r gap-0.5 ${theme.tableHeaderCol}`}>
                    <span>훈독</span>
                    <span className={`text-[10px] font-mono ${theme.tableHeaderLabelText}`}>(訓)</span>
                  </div>
                  <div className={`col-span-9 p-2.5 space-y-1 ${theme.tableValueCol}`}>
                    <div className="flex items-center gap-2">
                      <span lang="ja" className={`text-sm font-bold font-mono ${theme.tableJapText}`}>{currentKanji.hunyomi?.replace(/\./g, "")}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${theme.tableHunyomiKoreanBadge}`}>
                        {currentKanji.hunyomiKorean}
                      </span>
                      {currentKanji.hunyomi && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(currentKanji.hunyomi!.replace(/\./g, ""));
                          }}
                          className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ml-1 ${theme.tableAudioBtn}`}
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
                  className={`border rounded-xl p-3 space-y-1 text-xs transition-colors relative group z-10 ${theme.relatedWordCard}`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span lang="ja" className={`font-bold text-sm tracking-wide font-mono select-all ${theme.relatedWordJapText}`}>
                      {item.word}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakJapanese(item.word);
                      }}
                      className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ${theme.tableAudioBtn}`}
                      title="발음 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-mono ${theme.relatedWordSubText}`}>
                    <span lang="ja">{item.hiragana}</span>
                    <span> | </span>
                    <span lang="ko" className={theme.relatedWordPronunciationText}>{item.pronunciation}</span>
                  </div>
                  <div className={`font-semibold font-sans border-t pt-1 mt-1 text-[11px] ${theme.relatedWordMeaningText}`}>
                    뜻: {item.meaning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOWER EXAMPLE DIALOGUE ACCORDION BOX */}
          <div className={`rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden z-10 ${theme.exampleBoxBg}`}>
            <div className={`absolute -bottom-4 -right-4 text-7xl font-sans font-bold select-none pointer-events-none ${theme.exampleOverlayText}`}>
              文
            </div>
            <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider gap-2 ${theme.exampleTitleColorKanji}`}>
              <span>연상 학습 필수 예문 (例文)</span>
              <button
                onClick={() => speakJapanese(currentKanji.exampleSentence.japanese)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0 z-10 ${theme.exampleAudioBtn}`}
              >
                <Volume2 className="w-4 h-4" />
                <span>예문 연속 읽기</span>
              </button>
            </div>

            <div className="space-y-1.5 z-10 relative">
              <p lang="ja" className={`text-base sm:text-lg font-bold tracking-wide select-all ${theme.exampleJapText}`}>
                {currentKanji.exampleSentence.japanese}
              </p>
              <p lang="ja" className={`text-xs font-mono ${theme.exampleHiraText}`}>
                {currentKanji.exampleSentence.hiragana}
              </p>
              <p className={`text-xs font-sans font-medium ${theme.examplePronunciationTextKanji}`}>
                [{currentKanji.exampleSentence.pronunciation}]
              </p>
              <p className={`text-xs sm:text-sm border-t pt-1.5 mt-1.5 font-sans leading-relaxed ${theme.exampleMeaningText}`}>
                {currentKanji.exampleSentence.meaning}
              </p>
            </div>
          </div>

        </div>

        {/* Footer and Navigation Action Controllers */}
        <div className={`px-5 py-4 flex items-center justify-between z-10 relative ${theme.footerBg}`}>
          <button
            onClick={handlePrevStudy}
            disabled={currentKanjiIndex === 0}
            className={`py-3 px-5 text-sm font-bold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${theme.btnSecondary}`}
          >
            이전 한자
          </button>

          <div className={`text-xs font-mono hidden sm:block ${theme.cardIndexText}`}>
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
              } else if (isZen) {
                const buttonEl = e.currentTarget;
                const ripple1 = document.createElement('div');
                ripple1.className = 'zen-ripple';
                buttonEl.appendChild(ripple1);
                setTimeout(() => {
                  ripple1.remove();
                }, 900);

                setTimeout(() => {
                  if (buttonEl) {
                    const ripple2 = document.createElement('div');
                    ripple2.className = 'zen-ripple';
                    buttonEl.appendChild(ripple2);
                    setTimeout(() => {
                      ripple2.remove();
                    }, 900);
                  }
                }, 150);
              }
              handleNextStudy();
            }}
            className={`py-3 px-6 text-sm font-bold shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 overflow-hidden relative ${theme.btnPrimaryKanji}`}
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
