import { useState, useRef } from "react";
import { motion } from "motion/react";
import { CornerDownRight } from "lucide-react";
import { JlptQuestion } from "../types";
import { getTheme } from "../theme";

// 분리한 하위 컴포넌트 임포트
import { JlptProgressBar } from "./jlpt/JlptProgressBar";
import { JlptQuestionSentence } from "./jlpt/JlptQuestionSentence";
import { JlptChoices } from "./jlpt/JlptChoices";
import { JlptNavigation } from "./jlpt/JlptNavigation";
import { JlptResultScore } from "./jlpt/JlptResultScore";
import { JlptResultList } from "./jlpt/JlptResultList";

// JlptTestProps 인터페이스 정의
interface JlptTestProps {
  selectedJlptLevel: string;                                          // 선택된 JLPT 레벨 (N1 ~ N5)
  jlptQuestions: JlptQuestion[];                                      // 시험 문항 배열 목록
  currentJlptIndex: number;                                           // 현재 문제 번호 (0-based)
  jlptAnswers: { [questionId: string]: number };                      // 마킹한 답안 목록 맵
  isJlptGraded: boolean;                                              // 채점 완료 여부
  isJlptLoading: boolean;                                             // 다시 가져오기 등 로딩 중 여부
  handleSelectJlptAnswer: (choiceIndex: number) => void;              // 보기 체크 함수
  handlePrevJlptQuestion: () => void;                                 // 이전 문항 이동 함수
  handleNextJlptQuestion: () => void;                                 // 다음 문항 이동 함수
  handleGradeJlptQuiz: () => void;                                    // 시험지 채점 제출 함수
  handleGoHomeJlpt: () => void;                                       // 홈(기출 등급 목록)으로 이동 함수
  startJlptQuiz: () => void;                                          // 시험 시작/초기화 함수
  currentTheme?: string;                                              // 디자인 테마 명칭
}

// 메인 JLPT 모의고사 평가 컴포넌트 (조립식 구조)
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
  // 사무라이 테마 가로베기 모션 및 전체 흔들림 모션 제어 상태
  const [slashingChoice, setSlashingChoice] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // 테마별 오디오 재생용 Ref 설정
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const yokaiAudioRef = useRef<HTMLAudioElement | null>(null);
  const zenAudioRef = useRef<HTMLAudioElement | null>(null);
  const chalkboardAudioRef = useRef<HTMLAudioElement | null>(null);

  // 클라이언트 환경에서 효과음 오디오 객체 싱글톤 성격 초기화
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
  }

  // 문항 데이터가 없으면 출력 안 함
  if (jlptQuestions.length === 0) return null;

  const theme = getTheme(currentTheme);
  const isSamurai = theme.isSamurai;
  const isYokai = theme.isYokai;
  const isZen = theme.isZen;

  // 보기 선택 클릭 시 테마 이펙트 오디오 플레이 및 상태 전파 함수
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
    }
    handleSelectJlptAnswer(choiceIdx);
  };

  // 계산용 변수 매핑
  const currentQuestion = jlptQuestions[currentJlptIndex];
  const selectedAnswerIdx = jlptAnswers[currentQuestion.id];

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
        /* 1. JLPT 실전 시험지 풀이 모드 */
        <div className="space-y-5">
          {/* 상단 진행률 프로그레스 바 */}
          <JlptProgressBar
            currentIndex={currentJlptIndex}
            totalCount={jlptQuestions.length}
            level={selectedJlptLevel}
            theme={theme}
          />

          <div 
            className={`${theme.cardContainer} overflow-hidden p-4 sm:p-6 space-y-4 sm:space-y-6 relative ${isShaking && isSamurai ? "shake-effect" : ""}`}
          >
            {/* 테마 백그라운드 특수 시각 효과 */}
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
            {theme.isChalkboard && (
              <div className="chalkboard-dust-particles">
                <div className="chalk-dust" style={{ left: '10%', animationDelay: '0s' }}></div>
                <div className="chalk-dust" style={{ left: '30%', animationDelay: '-3s' }}></div>
                <div className="chalk-dust" style={{ left: '50%', animationDelay: '-6s' }}></div>
                <div className="chalk-dust" style={{ left: '70%', animationDelay: '-9s' }}></div>
                <div className="chalk-dust" style={{ left: '90%', animationDelay: '-12s' }}></div>
              </div>
            )}

            {/* 문항 번호 표기 및 나가기 컨트롤 바 */}
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

            {/* 문제 질문 설명 및 핵심 문장 영역 */}
            <div className="space-y-4 relative z-10">
              <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${theme.questionInstructionColor}`}>
                <CornerDownRight className={`w-3.5 h-3.5 ${theme.questionInstructionIcon}`} />
                제시된 문제를 읽고 올바른 정답을 선택해 보세요
              </h3>

              {/* 빈칸/강조 일본어 원문 문장 출력 컴포넌트 */}
              <JlptQuestionSentence
                questionSentence={currentQuestion.questionSentence}
                theme={theme}
              />

              {/* 한글 질문 프롬프트 가이드 */}
              <div className="space-y-1">
                <p className={`text-base sm:text-lg font-bold ${theme.questionPromptText}`}>
                  Q. {currentQuestion.questionText.replace(/__/g, "")}
                </p>
                <p className={`text-xs ${theme.questionPromptSubText}`}>
                  * 제시된 단어에 가장 알맞은 독음, 한자 표기, 또는 한국어 뜻을 보기에서 선택해 보세요.
                </p>
              </div>
            </div>

            {/* 객관식 보기 리스트 컴포넌트 */}
            <JlptChoices
              choices={currentQuestion.choices}
              selectedChoiceIdx={selectedAnswerIdx}
              slashingChoice={slashingChoice}
              onSelect={onSelect}
              theme={theme}
            />

            {/* 하단 내비게이션 컨트롤 바 */}
            <JlptNavigation
              currentIndex={currentJlptIndex}
              totalCount={jlptQuestions.length}
              handlePrev={handlePrevJlptQuestion}
              handleNext={handleNextJlptQuestion}
              handleGrade={handleGradeJlptQuiz}
              theme={theme}
            />
          </div>
        </div>
      ) : (
        /* 2. 시험 채점 종료 후 성적 분석 보고서 출력 모드 */
        <div className="space-y-6">
          {/* 점수 산출 및 결과 헤더 블록 */}
          {(() => {
            let correctCount = 0;
            jlptQuestions.forEach(q => {
              if (jlptAnswers[q.id] === q.correctIndex) {
                correctCount++;
              }
            });

            return (
              <JlptResultScore
                correctCount={correctCount}
                totalCount={jlptQuestions.length}
                level={selectedJlptLevel}
                isJlptLoading={isJlptLoading}
                startJlptQuiz={startJlptQuiz}
                handleGoHome={handleGoHomeJlpt}
                theme={theme}
              />
            );
          })()}

          {/* 오답 및 정답 문항 분석 상세 분석 리스트 리포트 */}
          <JlptResultList
            questions={jlptQuestions}
            answers={jlptAnswers}
            theme={theme}
          />
        </div>
      )}
    </motion.div>
  );
}
