import { motion } from "motion/react";
import { CheckCircle2, RefreshCw, BookOpen, XCircle, Sparkles } from "lucide-react";
import { Question } from "../types";

interface ResultReportProps {
  questions: Question[];
  userAnswers: { [questionId: number]: number };
  isLoading: boolean;
  startKanjiStudy: (isReview?: boolean) => void;
  startVocabStudy: (isReview?: boolean) => void;
  handleGoHome: () => void;
  studyMode: 'kanji' | 'vocab';
}

export function ResultReport({
  questions,
  userAnswers,
  isLoading,
  startKanjiStudy,
  startVocabStudy,
  handleGoHome,
  studyMode
}: ResultReportProps) {

  // Calculate score values
  const getScoreData = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    return { correctCount, totalCount: questions.length, percentage };
  };

  const scoreData = getScoreData();

  return (
    <motion.div
      key="result-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 w-full"
    >
      {/* Score Assessment Header Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden text-center space-y-4 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400" />

        <div className="mx-auto w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center relative">
          <div className="text-3xl font-display font-extrabold text-slate-900 font-mono">
            {scoreData.correctCount} / {scoreData.totalCount}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-white shadow">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">
            테스트 결과: 임의 암기 격파 성적 {scoreData.percentage}점!
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {scoreData.percentage === 100
              ? "놀랍습니다! 연상 이미지가 머릿속에 완벽하게 기억되었습니다. 장기 기억으로 완벽 이관되었습니다."
              : "틀린 문제를 복습하면 연상 고리가 더욱 단단해집니다. 아래 연상법 해설을 다시 정독해 보세요."}
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={studyMode === 'vocab' ? startVocabStudy : startKanjiStudy}
            disabled={isLoading}
            className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow hover:shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{studyMode === 'vocab' ? "새로운 단어 코스 풀기" : "새로운 한자 코스 풀기"}</span>
          </button>

          <button
            onClick={handleGoHome}
            className="py-2.5 px-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            메인 홈으로
          </button>
        </div>
      </div>

      {/* LIST OF GRADED QUESTIONS (with mnemonic explanations on failure) */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>진단 테스트 상세 결과 및 오답 해설 리포트</span>
        </h4>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const selectedIdx = userAnswers[q.id];
            const isCorrect = selectedIdx === q.correctIndex;

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-2xl overflow-hidden p-5 space-y-4 transition-all ${isCorrect
                  ? "border-emerald-200/60 shadow-xs"
                  : "border-red-200 shadow-sm"
                  }`}
              >
                {/* Status label row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-400">
                    문제 #{idx + 1}
                  </span>

                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      정답
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 px-2 py-0.5 rounded font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      오답
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  {q.type === 'blank_fill' ? (
                    <div className="space-y-1.5 w-full">
                      <p className="text-xs font-bold text-slate-400 tracking-wider">제시된 예문</p>
                      <div className="text-base font-semibold text-slate-800 tracking-wide font-sans leading-relaxed py-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 select-all">
                        {(() => {
                          const sentence = q.questionSentence || "";
                          const correctAnswer = q.choices[q.correctIndex] || "";
                          if (sentence.includes("__blank__")) {
                            const parts = sentence.split("__blank__");
                            return (
                              <>
                                {parts[0]}
                                <strong className="text-emerald-600 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
                                  {correctAnswer}
                                </strong>
                                {parts[1]}
                              </>
                            );
                          }

                          // Fallback to vocab word splitting if __blank__ is not in questionSentence
                          const vocab = q.vocabItem;
                          if (vocab) {
                            const word = vocab.word;
                            const vocabSentence = vocab.exampleSentence.japanese;
                            const parts = vocabSentence.split(word);
                            if (parts.length > 1) {
                              return (
                                <>
                                  {parts[0]}
                                  <strong className="text-emerald-600 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
                                    {word}
                                  </strong>
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
                                    <strong className="text-emerald-600 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
                                      {word}
                                    </strong>
                                    {charParts[1]}
                                  </>
                                );
                              }
                            }
                            return <span className="font-bold text-emerald-800">{vocabSentence}</span>;
                          }
                          return <span className="font-bold text-emerald-800">{sentence}</span>;
                        })()}
                      </div>
                      {q.vocabItem && (
                        <p className="text-xs text-slate-500 italic">* 해석: {q.vocabItem.exampleSentence.meaning}</p>
                      )}
                      <div className="text-sm font-bold text-slate-900 mt-2">
                        Q. 빈칸에 들어갈 알맞은 단어는 무엇일까요?
                      </div>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span className="text-xl font-serif text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded">
                        {q.vocabItem ? q.vocabItem.word : q.kanjiItem?.kanji}
                      </span>
                      <span>{q.questionText}</span>
                    </div>
                  )}
                </div>

                {/* Selected result panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-0.5 border border-slate-100">
                    <span className="text-slate-400 font-medium block">정답보기</span>
                    <span className="font-semibold text-slate-800">
                      {q.choices[q.correctIndex]}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl space-y-0.5 border ${isCorrect
                    ? "bg-slate-50 border-slate-100"
                    : "bg-red-50/50 border-red-100"
                    }`}>
                    <span className="text-slate-400 font-medium block">내가 선택한 보기</span>
                    <span className={`font-semibold ${isCorrect ? "text-slate-800" : "text-red-700 font-bold"}`}>
                      {selectedIdx !== undefined
                        ? q.choices[selectedIdx]
                        : "선택하지 않음 (시간 초과)"}
                    </span>
                  </div>
                </div>

                {/* MANDATORY EXPLICIT REQUIREMENT: IF WRONG, SHOW STUDY STORY EXTENSIVELY */}
                {!isCorrect && (
                  <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl p-4.5 space-y-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-900 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>연상 기억 구원해설: 이렇게 연상해서 외우면 쉽습니다!</span>
                    </div>
                    {q.vocabItem ? (
                      <div className="space-y-2.5 bg-white/75 p-3 rounded-lg border border-amber-200/50">
                        <p className="text-slate-800 font-bold">
                          📌 단어: {q.vocabItem.word} ({q.vocabItem.hiragana}) - {q.vocabItem.meaning}
                        </p>
                        <div className="space-y-2.5 pt-1.5 border-t border-slate-200/50">
                          {q.vocabItem.kanjiBreakdown && q.vocabItem.kanjiBreakdown.map((kj, kjIdx) => (
                            <div key={kjIdx} className="space-y-0.5">
                              <span className="font-bold text-emerald-800 text-[11px] block">
                                한자 [{kj.kanji}] - {kj.meaning}
                              </span>
                              <p className="text-slate-600 leading-relaxed font-sans">
                                {kj.mnemonic}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : q.kanjiItem ? (
                      <p className="text-amber-950 font-medium leading-relaxed bg-white/75 p-3 rounded-lg border border-amber-200/50">
                        📌 한자 <strong className="text-sm font-serif text-amber-900 underline underline-offset-3 decoration-amber-500 font-extrabold">{q.kanjiItem.kanji}</strong>의 본래 명칭 : <strong className="text-slate-800 font-bold">{q.kanjiItem.meaning}</strong>
                        <br />
                        {q.kanjiItem.mnemonic}
                      </p>
                    ) : null}

                    {!q.vocabItem && q.kanjiItem && (
                      <div className="flex flex-wrap gap-2 text-[10px] text-amber-800 pt-1 font-mono font-medium">
                        <span>중요 음독: {q.kanjiItem.onyomi} ({q.kanjiItem.onyomiKorean})</span>
                        <span>•</span>
                        <span>중요 훈독: {q.kanjiItem.hunyomi} ({q.kanjiItem.hunyomiKorean})</span>
                      </div>
                    )}
                  </div>
                )}

                {isCorrect && (
                  <div className="bg-emerald-50/50 border-l-4 border-emerald-500 rounded-r-xl p-4.5 space-y-2 text-xs">
                    <div className="flex items-center gap-1 text-emerald-950 font-bold">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>연상 기억 비법: 정답을 맞춘 당신을 위한 암기 공식!</span>
                    </div>
                    {q.vocabItem ? (
                      <div className="space-y-2.5 bg-white/75 p-3 rounded-lg border border-emerald-200/50">
                        <p className="text-slate-800 font-bold">
                          📌 단어: {q.vocabItem.word} ({q.vocabItem.hiragana}) - {q.vocabItem.meaning}
                        </p>
                        <div className="space-y-2.5 pt-1.5 border-t border-slate-200/50">
                          {q.vocabItem.kanjiBreakdown && q.vocabItem.kanjiBreakdown.map((kj, kjIdx) => (
                            <div key={kjIdx} className="space-y-0.5">
                              <span className="font-bold text-emerald-850 text-[11px] block">
                                한자 [{kj.kanji}] - {kj.meaning}
                              </span>
                              <p className="text-slate-600 leading-relaxed font-sans">
                                {kj.mnemonic}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : q.kanjiItem ? (
                      <p className="text-slate-700 leading-relaxed bg-white/75 p-3 rounded-lg border border-emerald-200/50 font-sans">
                        📌 한자 <strong className="text-sm font-serif text-emerald-900 underline underline-offset-3 decoration-emerald-500 font-extrabold">{q.kanjiItem.kanji}</strong>의 본래 명칭 : <strong className="text-slate-800 font-bold">{q.kanjiItem.meaning}</strong>
                        <br />
                        <span className="text-slate-600 mt-1 block">
                          {q.kanjiItem.mnemonic}
                        </span>
                      </p>
                    ) : null}

                    {!q.vocabItem && q.kanjiItem && (
                      <div className="flex flex-wrap gap-2 text-[10px] text-emerald-800 pt-1 font-mono font-medium">
                        <span>중요 음독: {q.kanjiItem.onyomi} ({q.kanjiItem.onyomiKorean})</span>
                        <span>•</span>
                        <span>중요 훈독: {q.kanjiItem.hunyomi} ({q.kanjiItem.hunyomiKorean})</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
}
