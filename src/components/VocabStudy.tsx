import { useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  CornerDownRight,
  ArrowRight,
  HelpCircle,
  Star
} from "lucide-react";
import { VocabItem } from "../types";

import { getTheme } from "../theme";

interface VocabStudyProps {
  vocabList: VocabItem[];
  currentVocabIndex: number;
  handlePrevStudy: () => void;
  handleNextStudy: () => void;
  speakJapanese: (text: string) => void;
  currentTheme?: string;
  bookmarkedVocabs: string[];
  onToggleBookmark: (type: "kanji" | "vocab", item: string) => void;
}

export function VocabStudy({
  vocabList,
  currentVocabIndex,
  handlePrevStudy,
  handleNextStudy,
  speakJapanese,
  currentTheme = 'default',
  bookmarkedVocabs,
  onToggleBookmark
}: VocabStudyProps) {
  const currentVocab = vocabList[currentVocabIndex];
  const theme = getTheme(currentTheme);

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
        <div className={`flex items-center justify-between text-xs font-semibold ${theme.headerTextColor}`}>
          <span className="flex items-center gap-1">
            <BookOpen className={`w-4 h-4 ${theme.headerIconColor}`} />
            <span>단어 암기 진행률</span>
          </span>
          <span className="font-mono">
            {currentVocabIndex + 1} / {vocabList.length} 단어 ({Math.round(((currentVocabIndex + 1) / vocabList.length) * 100)}%)
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressTrackBg}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${theme.progressBarBg}`}
            style={{ width: `${((currentVocabIndex + 1) / vocabList.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={theme.cardContainer}>
        {theme.isSamurai && <div className="samurai-embers"></div>}
        {theme.isYokai && (
          <div className="yokai-wisps-container">
            <div className="yokai-wisp yokai-wisp-1"></div>
            <div className="yokai-wisp yokai-wisp-2"></div>
            <div className="yokai-wisp yokai-wisp-3"></div>
            <div className="yokai-wisp yokai-wisp-4"></div>
          </div>
        )}
        {theme.isZen && (
          <div className="zen-leaves">
            <div className="leaf-1"></div>
            <div className="leaf-2"></div>
            <div className="leaf-3"></div>
            <div className="leaf-4"></div>
            <div className="leaf-5"></div>
          </div>
        )}
        {theme.isChalkboard && (
          <div className="chalkboard-dust-particles">
            <div className="chalk-dust" style={{ left: '10%', animationDelay: '0s' }}></div>
            <div className="chalk-dust" style={{ left: '30%', animationDelay: '-3s' }}></div>
            <div className="chalk-dust" style={{ left: '50%', animationDelay: '-6s' }}></div>
            <div className="chalk-dust" style={{ left: '70%', animationDelay: '-9s' }}></div>
            <div className="chalk-dust" style={{ left: '90%', animationDelay: '-12s' }}></div>
          </div>
        )}

        {/* Book style index header */}
        <div className={`px-5 py-3.5 flex items-center justify-between z-10 relative ${theme.cardHeaderBg}`}>
          <span className={`font-mono text-xs font-bold ${theme.cardIndexText}`}>
            VOCAB INDEX #{String(currentVocabIndex + 1).padStart(4, '0')}
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${theme.badgeBg}`}>
              {currentVocab.pos}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Vocab Character Visual Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            <div
              className={`md:col-span-4 rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ${theme.wordPanelBg}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark("vocab", currentVocab.word);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-95 focus:outline-none z-20"
                title="북마크 토글"
              >
                <Star
                  className={`w-5 h-5 transition-all ${
                    bookmarkedVocabs.includes(currentVocab.word)
                      ? "text-amber-500 fill-amber-500 scale-110"
                      : "text-slate-400 fill-none"
                  }`}
                />
              </button>
              <div className="my-auto py-5 flex flex-col items-center justify-center gap-2">
                <div
                  className="relative group inline-block"
                >
                  <h1
                    lang="ja"
                    className={`${currentVocab.word.length >= 8 ? "text-xl sm:text-3xl" : currentVocab.word.length >= 6 ? "text-2xl sm:text-4xl" : currentVocab.word.length >= 4 ? "text-3xl sm:text-5xl" : "text-4xl sm:text-6xl"} font-serif font-semibold leading-none select-none select-all relative group transition-colors ${theme.wordTextHover}`}
                  >
                    {currentVocab.word}
                  </h1>
                </div>
                <div className="relative">
                  <span lang="ja" className={`text-xs font-mono ${theme.wordSubText}`}>
                    {currentVocab.hiragana} <span lang="ko">({currentVocab.pronunciation})</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentVocab.word);
                    }}
                    className={`absolute -top-4 -right-8 p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ${theme.wordAudioBtn}`}
                    title="단어 발음 듣기"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className={`inline-block mt-2 px-3.5 py-1.5 rounded-full text-base font-bold ${theme.meaningBadge}`}>
                  {currentVocab.meaning}
                </div>
              </div>
            </div>

            {/* Right side card: Kanjis breakdown & mnemonics */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              {/* Meaning & Memorization */}
              <div className={`rounded-2xl p-4 space-y-3 relative z-10 ${theme.breakdownPanelBg}`}>
                <div className={`absolute top-2.5 right-2 ${theme.breakdownIconColor}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className={`text-[13px] font-bold tracking-wider block ${theme.breakdownTitleColor}`}>
                  💡 단어 속 한자 하나씩 나누어 외우기
                </span>

                <div className="space-y-3 pt-2">
                  {currentVocab.kanjiBreakdown && currentVocab.kanjiBreakdown.length > 0 ? (
                    currentVocab.kanjiBreakdown.map((kj, kjIdx) => (
                      <div
                        key={kjIdx}
                        className={`border rounded-xl p-3 sm:p-3.5 flex items-start gap-3 transition-colors ${theme.breakdownItemBg}`}
                      >
                        <div
                          onClick={() => speakJapanese(kj.kanji)}
                          lang="ja"
                          className={`text-xl font-serif font-black rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${theme.breakdownKanjiBox}`}
                          title="클릭하여 발음 듣기"
                        >
                          {kj.kanji}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${theme.breakdownKanjiMeaning}`}>
                              {kj.meaning}
                            </span>
                          </div>
                          <p className={`text-[11px] sm:text-xs leading-relaxed font-sans font-medium ${theme.breakdownMnemonicText}`}>
                            {kj.mnemonic}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs italic ${theme.breakdownEmptyText}`}>
                      한자 분해 정보를 찾을 수 없습니다.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* LOWER EXAMPLE DIALOGUE BOX */}
          <div className={`rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden z-10 ${theme.exampleBoxBg}`}>
            <div className={`absolute -bottom-4 -right-4 text-7xl font-sans font-bold select-none pointer-events-none ${theme.exampleOverlayText}`}>
              文
            </div>
            <div className={`flex items-center justify-between text-[13px] font-bold uppercase tracking-wider gap-2 ${theme.exampleTitleColor}`}>
              <span>단어 예문 (例文)</span>
              <button
                onClick={() => speakJapanese(currentVocab.exampleSentence.japanese)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0 z-10 ${theme.exampleAudioBtn}`}
              >
                <Volume2 className="w-4 h-4" />
                <span>예문 듣기</span>
              </button>
            </div>

            <div className="space-y-1.5 z-10 relative">
              <p lang="ja" className={`text-base sm:text-lg font-bold tracking-wide select-all ${theme.exampleJapText}`}>
                {currentVocab.exampleSentence.japanese}
              </p>
              <p lang="ja" className={`text-xs font-mono ${theme.exampleHiraText}`}>
                {currentVocab.exampleSentence.hiragana}
              </p>
              <p className={`text-xs font-sans font-medium ${theme.examplePronunciationText}`}>
                [{currentVocab.exampleSentence.pronunciation}]
              </p>
              <p className={`text-xs sm:text-sm border-t pt-1.5 mt-1.5 font-sans leading-relaxed ${theme.exampleMeaningText}`}>
                {currentVocab.exampleSentence.meaning}
              </p>
            </div>
          </div>

        </div>

        {/* Footer and Navigation Action Controllers */}
        <div className={`px-5 py-4 flex items-center justify-between z-10 relative ${theme.footerBg}`}>
          <button
            onClick={handlePrevStudy}
            disabled={currentVocabIndex === 0}
            className={`py-3 px-5 text-sm font-bold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${theme.btnSecondary}`}
          >
            이전 단어
          </button>

          <div className={`text-xs font-mono hidden sm:block ${theme.cardIndexText}`}>
            {currentVocabIndex + 1} / {vocabList.length} 완독 진행
          </div>

          <button
            onClick={(e) => {
              if (theme.isYokai) {
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
              } else if (theme.isZen) {
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
              } else if (theme.isChalkboard) {
                const buttonEl = e.currentTarget;
                const rect = buttonEl.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Create chalk dust particles on click coordinates
                const particleCount = 15;
                for (let i = 0; i < particleCount; i++) {
                  const particle = document.createElement('div');
                  particle.className = 'chalk-click-particle';
                  particle.style.left = `${x}px`;
                  particle.style.top = `${y}px`;

                  const angle = Math.random() * Math.PI * 2;
                  const velocity = 20 + Math.random() * 60; // Spread distance
                  const tx = Math.cos(angle) * velocity;
                  const ty = Math.sin(angle) * velocity;
                  const size = 2.5 + Math.random() * 4; // Particle size

                  particle.style.width = `${size}px`;
                  particle.style.height = `${size}px`;
                  particle.style.setProperty('--tx', `${tx}px`);
                  particle.style.setProperty('--ty', `${ty}px`);

                  buttonEl.appendChild(particle);

                  setTimeout(() => {
                    particle.remove();
                  }, 800);
                }
              }
              handleNextStudy();
            }}
            className={`py-3 px-6 text-sm font-bold shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 overflow-hidden relative ${theme.btnPrimary}`}
          >
            <span className="z-10 relative">이해했음 (다음)</span>
            <ArrowRight className="w-4 h-4 z-10 relative" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
