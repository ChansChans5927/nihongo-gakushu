import { motion } from "motion/react";
import { VocabItem } from "../types";
import { getTheme } from "../theme";
import { ThemeParticles } from "./ThemeParticles";

// 분할한 하위 컴포넌트들을 가져옴
import { VocabProgressBar } from "./vocab/VocabProgressBar";
import { VocabCardHeader } from "./vocab/VocabCardHeader";
import { VocabVisualPanel } from "./vocab/VocabVisualPanel";
import { VocabKanjiBreakdown } from "./vocab/VocabKanjiBreakdown";
import { VocabExampleSentence } from "./vocab/VocabExampleSentence";
import { VocabNavigation } from "./vocab/VocabNavigation";

// VocabStudyProps 인터페이스 정의
interface VocabStudyProps {
  vocabList: VocabItem[];                                               // 학습용 단어 리스트
  currentVocabIndex: number;                                            // 현재 단어의 인덱스 번호 (0-based)
  handlePrevStudy: () => void;                                          // 이전 버튼 이벤트 핸들러
  handleNextStudy: () => Promise<void>;                                 // 다음 버튼 이벤트 핸들러
  speakJapanese: (text: string) => void;                                // 일본어 TTS 재생 함수
  currentTheme?: string;                                                // 활성화된 디자인 테마 키
  bookmarkedVocabs: string[];                                           // 사용자가 북마크한 단어 문자열 배열
  onToggleBookmark: (type: "kanji" | "vocab", item: string) => void;    // 북마크 토글 이벤트 API 연동 함수
}

// 메인 단어 학습 화면 컴포넌트 (조립식 구조)
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

  // 현재 학습 단어가 북마크 목록에 등록되어 있는지 여부 판단
  const isBookmarked = bookmarkedVocabs.includes(currentVocab.word);

  return (
    <motion.div
      key="vocab-studying-screen"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 w-full"
    >
      {/* 1. 상단 단어 암기 진행률 게이지 바 */}
      <VocabProgressBar
        currentIndex={currentVocabIndex}
        totalCount={vocabList.length}
        theme={theme}
      />

      <div className={`${theme.cardContainer} overflow-hidden relative flex flex-col h-[calc(100dvh-150px)] sm:h-auto ${currentTheme === 'golden_aura' ? 'golden-aura-card-glow' : ''}`}>
        {/* 테마별 배경 특수 시각 효과 */}
        <ThemeParticles theme={currentTheme} />

        {/* 2. 단어 카드 상단 인덱스 및 품사 바 */}
        <VocabCardHeader
          currentIndex={currentVocabIndex}
          pos={currentVocab.pos}
          theme={theme}
        />

        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto sm:overflow-y-visible">
          {/* 주요 콘텐츠 격자(Grid) 배치 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* 3. 좌측 메인 단어 비주얼 패널 */}
            <VocabVisualPanel
              word={currentVocab.word}
              hiragana={currentVocab.hiragana}
              pronunciation={currentVocab.pronunciation}
              meaning={currentVocab.meaning}
              isBookmarked={isBookmarked}
              onToggleBookmark={() => onToggleBookmark("vocab", currentVocab.word)}
              speakJapanese={speakJapanese}
              theme={theme}
            />

            {/* 4. 우측 한자 분해 설명 패널 */}
            <VocabKanjiBreakdown
              kanjiBreakdown={currentVocab.kanjiBreakdown}
              speakJapanese={speakJapanese}
              theme={theme}
            />
          </div>

          {/* 5. 하단 단어 예문 다이얼로그 박스 */}
          <VocabExampleSentence
            exampleSentence={currentVocab.exampleSentence}
            speakJapanese={speakJapanese}
            theme={theme}
          />
        </div>

        {/* 6. 하단 푸터 내비게이션 컨트롤 바 (이전/다음 단어 이동 및 클릭 이펙트) */}
        <VocabNavigation
          currentIndex={currentVocabIndex}
          totalCount={vocabList.length}
          handlePrevStudy={handlePrevStudy}
          handleNextStudy={handleNextStudy}
          theme={theme}
        />
      </div>
    </motion.div>
  );
}
