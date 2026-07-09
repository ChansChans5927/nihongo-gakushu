import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, CheckCircle2, ArrowRight, Award, Sparkles, X } from "lucide-react";
import { Question } from "../types";
import { getTheme } from "../theme";
import { ThemeParticles } from "./ThemeParticles";

interface QuizTestProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [questionId: number]: number };
  handleSelectAnswer: (choiceIndex: number) => void;
  handlePrevQuestion: () => void;
  handleNextQuestion: () => void;
  handleGradeQuiz: () => void;
  currentTheme?: string;
}

export function QuizTest({
  questions,
  currentQuestionIndex,
  userAnswers,
  handleSelectAnswer,
  handlePrevQuestion,
  handleNextQuestion,
  handleGradeQuiz,
  currentTheme = 'default'
}: QuizTestProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const [slashingChoice, setSlashingChoice] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const yokaiAudioRef = useRef<HTMLAudioElement | null>(null);
  const zenAudioRef = useRef<HTMLAudioElement | null>(null);
  const chalkboardAudioRef = useRef<HTMLAudioElement | null>(null);
  const sakuraAudioRef = useRef<HTMLAudioElement | null>(null);
  const auraAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio once
  if (typeof window !== 'undefined') {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/slash.mp3");
      audioRef.current.volume = 0.6;
    }
    if (!yokaiAudioRef.current) {
      yokaiAudioRef.current = new Audio("/sounds/chime.mp3");
      yokaiAudioRef.current.volume = 0.6;
    }
    if (!zenAudioRef.current) {
      zenAudioRef.current = new Audio("/sounds/water.mp3");
      zenAudioRef.current.volume = 0.65;
    }
    if (!chalkboardAudioRef.current) {
      chalkboardAudioRef.current = new Audio("/sounds/chalk.wav");
      chalkboardAudioRef.current.volume = 0.7;
    }
    if (!sakuraAudioRef.current) {
      sakuraAudioRef.current = new Audio("/sounds/ding.wav");
      sakuraAudioRef.current.volume = 0.6;
    }
    if (!auraAudioRef.current) {
      auraAudioRef.current = new Audio("/sounds/aura.wav");
      auraAudioRef.current.volume = 0.55;
    }
  }

  const theme = getTheme(currentTheme);
  const isSamurai = theme.isSamurai;
  const isYokai = theme.isYokai;
  const isZen = theme.isZen;

  const onSelect = (choiceIdx: number) => {
    if (isSamurai) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setSlashingChoice(choiceIdx);
      setIsShaking(true);
      setTimeout(() => {
        setSlashingChoice(null);
        setIsShaking(false);
      }, 600);
    } else if (isYokai) {
      if (yokaiAudioRef.current) {
        yokaiAudioRef.current.currentTime = 0;
        yokaiAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    } else if (isZen) {
      if (zenAudioRef.current) {
        zenAudioRef.current.currentTime = 0;
        zenAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    } else if (theme.isChalkboard) {
      if (chalkboardAudioRef.current) {
        chalkboardAudioRef.current.currentTime = 0;
        chalkboardAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    } else if (currentTheme === 'golden_sakura') {
      if (sakuraAudioRef.current) {
        sakuraAudioRef.current.currentTime = 0;
        sakuraAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    } else if (currentTheme === 'golden_aura') {
      if (auraAudioRef.current) {
        auraAudioRef.current.currentTime = 0;
        auraAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
    handleSelectAnswer(choiceIdx);
  };

  return (
    <motion.div
      key="testing-screen"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 w-full"
    >
      <div className="space-y-2">
        <div className={`flex items-center justify-between text-xs font-semibold ${theme.headerTextColor}`}>
          <span className="flex items-center gap-1">
            <HelpCircle className={`w-4 h-4 ${theme.headerIconColorQuiz}`} />
            <span>진단 객관식 테스트</span>
          </span>
          <span className="font-mono">
            진행률: {currentQuestionIndex + 1} / {questions.length} 문제 ({Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%)
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressTrackBg}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${theme.progressBarBgQuiz}`}
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz Card View Component */}
      <div
        className={`${theme.cardContainer} overflow-hidden p-5 sm:p-6 space-y-6 relative ${isShaking && isSamurai ? "shake-effect" : ""} ${currentTheme === 'golden_aura' ? 'golden-aura-card-glow' : ''}`}
      >
        <ThemeParticles theme={currentTheme} />
        {/* Visual badge - Hanko style */}
        <span className={theme.sealBadgeClass}>
          Question 0{currentQuestion.id}
        </span>

        {/* Question description */}
        <div className="space-y-1 mt-1 z-10 relative">
          <h3 className={`text-lg sm:text-xl font-bold ${theme.questionPromptText}`}>
            {currentQuestion.type === 'blank_fill'
              ? "제시된 일본어 예문의 빈칸에 들어갈 알맞은 단어는 무엇일까요?"
              : currentQuestion.questionText
                  .replace(/한자 '[^']+'의/g, '다음 한자의')
                  .replace(/단어 '[^']+'의/g, '다음 단어의')}
          </h3>
          <p className={`text-xs ${theme.questionPromptSubText}`}>
            {currentQuestion.type === 'blank_fill'
              ? "* 제시된 예문의 맥락과 뜻을 파악하고 알맞은 일본어 표기의 단어를 보기에서 선택해 보세요."
              : "* 제시된 내용을 꼼꼼하게 기억해 보고, 4개의 보기 중 하나를 선택해 보세요."}
          </p>
        </div>

        {/* Big Display character for visual hints */}
        <div className={`${theme.quizDisplayBox} flex flex-col items-center justify-center py-6 gap-2`}>
          {currentQuestion.type === 'blank_fill' ? (
            <div lang="ja" className="w-full text-center space-y-3">
              <div className={`text-lg sm:text-2xl font-semibold tracking-wide leading-relaxed ${theme.questionPromptText} ${isSamurai ? "font-serif" : "font-sans"}`}>
                {(() => {
                  const sentence = currentQuestion.questionSentence || "";
                  if (sentence.includes("__blank__")) {
                    const parts = sentence.split("__blank__");
                    return (
                      <>
                        {parts[0]}
                        <span lang="ko" className={`inline-flex items-center border-2 border-dashed px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold mx-1 select-none animate-pulse ${theme.blankFillBlockQuiz}`}>
                          빈칸
                        </span>
                        {parts[1]}
                      </>
                    );
                  }

                  // Fallback to vocab word splitting if __blank__ is not in questionSentence
                  const vocab = currentQuestion.vocabItem;
                  if (vocab) {
                    const word = vocab.word;
                    const vocabSentence = vocab.exampleSentence.japanese;
                    const parts = vocabSentence.split(word);
                    if (parts.length > 1) {
                      return (
                        <>
                          {parts[0]}
                          <span lang="ko" className={`inline-flex items-center border-2 border-dashed px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold mx-1 select-none animate-pulse ${theme.blankFillBlockQuiz}`}>
                            빈칸
                          </span>
                          {parts[1]}
                        </>
                      );
                    } else {
                      const firstChar = word[0];
                      const charParts = vocabSentence.split(firstChar);
                      if (charParts.length > 1) {
                        return (
                          <>
                            {charParts[0]}
                            <span lang="ko" className={`inline-flex items-center border-2 border-dashed px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold mx-1 select-none animate-pulse ${theme.blankFillBlockQuiz}`}>
                              빈칸
                            </span>
                            {charParts[1]}
                          </>
                        );
                      }
                    }
                    return <span className={`font-bold leading-normal ${theme.questionPromptText}`}>{vocabSentence}</span>;
                  }
                  return <span className={`font-bold leading-normal ${theme.questionPromptText}`}>{sentence}</span>;
                })()}
              </div>
            </div>
          ) : (
            <>
              <div lang="ja" className={`text-4xl sm:text-5xl font-extrabold select-none text-center ${
                isSamurai 
                  ? "font-serif text-amber-950 drop-shadow-sm" 
                  : isYokai 
                    ? "font-serif text-[#f8f9fa] drop-shadow-md shadow-[#48cae4]" 
                    : isZen 
                      ? "font-serif text-emerald-950 drop-shadow-xs" 
                      : theme.isChalkboard 
                        ? "font-serif text-slate-100 drop-shadow-[0_2px_4px_rgba(255,255,255,0.15)]" 
                        : currentTheme === 'golden_sakura'
                          ? "font-serif text-rose-900 drop-shadow-xs"
                          : currentTheme === 'golden_aura'
                            ? "font-serif text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]"
                            : "font-serif text-slate-800"
              }`}>
                {currentQuestion.type === 'kanji_match' ? (
                  <span className={`font-sans tracking-widest animate-pulse ${theme.quizBigDisplayHint}`}>?</span>
                ) : (
                  currentQuestion.vocabItem ? currentQuestion.vocabItem.word : currentQuestion.kanjiItem?.kanji
                )}
              </div>
              {currentQuestion.type === 'kanji_match' ? (
                <span className={`text-xs font-mono text-center ${theme.questionPromptSubText}`}>
                  알맞은 표기를 아래 보기에서 선택하세요
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsHintOpen(true)}
                  className={`text-xs font-bold text-center underline underline-offset-4 cursor-pointer hover:opacity-80 transition-all flex items-center gap-1 justify-center py-1 px-2.5 rounded-lg border border-dashed ${theme.btnHintQuiz}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>암기 비법 힌트 보기</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Multiple choice selections */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.choices.map((choice, choiceIdx) => {
            const isSelected = userAnswers[currentQuestion.id] === choiceIdx;
            const isKanjiMatch = currentQuestion.type === 'kanji_match';
            const isSlashing = slashingChoice === choiceIdx;

            // Theme-based styles
            let baseStyles = theme.choiceBtnBase;
            let selectedStyles = theme.choiceBtnSelected;
            let indexStyles = theme.choiceIdxBase;
            let selectedIndexStyles = theme.choiceIdxSelected;
            let checkIconColor = theme.checkIconColor;
            let customClasses = isSamurai ? "border-2 rounded-none sword-glint" : theme.isDefault ? "rounded-xl border" : "rounded-xl border-transparent";

            return (
              <button
                key={choiceIdx}
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
                  } else if (currentTheme === 'golden_sakura') {
                    const buttonEl = e.currentTarget;
                    const rect = buttonEl.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;

                    // Sakura Burst Particles
                    const particleCount = 12;
                    for (let i = 0; i < particleCount; i++) {
                      const particle = document.createElement('div');
                      particle.className = 'sakura-burst-particle';
                      particle.style.left = `${clickX}px`;
                      particle.style.top = `${clickY}px`;

                      const angle = Math.random() * Math.PI * 2;
                      const velocity = 30 + Math.random() * 80; // Spread distance
                      const tx = Math.cos(angle) * velocity;
                      const ty = Math.sin(angle) * velocity;
                      const size = 6 + Math.random() * 8; // Particle size
                      const rot = (Math.random() - 0.5) * 360; // Rotation

                      particle.style.width = `${size}px`;
                      particle.style.height = `${size}px`;
                      particle.style.setProperty('--tx', `${tx}px`);
                      particle.style.setProperty('--ty', `${ty}px`);
                      particle.style.setProperty('--rot', `${rot}deg`);

                      buttonEl.appendChild(particle);

                      setTimeout(() => {
                        particle.remove();
                      }, 800);
                    }

                    // Add pulse shadow class
                    buttonEl.classList.add('sakura-select-pulse');
                    setTimeout(() => buttonEl.classList.remove('sakura-select-pulse'), 800);
                  } else if (currentTheme === 'golden_aura') {
                    const buttonEl = e.currentTarget;
                    const rect = buttonEl.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;

                    // Aura Shockwave
                    const shockwave = document.createElement('div');
                    shockwave.className = 'aura-shockwave';
                    shockwave.style.left = `${clickX}px`;
                    shockwave.style.top = `${clickY}px`;
                    shockwave.style.width = '20px';
                    shockwave.style.height = '20px';
                    
                    buttonEl.appendChild(shockwave);
                    setTimeout(() => shockwave.remove(), 700);

                    // Add halo button flash class
                    buttonEl.classList.add('aura-select-flash');
                    setTimeout(() => buttonEl.classList.remove('aura-select-flash'), 800);
                  }
                  onSelect(choiceIdx);
                }}
                className={`w-full text-left font-bold transition-all duration-200 flex items-center justify-between cursor-pointer relative overflow-hidden ${isKanjiMatch ? "py-3.5 px-4 sm:py-5 sm:px-6" : "p-3 sm:p-4 text-sm"
                  } ${isSelected ? selectedStyles : baseStyles} ${customClasses
                  } ${isSlashing ? "samurai-slash-effect scale-[0.98]" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 flex items-center justify-center font-mono text-xs ${isSelected ? selectedIndexStyles : indexStyles
                    } ${!isSamurai && "rounded-full"}`}>
                    {choiceIdx + 1}
                  </span>
                  <span lang="ja" className={`leading-snug break-keep ${isKanjiMatch
                      ? `text-xl sm:text-2xl font-serif font-extrabold tracking-normal pl-2 ${isSelected ? theme.choiceTextSelected : theme.choiceTextNormal
                      }`
                      : `text-xs sm:text-sm font-semibold ${isSelected ? theme.choiceTextSelected : theme.choiceTextNormal
                      }`
                    }`}>
                    {choice}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className={`w-5 h-5 shrink-0 select-none ${checkIconColor}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer control panel for validation */}
        <div className={`pt-4 flex items-center justify-between z-10 relative border-t ${theme.footerBg.replace('border-t', '')}`}>
          {/* Previous / Backwards control */}
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`py-2.5 px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${theme.btnSecondary}`}
          >
            이전 문제
          </button>

          {/* Submission triggers */}
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className={`py-2.5 px-5 text-xs font-bold shadow transition-colors flex items-center gap-1 cursor-pointer ${theme.btnNextQuiz}`}
            >
              <span>다음 문제</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGradeQuiz}
              className={`py-3 px-6 text-sm font-bold shadow-md transition-all scale-100 hover:scale-[1.03] active:scale-[0.98] outline-none flex items-center gap-1.5 cursor-pointer ${theme.btnGradeQuiz}`}
            >
              <Award className={`w-4 h-4 ${isSamurai ? "text-amber-400" : isYokai ? "text-[#38bdf8]" : "text-yellow-300"}`} />
              <span>채점하기</span>
            </button>
          )}
        </div>

      </div>

      {/* 연상 암기 비법 힌트 모달 */}
      <AnimatePresence>
        {isHintOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsHintOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`relative w-full max-w-md p-6 overflow-hidden border z-10 text-left ${theme.hintModalBg}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3 border-slate-200/10">
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 opacity-70" />
                    <span>연상 암기 비법 힌트</span>
                  </h3>
                  <button 
                    onClick={() => setIsHintOpen(false)} 
                    className="p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {currentQuestion.kanjiItem && (
                    <div className="space-y-3.5">
                      {/* 가로형 요약 배너 (일관성 통일) */}
                      <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200/10">
                        <span className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-serif font-black shadow-inner shrink-0 ${theme.breakdownKanjiBox}`}>
                          {currentQuestion.kanjiItem.kanji}
                        </span>
                        <div>
                          <p className="text-sm font-bold">한자 암기 힌트</p>
                          <p className="text-xs text-slate-400 font-medium">자형 연상을 활용해 정답을 맞혀보세요.</p>
                        </div>
                      </div>
                      
                      {/* 힌트 상세 카드 (눈이 편안한 Soft Card로 디자인 통일) */}
                      <div className={`p-4.5 border rounded-2xl leading-relaxed text-xs sm:text-sm font-medium shadow-2xs ${theme.breakdownItemBg}`}>
                        <p className="font-sans">{currentQuestion.kanjiItem.mnemonic}</p>
                      </div>
                    </div>
                  )}

                  {currentQuestion.vocabItem && (
                    <div className="space-y-4">
                      {/* 가로형 요약 배너 (일관성 통일) */}
                      <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200/10">
                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-inner ${theme.radicalsBoxBg}`}>
                          <span className="text-[8px] font-bold tracking-wider opacity-60 font-mono leading-none">JLPT</span>
                          <span className="text-xs font-black mt-0.5">{currentQuestion.vocabItem.jlptLevel || "N4"}</span>
                        </div>
                        <div>
                          <p className="text-base font-bold">{currentQuestion.vocabItem.word}</p>
                          <p className="text-xs text-slate-400 font-medium">구성 한자 스토리를 조합하여 유추해 보세요.</p>
                        </div>
                      </div>

                      {currentQuestion.vocabItem.kanjiBreakdown && currentQuestion.vocabItem.kanjiBreakdown.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">구성 한자 암기 스토리</p>
                          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                            {currentQuestion.vocabItem.kanjiBreakdown.map((kb, kbIdx) => (
                              <div key={kbIdx} className={`p-3.5 rounded-2xl border flex gap-3 shadow-2xs ${theme.breakdownItemBg}`}>
                                <div className={`w-9 h-9 rounded-lg border text-base font-serif font-black flex items-center justify-center shrink-0 shadow-3xs ${theme.breakdownKanjiBox}`}>
                                  {kb.kanji}
                                </div>
                                <div className="space-y-0.5 flex-1">
                                  <p className="text-xs font-bold">
                                    {kb.meaning}
                                  </p>
                                  <p className="text-xs leading-relaxed font-sans font-medium opacity-85">
                                    {kb.mnemonic}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
