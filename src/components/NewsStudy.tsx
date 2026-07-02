import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NewsLesson } from "../types";

// 분리한 하위 컴포넌트 임포트
import { NewsHeader } from "./news/NewsHeader";
import { NewsVideoPlayer } from "./news/NewsVideoPlayer";
import { NewsTabHeader } from "./news/NewsTabHeader";
import { NewsSubtitlesTab } from "./news/NewsSubtitlesTab";
import { NewsVocabTab } from "./news/NewsVocabTab";
import { NewsQuizTab } from "./news/NewsQuizTab";

// YouTube Iframe Player API 타입 임시 선언
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

// NewsStudyProps 인터페이스 정의
interface NewsStudyProps {
  lesson: NewsLesson;            // 뉴스 정보 객체
  handleGoHome: () => void;      // 홈 대시보드 복귀 함수
  username?: string;             // 현재 로그인 계정명
}

// 메인 뉴스 학습 화면 컴포넌트 (조립식 구조)
export function NewsStudy({ lesson, handleGoHome, username }: NewsStudyProps) {
  // 현재 서브 화면 탭 상태
  const [activeTab, setActiveTab] = useState<"subtitles" | "vocab" | "quiz">("subtitles");


  const [playerState, setPlayerState] = useState<number>(-1); // -1: 미시작, 1: 재생중, 2: 일시정지 등
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number>(0);

  // 중요 어휘 학습 플래시카드 현재 번호
  const [vocabIndex, setVocabIndex] = useState<number>(0);
  const [speechActive, setSpeechActive] = useState<string | null>(null);

  // 퀴즈 문제 풀이 저장 상태
  const [quizAnswers, setQuizAnswers] = useState<{ [id: number]: number }>({});
  const [quizGraded, setQuizGraded] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const playerRef = useRef<any>(null);
  const subtitleContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // 1. YouTube Player API 스크립트 동적 주입 및 플레이어 초기화
  useEffect(() => {
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
        } catch (e) { }
      }
    };
  }, [lesson.id]);

  // 2. 동영상 재생 시간 모니터링 타이머 가동
  const startTrackingTime = () => {
    stopTrackingTime();
    timerRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        const time = playerRef.current.getCurrentTime();

        // 실시간 재생 시간에 해당하는 자막 인덱스 계산
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

  // 3. 실시간 하이라이트 자막 노출 시 스크롤 자동 동기화 효과
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

  // 4. 자막의 특정 줄 클릭 시 비디오 재생 시간 SeekTo 이동 핸들러
  const handleSubtitleClick = (start: number, idx: number) => {
    setActiveSubtitleIndex(idx);
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(start + 0.1, true); // 탐색 위치 오차 방지 보정 0.1초 적용
      playerRef.current.playVideo();
    }
  };

  // 단어카드 예문 내의 타깃 단어를 찾아서 색상강조(strong)해 주는 포맷 함수
  const renderHighlightedSentence = (text: string, fallbackWord: string) => {
    if (!text) return null;
    // '__단어__' 이중 언더바 기반 포맷팅 분기
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
    // 단어 일치 매핑 대체
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

  // 단어 읽어주기 TTS API 비동기 재생 호출기
  const handleTTS = async (text: string) => {
    setSpeechActive(text);
    try {
      const speedKey = username ? `${username}_ttsSpeed` : "ttsSpeed";
      const genderKey = username ? `${username}_ttsGender` : "ttsGender";
      const ttsSpeed = localStorage.getItem(speedKey) || "normal";
      const ttsGender = localStorage.getItem(genderKey) || "female";
      const audio = new Audio(`/api/tts?q=${encodeURIComponent(text)}&lang=ja&speed=${ttsSpeed}&gender=${ttsGender}`);
      await audio.play();
    } catch (err) {
      console.error("TTS playback failed", err);
    } finally {
      setTimeout(() => setSpeechActive(null), 1500);
    }
  };

  // 퀴즈 답안 마킹 처리
  const handleSelectQuizAnswer = (quizId: number, choiceIndex: number) => {
    if (quizGraded) return;
    setQuizAnswers((prev) => ({ ...prev, [quizId]: choiceIndex }));
  };

  // 퀴즈 채점 정오답 개수 합산 및 채점 완료 전환
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

  // 퀴즈 풀이 상태 초기화
  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizGraded(false);
    setQuizScore(0);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* 1. 상단 바 (뉴스 제목 및 뒤로가기) */}
      <NewsHeader
        title={lesson.title}
        handleGoHome={handleGoHome}
      />

      {/* 2. 유튜브 동영상 플레이어 및 모니터링 컨트롤러 */}
      <NewsVideoPlayer
        videoUrl={lesson.videoUrl}
        playerState={playerState}
      />

      {/* 3. 자막/단어/퀴즈 3단계 학습 탭 보드 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* 탭 네비게이션 헤더 */}
        <NewsTabHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          vocabCount={lesson.vocabItems.length}
        />

        {/* 탭 콘텐츠 영역 */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* 자막 리스트 탭 활성 */}
            {activeTab === "subtitles" && (
              <motion.div
                key="tab-subtitles"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <NewsSubtitlesTab
                  subtitles={lesson.subtitles}
                  activeSubtitleIndex={activeSubtitleIndex}
                  handleSubtitleClick={handleSubtitleClick}
                  subtitleContainerRef={subtitleContainerRef}
                />
              </motion.div>
            )}

            {/* 중요 단어 탭 활성 */}
            {activeTab === "vocab" && lesson.vocabItems.length > 0 && (
              <motion.div
                key="tab-vocab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <NewsVocabTab
                  vocabItems={lesson.vocabItems}
                  vocabIndex={vocabIndex}
                  setVocabIndex={setVocabIndex}
                  handleTTS={handleTTS}
                  speechActive={speechActive}
                  renderHighlightedSentence={renderHighlightedSentence}
                />
              </motion.div>
            )}

            {/* 퀴즈 문제 풀기 탭 활성 */}
            {activeTab === "quiz" && lesson.quizzes.length > 0 && (
              <motion.div
                key="tab-quiz"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <NewsQuizTab
                  quizzes={lesson.quizzes}
                  quizAnswers={quizAnswers}
                  quizGraded={quizGraded}
                  quizScore={quizScore}
                  handleSelectAnswer={handleSelectQuizAnswer}
                  handleGrade={handleGradeQuiz}
                  handleReset={handleResetQuiz}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
