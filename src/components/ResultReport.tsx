import { motion } from "motion/react";
import { CheckCircle2, RefreshCw, BookOpen, XCircle, Sparkles } from "lucide-react";
import { Question } from "../types";
import { getTheme } from "../theme";

interface ResultReportProps {
  questions: Question[];
  userAnswers: { [questionId: number]: number };
  isLoading: boolean;
  startKanjiStudy: (isReview?: boolean) => void;
  startVocabStudy: (isReview?: boolean) => void;
  handleGoHome: () => void;
  handleReturnToBookmarks?: () => void;
  studyMode: 'kanji' | 'vocab' | 'bookmark-kanji' | 'bookmark-vocab';
  currentTheme?: string;
}

export function ResultReport({
  questions,
  userAnswers,
  isLoading,
  startKanjiStudy,
  startVocabStudy,
  handleGoHome,
  handleReturnToBookmarks,
  studyMode,
  currentTheme = "default"
}: ResultReportProps) {
  const theme = getTheme(currentTheme);

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
      <div className={`border rounded-3xl p-6 overflow-hidden text-center space-y-4 relative transition-colors duration-300 ${theme.cardContainer}`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400" />

        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center relative border ${theme.wordPanelBg} ${theme.tableBorder}`}>
          <div className={`text-2xl font-display font-extrabold font-mono whitespace-nowrap ${theme.breakdownKanjiMeaning}`}>
            {scoreData.correctCount} / {scoreData.totalCount}
          </div>
          <div className={`absolute -bottom-1 -right-1 rounded-full p-1 shadow ${scoreData.percentage >= 80 ? 'bg-emerald-500 text-white' : scoreData.percentage >= 40 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${theme.breakdownKanjiMeaning}`}>
            연상 암기 마스터 성적 {scoreData.percentage}점!
          </h3>
          <p className={`text-sm max-w-md mx-auto leading-relaxed transition-colors duration-300 ${theme.wordSubText}`}>
            {scoreData.percentage === 100
              ? "훌륭합니다! 머릿속에 연상 이미지가 완벽하게 각인되어 장기 기억으로 저장되었습니다."
              : "틀린 문제를 복습해 볼까요? 아래 연상 비법을 다시 읽어보면 기억의 연결고리가 더 단단해집니다."}
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          {studyMode.startsWith('bookmark') ? (
            <button
              onClick={handleReturnToBookmarks || handleGoHome}
              className={`py-2.5 px-5 text-xs font-bold rounded-xl transition-all shadow hover:shadow-md flex items-center gap-1.5 cursor-pointer ${theme.btnPrimary}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>나만의 단어장으로 돌아가기</span>
            </button>
          ) : (
            <>
              <button
                onClick={studyMode === 'vocab' ? startVocabStudy : startKanjiStudy}
                disabled={isLoading}
                className={`py-2.5 px-5 text-xs font-bold rounded-xl transition-all shadow hover:shadow-md flex items-center gap-1.5 cursor-pointer ${theme.btnPrimary}`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>{studyMode === 'vocab' ? "새로운 단어 코스 풀기" : "새로운 한자 코스 풀기"}</span>
              </button>
              <button
                onClick={handleGoHome}
                className={`py-2.5 px-5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${theme.btnSecondary}`}
              >
                메인 홈으로
              </button>
            </>
          )}
        </div>
      </div>

      {/* LIST OF GRADED QUESTIONS (with mnemonic explanations on failure) */}
      <div className="space-y-4">
        <h4 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-1.5 px-1 ${theme.wordSubText}`}>
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>테스트 결과 상세 오답 해설 리포트</span>
        </h4>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const selectedIdx = userAnswers[q.id];
            const isCorrect = selectedIdx === q.correctIndex;

            return (
              <div
                key={q.id}
                className={`border rounded-2xl overflow-hidden p-5 space-y-4 transition-all ${theme.cardContainer} ${isCorrect
                  ? "border-emerald-500/40 ring-1 ring-emerald-500/10"
                  : "border-rose-500/40 ring-1 ring-rose-500/10"
                  }`}
              >
                {/* Status label row */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${theme.wordSubText}`}>
                    문제 #{idx + 1}
                  </span>

                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-2 py-0.5 rounded font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      정답
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 px-2 py-0.5 rounded font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      오답
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  {q.type === 'blank_fill' ? (
                    <div className="space-y-1.5 w-full">
                      <p className={`text-xs font-bold tracking-wider ${theme.wordSubText}`}>제시된 예문</p>
                      <div className={`text-base font-semibold tracking-wide font-sans leading-relaxed py-2.5 rounded-xl px-4 select-all border ${theme.wordPanelBg} ${theme.tableBorder} ${theme.breakdownKanjiMeaning}`}>
                        {(() => {
                          const sentence = q.questionSentence || "";
                          const correctAnswer = q.choices[q.correctIndex] || "";
                          if (sentence.includes("__blank__")) {
                            const parts = sentence.split("__blank__");
                            return (
                              <>
                                {parts[0]}
                                <strong className="text-emerald-500 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
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
                                  <strong className="text-emerald-500 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
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
                                      <strong className="text-emerald-500 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
                                        {word}
                                      </strong>
                                      {charParts[1]}
                                    </>
                                  );
                              }
                            }
                            return <span className="font-bold text-emerald-500">{vocabSentence}</span>;
                          }
                          return <span className="font-bold text-emerald-500">{sentence}</span>;
                        })()}
                      </div>
                      {q.vocabItem && (
                        <p className={`text-xs italic ${theme.wordSubText}`}>* 해석: {q.vocabItem.exampleSentence.meaning}</p>
                      )}
                      <div className={`text-sm font-bold mt-2 ${theme.breakdownKanjiMeaning}`}>
                        Q. 빈칸에 들어갈 알맞은 단어는 무엇일까요?
                      </div>
                    </div>
                  ) : (
                    <div className={`text-base font-bold flex items-center gap-1.5 flex-wrap ${theme.breakdownKanjiMeaning}`}>
                      <span className={`text-xl font-serif font-bold px-2 py-0.5 rounded ${theme.radicalsBoxBg} ${theme.breakdownKanjiMeaning}`}>
                        {q.vocabItem ? q.vocabItem.word : q.kanjiItem?.kanji}
                      </span>
                      <span>{q.questionText}</span>
                    </div>
                  )}
                </div>

                {/* Selected result panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-3 rounded-xl space-y-0.5 border ${theme.wordPanelBg} ${theme.tableBorder}`}>
                    <span className={`font-medium block ${theme.wordSubText}`}>정답보기</span>
                    <span className={`font-semibold ${theme.breakdownKanjiMeaning}`}>
                      {q.choices[q.correctIndex]}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl space-y-0.5 border ${isCorrect
                    ? `${theme.wordPanelBg} ${theme.tableBorder}`
                    : "bg-rose-500/5 border-rose-500/20"
                    }`}>
                    <span className={`font-medium block ${theme.wordSubText}`}>내가 선택한 보기</span>
                    <span className={`font-semibold ${isCorrect ? theme.breakdownKanjiMeaning : "text-rose-500 font-bold"}`}>
                      {selectedIdx !== undefined
                        ? q.choices[selectedIdx]
                        : "선택하지 않음"}
                    </span>
                  </div>
                </div>

                {/* MANDATORY EXPLICIT REQUIREMENT: IF WRONG, SHOW STUDY STORY EXTENSIVELY */}
                {!isCorrect && (
                  <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-4.5 space-y-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>핵심 연상 비법: 기억을 더 단단하게 만드는 암기 공식</span>
                    </div>
                    {q.vocabItem ? (
                      <div className={`space-y-2.5 p-3 rounded-lg border ${theme.breakdownItemBg} ${theme.tableBorder}`}>
                        <p className={`font-bold ${theme.breakdownKanjiMeaning}`}>
                          단어: {q.vocabItem.word} ({q.vocabItem.hiragana}) - {q.vocabItem.meaning}
                        </p>
                        <div className={`space-y-2.5 pt-1.5 border-t ${theme.tableBorder}`}>
                          {q.vocabItem.kanjiBreakdown && q.vocabItem.kanjiBreakdown.map((kj, kjIdx) => (
                            <div key={kjIdx} className="space-y-0.5">
                              <span className="font-bold text-amber-500 text-[11px] block">
                                한자 [{kj.kanji}] - {kj.meaning}
                              </span>
                              <p className={`leading-relaxed font-sans ${theme.wordSubText}`}>
                                {kj.mnemonic}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : q.kanjiItem ? (
                      <p className={`leading-relaxed p-3 rounded-lg border ${theme.breakdownItemBg} ${theme.tableBorder} ${theme.wordSubText}`}>
                        한자 <strong className="text-sm font-serif text-amber-500 underline underline-offset-3 decoration-amber-500 font-extrabold">{q.kanjiItem.kanji}</strong>의 본래 명칭 : <strong className={`font-bold ${theme.breakdownKanjiMeaning}`}>{q.kanjiItem.meaning}</strong>
                        <br />
                        {q.kanjiItem.mnemonic}
                      </p>
                    ) : null}

                    {!q.vocabItem && q.kanjiItem && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-amber-500 pt-1.5 font-sans font-semibold">
                        <span>중요 음독: {q.kanjiItem.onyomi} ({q.kanjiItem.onyomiKorean})</span>
                        <span>•</span>
                        <span>중요 훈독: {q.kanjiItem.hunyomi?.replace(/\./g, "")} ({q.kanjiItem.hunyomiKorean})</span>
                      </div>
                    )}
                  </div>
                )}

                {isCorrect && (
                  <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl p-4.5 space-y-2 text-xs">
                    <div className="flex items-center gap-1 text-emerald-500 font-bold">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>핵심 연상 비법: 기억을 더 단단하게 만드는 암기 공식</span>
                    </div>
                    {q.vocabItem ? (
                      <div className={`space-y-2.5 p-3 rounded-lg border ${theme.breakdownItemBg} ${theme.tableBorder}`}>
                        <p className={`font-bold ${theme.breakdownKanjiMeaning}`}>
                          단어: {q.vocabItem.word} ({q.vocabItem.hiragana}) - {q.vocabItem.meaning}
                        </p>
                        <div className={`space-y-2.5 pt-1.5 border-t ${theme.tableBorder}`}>
                          {q.vocabItem.kanjiBreakdown && q.vocabItem.kanjiBreakdown.map((kj, kjIdx) => (
                            <div key={kjIdx} className="space-y-0.5">
                              <span className="font-bold text-emerald-500 text-[11px] block">
                                한자 [{kj.kanji}] - {kj.meaning}
                              </span>
                              <p className={`leading-relaxed font-sans ${theme.wordSubText}`}>
                                {kj.mnemonic}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : q.kanjiItem ? (
                      <p className={`leading-relaxed p-3 rounded-lg border ${theme.breakdownItemBg} ${theme.tableBorder} ${theme.wordSubText}`}>
                        한자 <strong className="text-sm font-serif text-emerald-500 underline underline-offset-3 decoration-emerald-500 font-extrabold">{q.kanjiItem.kanji}</strong>의 본래 명칭 : <strong className={`font-bold ${theme.breakdownKanjiMeaning}`}>{q.kanjiItem.meaning}</strong>
                        <br />
                        <span className={`mt-1 block ${theme.wordSubText}`}>
                          {q.kanjiItem.mnemonic}
                        </span>
                      </p>
                    ) : null}

                    {!q.vocabItem && q.kanjiItem && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-emerald-500 pt-1.5 font-sans font-semibold">
                        <span>중요 음독: {q.kanjiItem.onyomi} ({q.kanjiItem.onyomiKorean})</span>
                        <span>•</span>
                        <span>중요 훈독: {q.kanjiItem.hunyomi?.replace(/\./g, "")} ({q.kanjiItem.hunyomiKorean})</span>
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
