import { motion } from "motion/react";
import { HelpCircle, CheckCircle2, ArrowRight, Award } from "lucide-react";
import { Question } from "../types";

interface QuizTestProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [questionId: number]: number };
  isGraded: boolean;
  handleSelectAnswer: (choiceIndex: number) => void;
  handlePrevQuestion: () => void;
  handleNextQuestion: () => void;
  handleGradeQuiz: () => void;
}

export function QuizTest({
  questions,
  currentQuestionIndex,
  userAnswers,
  isGraded,
  handleSelectAnswer,
  handlePrevQuestion,
  handleNextQuestion,
  handleGradeQuiz
}: QuizTestProps) {
  const currentQuestion = questions[currentQuestionIndex];

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
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-5 sm:p-6 space-y-6">

        {/* Visual badge */}
        <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold uppercase rounded-md tracking-wider">
          Question 0{currentQuestion.id}
        </span>

        {/* Question description */}
        <div className="space-y-1 mt-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {currentQuestion.type === 'blank_fill'
              ? "제시된 일본어 예문의 빈칸에 들어갈 알맞은 단어는 무엇일까요?"
              : currentQuestion.questionText}
          </h3>
          <p className="text-xs text-slate-400">
            {currentQuestion.type === 'blank_fill'
              ? "* 예문의 맥락과 뜻을 파악하고 알맞은 일본어 표기의 단어를 보기에서 선택해 보세요."
              : "* 위 내용을 꼼꼼하게 기억해 보고, 4개의 보기 중 하나를 마우스로 정성스럽게 선택하여 발음을 체득해 보세요."}
          </p>
        </div>

        {/* Big Display character for visual hints */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl py-4 sm:py-8 flex flex-col items-center justify-center space-y-3 px-4">
          {currentQuestion.type === 'blank_fill' ? (
            <div className="w-full text-center space-y-3">
              <div className="text-lg sm:text-2xl font-semibold text-slate-800 tracking-wide font-sans leading-relaxed">
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
                  return <span className="text-slate-800 font-bold leading-normal">{sentence}</span>;
                })()}
              </div>
              {currentQuestion.vocabItem && (
                <p className="text-xs text-slate-500 italic">
                  해석: {currentQuestion.vocabItem.exampleSentence.meaning}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="text-4xl sm:text-5xl font-serif font-extrabold text-slate-800 select-none text-center">
                {currentQuestion.type === 'kanji_match' ? (
                  <span className="text-amber-500 font-sans tracking-widest animate-pulse">?</span>
                ) : (
                  currentQuestion.vocabItem ? currentQuestion.vocabItem.word : currentQuestion.kanjiItem?.kanji
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono text-center">
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
            return (
              <button
                key={choiceIdx}
                onClick={() => handleSelectAnswer(choiceIdx)}
                className={`w-full text-left rounded-xl border font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${isKanjiMatch ? "py-3.5 px-4 sm:py-5 sm:px-6" : "p-3 sm:p-4 text-sm"
                  } ${isSelected
                    ? "bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/20 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs ${isSelected ? "bg-blue-500 text-white font-bold" : "bg-slate-100 text-slate-500"
                    }`}>
                    {choiceIdx + 1}
                  </span>
                  <span className={`leading-none ${isKanjiMatch
                    ? "text-xl sm:text-2xl font-serif font-extrabold text-slate-900 tracking-normal pl-2"
                    : "text-sm sm:text-base font-semibold"
                    }`}>
                    {choice}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 select-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer control panel for validation */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          {/* Previous / Backwards control */}
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-35 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            이전 문제
          </button>

          {/* Submission triggers */}
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>다음 문제</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGradeQuiz}
              className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all scale-100 hover:scale-[1.03] active:scale-[0.98] outline-none flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-yellow-300" />
              <span>채점하기</span>
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
}
