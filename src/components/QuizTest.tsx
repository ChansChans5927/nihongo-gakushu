import { useState, useRef } from "react";
import { motion } from "motion/react";
import { HelpCircle, CheckCircle2, ArrowRight, Award } from "lucide-react";
import { Question } from "../types";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio once
  if (!audioRef.current && typeof window !== 'undefined') {
    audioRef.current = new Audio("/sounds/slash.mp3");
    audioRef.current.volume = 0.6;
  }

  const isSamurai = currentTheme === 'samurai';

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
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span>진단 객관식 테스트</span>
          </span>
          <span className="font-mono">
            진행률: {currentQuestionIndex + 1} / {questions.length} 문제 ({Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz Card View Component */}
      <div 
        className={isSamurai
          ? `bg-[#f4e8d1] border-y-[12px] border-y-[#3e2723] border-x-2 border-x-amber-900/30 rounded-md shadow-[inset_0_0_50px_rgba(139,69,19,0.15),0_10px_20px_rgba(0,0,0,0.1)] overflow-hidden p-5 sm:p-6 space-y-6 relative font-serif text-amber-950 ${isShaking ? "shake-effect" : ""}`
          : "bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-5 sm:p-6 space-y-6 relative"
        }
      >
        {isSamurai && <div className="samurai-embers"></div>}
        {/* Visual badge - Hanko style */}
        <span className={isSamurai 
          ? "inline-block px-3 py-1 bg-transparent text-red-800 border-2 border-red-800 text-[11px] font-bold uppercase tracking-widest rounded-sm transform -rotate-2 opacity-90 select-none"
          : "px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold uppercase rounded-md tracking-wider"
        }>
          Question 0{currentQuestion.id}
        </span>

        {/* Question description */}
        <div className="space-y-1 mt-1">
          <h3 className={`text-lg sm:text-xl font-bold ${isSamurai ? "text-amber-950" : "text-slate-900"}`}>
            {currentQuestion.type === 'blank_fill'
              ? "제시된 일본어 예문의 빈칸에 들어갈 알맞은 단어는 무엇일까요?"
              : currentQuestion.questionText}
          </h3>
          <p className={`text-xs ${isSamurai ? "text-amber-900/70" : "text-slate-400"}`}>
            {currentQuestion.type === 'blank_fill'
              ? "* 예문의 맥락과 뜻을 파악하고 알맞은 일본어 표기의 단어를 보기에서 선택해 보세요."
              : "* 위 내용을 꼼꼼하게 기억해 보고, 4개의 보기 중 하나를 마우스로 정성스럽게 선택하여 발음을 체득해 보세요."}
          </p>
        </div>

        {/* Big Display character for visual hints */}
        <div className={isSamurai
          ? "bg-[rgba(255,255,255,0.2)] border-y border-y-amber-900/20 py-6 sm:py-10 flex flex-col items-center justify-center space-y-3 px-4 shadow-inner"
          : "bg-slate-50 border border-slate-100 rounded-2xl py-4 sm:py-8 flex flex-col items-center justify-center space-y-3 px-4"
        }>
          {currentQuestion.type === 'blank_fill' ? (
            <div className="w-full text-center space-y-3">
              <div className={`text-lg sm:text-2xl font-semibold tracking-wide leading-relaxed ${isSamurai ? "text-amber-950 font-serif" : "text-slate-800 font-sans"}`}>
                {(() => {
                  const sentence = currentQuestion.questionSentence || "";
                  if (sentence.includes("__blank__")) {
                    const parts = sentence.split("__blank__");
                    return (
                      <>
                        {parts[0]}
                        <span className="inline-flex items-center bg-emerald-50 border-2 border-dashed border-emerald-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-800 mx-1 select-none animate-pulse">
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
                          <span className="inline-flex items-center bg-emerald-50 border-2 border-dashed border-emerald-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-800 mx-1 select-none animate-pulse">
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
                            <span className="inline-flex items-center bg-emerald-50 border-2 border-dashed border-emerald-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-800 mx-1 select-none animate-pulse">
                              빈칸
                            </span>
                            {charParts[1]}
                          </>
                        );
                      }
                    }
                    return <span className="text-slate-800 font-bold leading-normal">{vocabSentence}</span>;
                  }
                  return <span className={isSamurai ? "font-bold text-amber-950" : "text-slate-800 font-bold leading-normal"}>{sentence}</span>;
                })()}
              </div>
            </div>
          ) : (
            <>
              <div className={`text-4xl sm:text-5xl font-extrabold select-none text-center ${isSamurai ? "font-serif text-amber-950 drop-shadow-sm" : "font-serif text-slate-800"}`}>
                {currentQuestion.type === 'kanji_match' ? (
                  <span className={`font-sans tracking-widest animate-pulse ${isSamurai ? "text-red-800" : "text-amber-500"}`}>?</span>
                ) : (
                  currentQuestion.vocabItem ? currentQuestion.vocabItem.word : currentQuestion.kanjiItem?.kanji
                )}
              </div>
              <span className={`text-xs font-mono text-center ${isSamurai ? "text-amber-900/60" : "text-slate-400"}`}>
                {currentQuestion.type === 'kanji_match'
                  ? "알맞은 표기를 아래 보기에서 선택하세요"
                  : "연상 학습했던 주요 내용"}
              </span>
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
            let baseStyles = "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs";
            let selectedStyles = "bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/20 shadow-sm";
            let indexStyles = "bg-slate-100 text-slate-500";
            let selectedIndexStyles = "bg-blue-500 text-white font-bold";
            let checkIconColor = "text-blue-500";

            if (isSamurai) {
              baseStyles = "bg-transparent border-amber-900/40 hover:border-amber-950 text-amber-950 hover:bg-amber-900/5 transition-colors rounded-none";
              selectedStyles = "bg-amber-900/10 border-amber-950 text-amber-950 font-serif rounded-none ring-1 ring-amber-950";
              indexStyles = "bg-transparent text-amber-950 border border-amber-900/50 rounded-none font-bold";
              selectedIndexStyles = "bg-red-800 text-amber-50 font-bold rounded-sm border-2 border-red-900 transform -rotate-3"; // Hanko stamp style
              checkIconColor = "text-red-800";
            }

            return (
              <button
                key={choiceIdx}
                onClick={() => onSelect(choiceIdx)}
                className={`w-full text-left font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isKanjiMatch ? "py-3.5 px-4 sm:py-5 sm:px-6" : "p-3 sm:p-4 text-sm"
                } ${isSelected ? selectedStyles : baseStyles} ${
                  isSamurai ? "border-2 rounded-none sword-glint" : "rounded-xl border"
                } ${isSlashing ? "samurai-slash-effect scale-[0.98]" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 flex items-center justify-center font-mono text-xs ${
                    isSelected ? selectedIndexStyles : indexStyles
                  } ${!isSamurai && "rounded-full"}`}>
                    {choiceIdx + 1}
                  </span>
                  <span className={`leading-none ${
                    isKanjiMatch
                      ? `text-xl sm:text-2xl font-serif font-extrabold tracking-normal pl-2 ${isSelected && isSamurai ? "text-amber-950" : "text-slate-900"}`
                      : `text-sm sm:text-base font-semibold ${isSamurai && "font-serif"}`
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
        <div className={`pt-4 flex items-center justify-between ${isSamurai ? "border-t border-amber-900/20" : "border-t border-slate-100"}`}>
          {/* Previous / Backwards control */}
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`py-2.5 px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${
              isSamurai 
                ? "bg-transparent hover:bg-amber-900/10 text-amber-950 border border-amber-900/30 rounded-none" 
                : "bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
            }`}
          >
            이전 문제
          </button>

          {/* Submission triggers */}
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className={`py-2.5 px-5 text-xs font-bold shadow transition-colors flex items-center gap-1 cursor-pointer ${
                isSamurai 
                  ? "bg-[#3e2723] hover:bg-[#2d1b18] text-[#f4e8d1] rounded-none border border-amber-900/50" 
                  : "bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
              }`}
            >
              <span>다음 문제</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGradeQuiz}
              className={`py-3 px-6 text-sm font-bold shadow-md transition-all scale-100 hover:scale-[1.03] active:scale-[0.98] outline-none flex items-center gap-1.5 cursor-pointer ${
                isSamurai 
                  ? "bg-gradient-to-r from-red-800 to-red-950 hover:from-red-900 hover:to-black text-amber-50 rounded-none border-2 border-red-950" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
              }`}
            >
              <Award className={`w-4 h-4 ${isSamurai ? "text-amber-400" : "text-yellow-300"}`} />
              <span>채점하기</span>
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
}
