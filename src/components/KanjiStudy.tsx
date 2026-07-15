import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KanjiItem, RadicalPart } from "../types";
import { RadicalModal } from "./RadicalModal";
import { getTheme } from "../theme";
import { ThemeParticles } from "./ThemeParticles";

// 분리한 하위 컴포넌트 임포트
import { KanjiProgressBar } from "./kanji/KanjiProgressBar";
import { KanjiCardHeader } from "./kanji/KanjiCardHeader";
import { KanjiVisualPanel } from "./kanji/KanjiVisualPanel";
import { KanjiMnemonicPanel } from "./kanji/KanjiMnemonicPanel";
import { KanjiRadicalsBreakdown } from "./kanji/KanjiRadicalsBreakdown";
import { KanjiReadingsTable } from "./kanji/KanjiReadingsTable";
import { KanjiRelatedWords } from "./kanji/KanjiRelatedWords";
import { KanjiExampleSentence } from "./kanji/KanjiExampleSentence";
import { KanjiNavigation } from "./kanji/KanjiNavigation";

// KanjiStudyProps 인터페이스 정의
interface KanjiStudyProps {
  kanjiList: KanjiItem[];                                               // 학습용 한자 리스트
  currentKanjiIndex: number;                                            // 현재 한자 인덱스 번호 (0-based)
  handlePrevStudy: () => void;                                          // 이전 한자 핸들러
  handleNextStudy: () => Promise<void>;                                 // 다음 한자 핸들러
  speakJapanese: (text: string) => void;                                // 일어 TTS 음성 함수
  currentTheme?: string;                                                // 활성화된 디자인 테마 키
  bookmarkedKanjis: string[];                                           // 사용자가 북마크한 한자 배열
  onToggleBookmark: (type: "kanji" | "vocab", item: string) => void;    // 북마크 토글 API 연동 함수
}

// 메인 한자 학습 화면 컴포넌트 (조립식 구조)
export function KanjiStudy({
  kanjiList,
  currentKanjiIndex,
  handlePrevStudy,
  handleNextStudy,
  speakJapanese,
  currentTheme = 'default',
  bookmarkedKanjis,
  onToggleBookmark
}: KanjiStudyProps) {
  // 현재 부수 팝업 상세 모달 창을 띄울 상태 정보
  const [activeRadical, setActiveRadical] = useState<RadicalPart | null>(null);

  const theme = getTheme(currentTheme);
  const currentKanji = kanjiList[currentKanjiIndex];
  const isBookmarked = bookmarkedKanjis.includes(currentKanji.kanji);

  return (
    <motion.div
      key="studying-screen"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 w-full"
    >
      {/* 1. 상단 한자 암기 진행률 게이지 바 */}
      <KanjiProgressBar
        currentIndex={currentKanjiIndex}
        totalCount={kanjiList.length}
        theme={theme}
      />

      <div className={`${theme.cardContainer} overflow-hidden flex flex-col shrink-0 relative font-sans ${currentTheme === 'golden_aura' ? 'golden-aura-card-glow' : ''}`}>
        {/* 테마별 특수 시각 효과 백그라운드 렌더링 */}
        <ThemeParticles theme={currentTheme} />

        {/* 2. 카드 헤더 영역 (인덱스 번호 및 등급 정보 배지) */}
        <KanjiCardHeader
          currentIndex={currentKanjiIndex}
          grade={currentKanji.grade}
          jlptLevel={currentKanji.jlptLevel}
          theme={theme}
        />

        <div className="p-5 sm:p-6 space-y-5">
          {/* 주요 레이아웃 격자 (Grid) 구성 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* 3. 좌측 메인 한자 비주얼 패널 */}
            <KanjiVisualPanel
              kanji={currentKanji.kanji}
              meaning={currentKanji.meaning}
              isBookmarked={isBookmarked}
              onToggleBookmark={() => onToggleBookmark("kanji", currentKanji.kanji)}
              speakJapanese={speakJapanese}
              theme={theme}
            />

            {/* 우측 연상 암기 스토리 및 한자/독음 풀이 영역 */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-4">
              {/* 4. 이미지 연상 암기 키워드 패널 */}
              <KanjiMnemonicPanel
                mnemonic={currentKanji.mnemonic}
                theme={theme}
              />

              {/* 5. 부수 해설 조각 리스트 */}
              <KanjiRadicalsBreakdown
                radicals={currentKanji.radicalsBreakdown}
                setActiveRadical={setActiveRadical}
                theme={theme}
              />

              {/* 6. 음독/훈독 요미가나 표기 테이블 */}
              <KanjiReadingsTable
                onyomi={currentKanji.onyomi}
                onyomiKorean={currentKanji.onyomiKorean}
                hunyomi={currentKanji.hunyomi}
                hunyomiKorean={currentKanji.hunyomiKorean}
                speakJapanese={speakJapanese}
                theme={theme}
              />
            </div>
          </div>

          {/* 7. 연관 핵심 단어 확장 카드 리스트 */}
          <KanjiRelatedWords
            relatedWords={currentKanji.relatedWords}
            speakJapanese={speakJapanese}
            theme={theme}
          />

          {/* 8. 하단 한자 학습 필수 예문 다이얼로그 박스 */}
          <KanjiExampleSentence
            exampleSentence={currentKanji.exampleSentence}
            speakJapanese={speakJapanese}
            theme={theme}
          />
        </div>

        {/* 9. 하단 푸터 내비게이션 바 */}
        <KanjiNavigation
          currentIndex={currentKanjiIndex}
          totalCount={kanjiList.length}
          handlePrevStudy={handlePrevStudy}
          handleNextStudy={handleNextStudy}
          theme={theme}
        />
      </div>

      {/* 부수 클릭 상세 정보 모달 팝업 오버레이 */}
      <AnimatePresence>
        {activeRadical && (
          <RadicalModal
            activeRadical={activeRadical}
            onClose={() => setActiveRadical(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
