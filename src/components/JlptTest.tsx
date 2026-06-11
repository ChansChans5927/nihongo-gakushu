import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Award,
  CheckCircle2,
  CornerDownRight,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  XCircle,
  Sparkles
} from "lucide-react";
import { JlptQuestion } from "../types";
import { getTheme } from "../theme";

interface JlptTestProps {
  selectedJlptLevel: string;
  jlptQuestions: JlptQuestion[];
  currentJlptIndex: number;
  jlptAnswers: { [questionId: string]: number };
  isJlptGraded: boolean;
  isJlptLoading: boolean;
  handleSelectJlptAnswer: (choiceIndex: number) => void;
  handlePrevJlptQuestion: () => void;
  handleNextJlptQuestion: () => void;
  handleGradeJlptQuiz: () => void;
  handleGoHomeJlpt: () => void;
  startJlptQuiz: () => void;
  currentTheme?: string;
}

export function JlptTest({
  selectedJlptLevel,
  jlptQuestions,
  currentJlptIndex,
  jlptAnswers,
  isJlptGraded,
  isJlptLoading,
  handleSelectJlptAnswer,
  handlePrevJlptQuestion,
  handleNextJlptQuestion,
  handleGradeJlptQuiz,
  handleGoHomeJlpt,
  startJlptQuiz,
  currentTheme = 'default'
}: JlptTestProps) {
  const [slashingChoice, setSlashingChoice] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const yokaiAudioRef = useRef<HTMLAudioElement | null>(null);
  const zenAudioRef = useRef<HTMLAudioElement | null>(null);

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
  }

  if (jlptQuestions.length === 0) return null;

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
    }
    handleSelectJlptAnswer(choiceIdx);
  };

  return (
    <motion.div
      key="jlpt-screen"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 w-full"
    >
      {!isJlptGraded ? (
        /* 1. JLPT QUESTION SOLVING CARD */
        <div className="space-y-5">
          <div className="space-y-2">
            <div className={`flex items-center justify-between text-xs font-semibold ${theme.headerTextColor}`}>
              <span className="flex items-center gap-1">
                <Award className={`w-4 h-4 ${theme.headerIconColorKanji}`} />
                <span>JLPT {selectedJlptLevel} 실전 기출 평가</span>
              </span>
              <span className="font-mono">
                진행률: {currentJlptIndex + 1} / {jlptQuestions.length} 문제 ({Math.round(((currentJlptIndex + 1) / jlptQuestions.length) * 100)}%)
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressTrackBgJlpt}`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${theme.progressBarBgJlpt}`}
                style={{ width: `${((currentJlptIndex + 1) / jlptQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div 
            className={`${theme.cardContainer} overflow-hidden p-4 sm:p-6 space-y-4 sm:space-y-6 relative ${isShaking && isSamurai ? "shake-effect" : ""}`}
          >
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

            <div className="flex items-center justify-between border-b border-slate-100/20 pb-3 relative z-10">
              <span className={theme.sealBadgeClassJlpt}>
                기출 문항 #{currentJlptIndex + 1}
              </span>
              <button
                onClick={handleGoHomeJlpt}
                className={`text-xs font-bold cursor-pointer hover:underline ${theme.abandonLinkColor}`}
              >
                시험 포기하고 홈으로
              </button>
            </div>

            {/* Question Content */}
            <div className="space-y-4 relative z-10">
              <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${theme.questionInstructionColor}`}>
                <CornerDownRight className={`w-3.5 h-3.5 ${theme.questionInstructionIcon}`} />
                다음 JLPT 지문을 읽고 물음에 답하십시오
              </h3>

              {/* Split sentence logic */}
              {(() => {
                const q = jlptQuestions[currentJlptIndex];
                const parts = q.questionSentence.split("__");
                return (
                  <div lang="ja" className={`text-lg sm:text-2xl font-semibold tracking-wide leading-relaxed text-center py-4 sm:py-6 px-3 border rounded-xl sm:rounded-2xl select-all ${theme.questionSentenceBox}`}>
                    {parts.map((p, idx) => idx % 2 === 1 ? (
                      p.toLowerCase() === "blank" ? (
                        <span key={idx} lang="ko" className={`inline-flex items-center border-2 border-dashed px-3 py-1 rounded-xl text-xs tracking-widest font-bold mx-1 animate-pulse select-none ${theme.blankFillBlock}`}>
                          ( 빈칸에 들어갈 말 )
                        </span>
                      ) : (
                        <span key={idx} className={`font-bold px-2 py-0.5 rounded-lg border shadow-xs mx-1 ${theme.highlightWordBlock}`}>
                          {p}
                        </span>
                      )
                    ) : p)}
                  </div>
                );
              })()}

              <div className="space-y-1">
                <p className={`text-base sm:text-lg font-bold ${theme.questionPromptText}`}>
                  Q. {jlptQuestions[currentJlptIndex].questionText.replace(/__/g, "")}
                </p>
                <p className={`text-xs ${theme.questionPromptSubText}`}>
                  * 제시된 한자어 혹은 밑줄 단어에 어울리는 최적의 독음, 표기, 또는 한국어 뜻을 보기에서 하나만 선택하십시오.
                </p>
              </div>
            </div>

            {/* Output Choice Buttons */}
            <div className="grid grid-cols-1 gap-3 relative z-10">
              {jlptQuestions[currentJlptIndex].choices.map((choice, choiceIdx) => {
                const isSelected = jlptAnswers[jlptQuestions[currentJlptIndex].id] === choiceIdx;
                const isSlashing = slashingChoice === choiceIdx;

                let baseStyles = theme.choiceBtnBase;
                let selectedStyles = theme.choiceBtnSelectedJlpt;
                let indexStyles = theme.choiceIdxBase;
                let selectedIndexStyles = theme.choiceIdxSelectedJlpt;
                let checkIconColor = theme.checkIconColorJlpt;
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
                      }
                      onSelect(choiceIdx);
                    }}
                    className={`w-full text-left p-3.5 sm:p-4.5 font-bold transition-all duration-200 flex items-center justify-between cursor-pointer relative overflow-hidden ${customClasses} ${isSelected ? selectedStyles : baseStyles} ${isSlashing ? "samurai-slash-effect scale-[0.98]" : ""}`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className={`w-7 h-7 flex items-center justify-center font-mono text-xs ${isSamurai ? "rounded-none" : "rounded-full"} ${isSelected ? selectedIndexStyles : indexStyles}`}>
                        {choiceIdx + 1}
                      </span>
                      <span lang="ja" className={`text-sm sm:text-base font-semibold ${isSelected ? theme.choiceTextSelectedJlpt : theme.choiceTextNormalJlpt}`}>
                        {choice}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className={`w-5 h-5 shrink-0 select-none relative z-10 ${checkIconColor}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Layout Footer Controls */}
            <div className={`pt-4 flex items-center justify-between relative z-10 border-t ${theme.footerBg.replace('border-t', '')}`}>
              <button
                onClick={handlePrevJlptQuestion}
                disabled={currentJlptIndex === 0}
                className={`py-2.5 px-4 disabled:opacity-35 text-xs font-semibold border transition-colors disabled:cursor-not-allowed cursor-pointer ${theme.btnSecondaryJlpt}`}
              >
                이전 문제
              </button>

              <div className="flex items-center gap-2">
                {currentJlptIndex < jlptQuestions.length - 1 ? (
                  <button
                    onClick={handleNextJlptQuestion}
                    className={`py-2.5 px-5 text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1 cursor-pointer ${theme.btnNextJlpt}`}
                  >
                    <span>다음 문제</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleGradeJlptQuiz}
                    className={`py-3 px-6 text-sm font-bold rounded-xl shadow-md transition-all scale-100 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer ${theme.btnGradeJlpt}`}
                  >
                    <Award className={`w-4 h-4 ${isSamurai ? "text-amber-200" : "text-white"}`} />
                    <span>시험 채점하기</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. JLPT TEST RESULTS & EXPLANATIONS CARD */
        <div className="space-y-6">
          {(() => {
            // Calculation score
            let correctCount = 0;
            jlptQuestions.forEach(q => {
              if (jlptAnswers[q.id] === q.correctIndex) {
                correctCount++;
              }
            });
            const ratio = Math.round((correctCount / jlptQuestions.length) * 100);

            return (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm text-center space-y-4 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500" />

                <div className="mx-auto w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center relative">
                  <div className="text-3xl font-display font-extrabold text-slate-900 font-mono">
                    {correctCount} / {jlptQuestions.length}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 text-slate-950 shadow">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900">
                    JLPT {selectedJlptLevel} 기출 실전 성적 : {ratio}점!
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    {ratio === 100
                      ? "경이롭습니다! 해당 레벨의 핵심 어휘 요건을 모두 갖추셨습니다. 다음 등급에 도전하십시오!"
                      : "해설을 통해 문제를 짚어보세요. JLPT 고빈도 단어는 독해와 청해의 필수 기초가 됩니다."}
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={startJlptQuiz}
                    disabled={isJlptLoading}
                    className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow hover:shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-45"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isJlptLoading ? "animate-spin" : ""}`} />
                    <span>한 번 더 응시하기</span>
                  </button>

                  <button
                    onClick={handleGoHomeJlpt}
                    className="py-2.5 px-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    기출 세트 목록으로
                  </button>
                </div>
              </div>
            );
          })()}

          {/* List of answers */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>기출전문가 심층 오답 및 구체적 문법해설 리포트</span>
            </h4>

            {jlptQuestions.map((q, idx) => {
              const ansIdx = jlptAnswers[q.id];
              const isCorrect = ansIdx === q.correctIndex;
              const parts = q.questionSentence.split("__");

              return (
                <div
                  key={q.id}
                  className={`bg-white border rounded-2xl overflow-hidden p-4 sm:p-5 space-y-4 transition-all ${isCorrect
                      ? "border-emerald-200/60 shadow-xs"
                      : "border-red-200 shadow-sm"
                    }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400">
                      기출문제 #{idx + 1}
                    </span>

                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        정답
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 px-2 py-0.5 rounded font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        정답 오선택
                      </span>
                    )}
                  </div>

                  {/* Sentence render */}
                  <div className="space-y-2">
                    <div lang="ja" className="text-lg font-semibold text-slate-850 text-slate-800 tracking-wide font-sans leading-relaxed py-3 bg-slate-50 border border-slate-100 rounded-xl px-4 select-all">
                      {parts.map((p, pIdx) => pIdx % 2 === 1 ? (
                        p.toLowerCase() === "blank" ? (
                          <strong key={pIdx} className="text-emerald-600 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
                            {q.targetWord}
                          </strong>
                        ) : (
                          <strong key={pIdx} className="text-amber-600 font-extrabold mx-0.5">
                            {p}
                          </strong>
                        )
                      ) : p)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium italic">
                      * 해석 : {q.translation}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-slate-800">
                      Q. {q.questionText.replace(/__/g, "")}
                    </h5>
                  </div>

                  {/* Selected answer view */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-0.5 border border-slate-100">
                      <span className="text-slate-400 font-medium block">정답보기</span>
                      <span lang="ja" className="font-bold text-emerald-800">
                        {q.choices[q.correctIndex]}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl space-y-0.5 border ${isCorrect
                        ? "bg-slate-50 border-slate-100"
                        : "bg-red-50/50 border-red-100"
                      }`}>
                      <span className="text-slate-400 font-medium block">내가 고른 답</span>
                      <span lang="ja" className={`font-semibold ${isCorrect ? "text-slate-800" : "text-red-700 font-bold"}`}>
                        {ansIdx !== undefined
                          ? q.choices[ansIdx]
                          : "응답 없음"}
                      </span>
                    </div>
                  </div>

                  {/* Comprehensive analysis explanation panel */}
                  <div className="bg-slate-50 border-l-4 border-amber-500 rounded-r-xl p-3 sm:p-4 space-y-2 text-xs leading-relaxed">
                    <div className="flex items-center gap-1 text-slate-900 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>기출 분석 핵심 해설</span>
                    </div>
                    <p className="text-slate-700 font-medium bg-white p-3 rounded-lg border border-slate-200">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
