import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Volume2, BookOpen, HelpCircle, CheckCircle, XCircle, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { NewsLesson, SubtitleLine, VocabItem, Question } from "../types";

// YouTube Iframe Player API 타입 임시 선언
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface NewsStudyProps {
  lesson: NewsLesson;
  handleGoHome: () => void;
}

export function NewsStudy({ lesson, handleGoHome }: NewsStudyProps) {
  const [activeTab, setActiveTab] = useState<"subtitles" | "vocab" | "quiz">("subtitles");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playerState, setPlayerState] = useState<number>(-1); // -1: 미시작, 1: 재생중, 2: 일시정지
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number>(0);

  // 단어장 학습 상태
  const [vocabIndex, setVocabIndex] = useState<number>(0);
  const [speechActive, setSpeechActive] = useState<string | null>(null);

  // 퀴즈 풀이 상태
  const [quizAnswers, setQuizAnswers] = useState<{ [id: number]: number }>({});
  const [quizGraded, setQuizGraded] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const playerRef = useRef<any>(null);
  const subtitleContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // 1. YouTube Player API 초기화
  useEffect(() => {
    // API Script 동적 로드
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying previous player:", e);
        }
      }

      playerRef.current = new window.YT.Player("news-youtube-player", {
        videoId: lesson.id,
        playerVars: {
          playsinline: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: (event: any) => {
            setPlayerState(event.data);
            if (event.data === 1) {
              startTrackingTime();
            } else {
              stopTrackingTime();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTrackingTime();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [lesson.id]);

  // 2. 재생 시간 추적 타이머
  const startTrackingTime = () => {
    stopTrackingTime();
    timerRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        // 현재 시간에 해당하는 자막 인덱스 검색 (재생바 오차 및 이전/다음 자막 자연스러운 전환 처리)
        let foundIdx = -1;
        for (let i = 0; i < lesson.subtitles.length; i++) {
          const sub = lesson.subtitles[i];
          const nextSub = lesson.subtitles[i + 1];
          const isAfterStart = time >= sub.start - 0.2;
          const isBeforeNext = nextSub ? time < nextSub.start : true;
          const isWithinDuration = time < sub.start + sub.duration + 2.0;
          
          if (isAfterStart && isBeforeNext && isWithinDuration) {
            foundIdx = i;
            break;
          }
        }
        
        if (foundIdx !== -1 && foundIdx !== activeSubtitleIndex) {
          setActiveSubtitleIndex(foundIdx);
        }
      }
    }, 200);
  };

  const stopTrackingTime = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 3. 자막이 활성화될 때 자동으로 스크롤
  useEffect(() => {
    if (subtitleContainerRef.current) {
      const activeEl = subtitleContainerRef.current.querySelector(`[data-index="${activeSubtitleIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    }
  }, [activeSubtitleIndex]);

  // 4. 자막 클릭 시 해당 시간으로 이동
  const handleSubtitleClick = (start: number, idx: number) => {
    setActiveSubtitleIndex(idx);
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(start + 0.1, true); // 키프레임 오차 방지를 위해 0.1초 약간 뒤로 이동
      playerRef.current.playVideo();
    }
  };

  // 단어 하이라이트 텍스트 렌더링 헬퍼
  const renderHighlightedSentence = (text: string, fallbackWord: string) => {
    if (!text) return null;
    // 1. AI가 __단어__ 로 감싸주었을 경우
    if (text.includes('__')) {
      const parts = text.split('__');
      return (
        <>
          {parts.map((part, idx) => {
            if (idx % 2 === 1) {
              return (
                <strong key={idx} className="text-rose-600 font-bold bg-rose-50 px-1 py-0.5 rounded mx-0.5 border border-rose-100">
                  {part}
                </strong>
              );
            }
            return <React.Fragment key={idx}>{part}</React.Fragment>;
          })}
        </>
      );
    }
    // 2. 감싸주지 않았다면 원시적으로 fallbackWord를 기반으로 분리 시도
    if (!fallbackWord) return <>{text}</>;
    const parts = text.split(fallbackWord);
    if (parts.length === 1) return <>{text}</>;
    return (
      <>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            {part}
            {idx < parts.length - 1 && (
              <strong className="text-rose-600 font-bold bg-rose-50 px-1 py-0.5 rounded mx-0.5 border border-rose-100">
                {fallbackWord}
              </strong>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  // TTS 재생 프록시
  const handleTTS = async (text: string) => {
    setSpeechActive(text);
    try {
      const audio = new Audio(`/api/tts?q=${encodeURIComponent(text)}&lang=ja`);
      await audio.play();
    } catch (err) {
      console.error("TTS playback failed", err);
    } finally {
      setTimeout(() => setSpeechActive(null), 1500);
    }
  };

  // 퀴즈 정답 제출 처리
  const handleSelectQuizAnswer = (quizId: number, choiceIndex: number) => {
    if (quizGraded) return;
    setQuizAnswers((prev) => ({ ...prev, [quizId]: choiceIndex }));
  };

  const handleGradeQuiz = () => {
    if (quizGraded) return;
    let score = 0;
    lesson.quizzes.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizGraded(true);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizGraded(false);
    setQuizScore(0);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* 뉴스 상단 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
            NEWS STUDY
          </span>
          <h2 className="text-base sm:text-xl font-bold text-slate-800 mt-2 font-display">
            {lesson.title}
          </h2>
        </div>
        <button
          onClick={handleGoHome}
          className="shrink-0 whitespace-nowrap flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-2xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          대시보드로
        </button>
      </div>

      {/* 동영상 플레이어 영역 */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="relative aspect-video bg-black">
          <div id="news-youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${playerState === 1 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
            <span>{playerState === 1 ? "뉴스 시청 중" : playerState === 2 ? "일시정지됨" : "준비 완료"}</span>
          </div>
          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-rose-500 font-medium transition-colors"
          >
            YouTube에서 보기 <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 하단 학습 탭 영역 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("subtitles")}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "subtitles"
                ? "border-rose-500 text-rose-600 bg-rose-50/10"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            자막 전체 보기
          </button>
          <button
            onClick={() => setActiveTab("vocab")}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "vocab"
                ? "border-rose-500 text-rose-600 bg-rose-50/10"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            중요 단어 카드 ({lesson.vocabItems.length})
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "quiz"
                ? "border-rose-500 text-rose-600 bg-rose-50/10"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            뉴스 퀴즈 풀기
          </button>
        </div>

        {/* 탭 콘텐츠 바디 */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* 탭 1: 자막 전체 보기 */}
            {activeTab === "subtitles" && (
              <motion.div
                key="tab-subtitles"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">📰 뉴스 요약 및 스크립트</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    위 유튜브 동영상을 시청하면서 자막 리스트를 누르시면 원하는 구간으로 정확히 이동해 반복 청취할 수 있습니다. 
                    하단의 중요 단어 탭과 퀴즈 탭으로 넘어가기 전, 뉴스의 내용을 여러 번 듣고 발음을 파악해 보세요.
                  </p>
                </div>
                <div ref={subtitleContainerRef} className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto scrollbar-thin scroll-smooth">
                  {lesson.subtitles.map((sub, idx) => {
                    const isActive = idx === activeSubtitleIndex;
                    return (
                      <div
                        key={idx}
                        data-index={idx}
                        onClick={() => handleSubtitleClick(sub.start, idx)}
                        className={`p-4 transition-all cursor-pointer flex flex-col gap-1 text-left ${
                          isActive
                            ? "bg-rose-50/60"
                            : "hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 bg-slate-100'}`}>
                            {Math.floor(sub.start / 60)}:{Math.floor(sub.start % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                        {/* 원문 (일본어) */}
                        <p className={`text-sm font-bold mt-1.5 leading-relaxed ${isActive ? "text-rose-600" : "text-slate-800"}`}>
                          {(sub.japanese || "").split(" / ").map((chunk, ci, arr) => (
                            <React.Fragment key={ci}>
                              {chunk}{ci < arr.length - 1 && <span className="text-slate-300 mx-1">/</span>}
                            </React.Fragment>
                          ))}
                        </p>
                        {/* 한국어 발음 */}
                        <p className="text-xs text-rose-400 font-mono mt-1 leading-relaxed">
                          {((sub.pronunciation || sub.hiragana || "")).split(" / ").map((chunk, ci, arr) => (
                            <React.Fragment key={ci}>
                              {chunk}{ci < arr.length - 1 && <span className="text-slate-200 mx-1">/</span>}
                            </React.Fragment>
                          ))}
                        </p>
                        {/* 한국어 번역 */}
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {(sub.korean || "").split(" / ").map((chunk, ci, arr) => (
                            <React.Fragment key={ci}>
                              {chunk}{ci < arr.length - 1 && <span className="text-slate-300 mx-1">/</span>}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 탭 2: 중요 단어 카드 */}
            {activeTab === "vocab" && lesson.vocabItems.length > 0 && (
              <motion.div
                key="tab-vocab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center"
              >
                {/* 단어 플래시 카드 */}
                <div className="w-full max-w-lg bg-gradient-to-tr from-amber-50/50 to-orange-50/30 border border-orange-200/60 p-6 rounded-3xl shadow-sm text-center space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 border border-orange-200/50 px-3 py-1 rounded-full">
                      {lesson.vocabItems[vocabIndex].jlptLevel || "N1~N3"}
                    </span>
                    <button
                      onClick={() => handleTTS(lesson.vocabItems[vocabIndex].word)}
                      className={`p-2 rounded-full border shadow-sm transition-all cursor-pointer ${
                        speechActive === lesson.vocabItems[vocabIndex].word
                          ? "bg-rose-500 border-rose-500 text-white animate-pulse"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      title="단어 발음 듣기"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                      {lesson.vocabItems[vocabIndex].word}
                    </h3>
                    <p className="text-sm font-mono text-slate-500 mt-1">
                      {lesson.vocabItems[vocabIndex].pronunciation}
                    </p>
                    <p className="text-lg font-bold text-slate-800 mt-2 bg-white/80 border border-slate-200/60 py-1.5 px-4 rounded-full inline-block">
                      {lesson.vocabItems[vocabIndex].meaning}
                    </p>
                  </div>

                  {/* 한자 부수 및 연상 스토리 분해 */}
                  <div className="text-left bg-white p-4 rounded-2xl border border-slate-200/60 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1">🧩 한자 연상 기억 스토리</h4>
                    {lesson.vocabItems[vocabIndex].kanjiBreakdown.map((kb, kIdx) => (
                      <div key={kIdx} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-rose-500 font-mono text-sm bg-rose-50 border border-rose-100 w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                            {kb.kanji}
                          </strong>
                          <span className="font-semibold text-slate-800">({kb.meaning})</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed pl-6">
                          {kb.mnemonic}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* 예문 정보 */}
                  <div className="text-left bg-rose-50/20 p-4 rounded-2xl border border-rose-100/50 space-y-1">
                    <h4 className="text-xs font-bold text-rose-600 mb-1">💬 뉴스 문맥 예문</h4>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed mb-1">
                      {renderHighlightedSentence(lesson.vocabItems[vocabIndex].exampleSentence.japanese, lesson.vocabItems[vocabIndex].word)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {lesson.vocabItems[vocabIndex].exampleSentence.pronunciation}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {lesson.vocabItems[vocabIndex].exampleSentence.meaning}
                    </p>
                  </div>
                </div>

                {/* 카드 내비게이션 */}
                <div className="flex items-center gap-6 mt-6">
                  <button
                    onClick={() => setVocabIndex((prev) => Math.max(0, prev - 1))}
                    disabled={vocabIndex === 0}
                    className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {vocabIndex + 1} / {lesson.vocabItems.length}
                  </span>
                  <button
                    onClick={() => setVocabIndex((prev) => Math.min(lesson.vocabItems.length - 1, prev + 1))}
                    disabled={vocabIndex === lesson.vocabItems.length - 1}
                    className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 탭 3: 뉴스 퀴즈 풀기 */}
            {activeTab === "quiz" && lesson.quizzes.length > 0 && (
              <motion.div
                key="tab-quiz"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                {/* 퀴즈 안내 가이드 */}
                {!quizGraded && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
                    <span>💡 방금 학습한 중요 단어들과 뉴스 속 예문을 검증하는 사지선다 객관식 퀴즈입니다.</span>
                    <span className="font-bold text-rose-500">총 {lesson.quizzes.length}문제</span>
                  </div>
                )}

                {/* 퀴즈 채점 결과 요약 */}
                {quizGraded && (
                  <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-6 rounded-3xl text-white text-center space-y-2 shadow-sm">
                    <h3 className="text-xl font-bold">🎉 퀴즈 풀이 결과</h3>
                    <p className="text-2xl font-black">
                      {quizScore} / {lesson.quizzes.length} 문제 맞춤!
                    </p>
                    <p className="text-xs text-emerald-100">
                      틀린 오답 카드는 아래 해설을 통해 다시 한 번 확인해 보세요.
                    </p>
                    <button
                      onClick={handleResetQuiz}
                      className="mt-3 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
                    >
                      다시 풀기
                    </button>
                  </div>
                )}

                {/* 퀴즈 문제 목록 */}
                <div className="space-y-6">
                  {lesson.quizzes.map((q, qIdx) => {
                    const selectedIdx = quizAnswers[q.id];
                    const isCorrect = selectedIdx === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          quizGraded
                            ? isCorrect
                              ? "bg-emerald-50/30 border-emerald-200"
                              : "bg-red-50/30 border-red-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {/* 문제 번호 및 타입 */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Q {qIdx + 1}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            q.type === 'meaning' 
                              ? 'text-blue-600 bg-blue-50' 
                              : 'text-purple-600 bg-purple-50'
                          }`}>
                            {q.type === 'meaning' ? '뜻' : '발음'}
                          </span>
                        </div>

                        {/* 타깃 단어 표시 */}
                        {q.targetWord && (
                          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/50 mb-3 text-center">
                            <span className="text-xl font-black text-slate-900">{q.targetWord}</span>
                          </div>
                        )}

                        {/* 문제 텍스트 */}
                        <p className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">
                          {q.questionText}
                        </p>

                        {/* 사지선다 보기 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.choices.map((choice, cIdx) => {
                            const isChoiceSelected = selectedIdx === cIdx;
                            const isCurrentCorrect = cIdx === q.correctIndex;

                            let btnStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white";
                            let iconEl = null;

                            if (isChoiceSelected) {
                              btnStyle = "border-rose-500 bg-rose-50/50 text-rose-700 font-semibold";
                            }

                            if (quizGraded) {
                              if (isCurrentCorrect) {
                                btnStyle = "border-emerald-500 bg-emerald-500 text-white font-bold";
                                iconEl = <CheckCircle className="w-4 h-4 shrink-0" />;
                              } else if (isChoiceSelected && !isCorrect) {
                                btnStyle = "border-red-500 bg-red-500 text-white font-bold";
                                iconEl = <XCircle className="w-4 h-4 shrink-0" />;
                              } else {
                                btnStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={cIdx}
                                onClick={() => handleSelectQuizAnswer(q.id, cIdx)}
                                disabled={quizGraded}
                                className={`p-3 text-xs text-left rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                              >
                                <span>{choice}</span>
                                {iconEl}
                              </button>
                            );
                          })}
                        </div>

                        {/* 퀴즈 개별 오답 해설 */}
                        {quizGraded && q.explanation && (
                          <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${isCorrect ? "bg-emerald-50/50 text-emerald-800" : "bg-red-50/50 text-red-800"}`}>
                            <strong>💡 정답 해설:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 제출 버튼 */}
                {!quizGraded && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleGradeQuiz}
                      disabled={Object.keys(quizAnswers).length < lesson.quizzes.length}
                      className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-sm font-bold py-3 px-8 rounded-2xl shadow-md transition-all cursor-pointer border-none"
                    >
                      채점 완료
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
