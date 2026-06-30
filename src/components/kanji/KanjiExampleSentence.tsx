import { Volume2 } from "lucide-react";

// 예문 데이터 형식 인터페이스 정의
interface ExampleSentence {
  japanese: string;      // 일본어 원문 예문
  hiragana: string;      // 요미가나 표기
  pronunciation: string; // 한글 발음 가이드
  meaning: string;       // 한국어 번역 뜻
}

// 예문 컴포넌트 Props 인터페이스 정의
interface KanjiExampleSentenceProps {
  exampleSentence: ExampleSentence;      // 예문 데이터 객체
  speakJapanese: (text: string) => void; // 일어 음성 재생 함수
  theme: any;                            // 적용된 테마 객체
}

// 한자 학습 카드 하단의 연상 학습용 한자 예문 영역 컴포넌트
export function KanjiExampleSentence({
  exampleSentence,
  speakJapanese,
  theme
}: KanjiExampleSentenceProps) {
  return (
    <div className={`rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden z-10 ${theme.exampleBoxBg}`}>
      {/* 백그라운드 한자 데코 레이블 */}
      <div className={`absolute -bottom-4 -right-4 text-7xl font-sans font-bold select-none pointer-events-none ${theme.exampleOverlayText}`}>
        文
      </div>
      
      {/* 설명 타이틀 및 오디오 듣기 버튼 */}
      <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider gap-2 ${theme.exampleTitleColorKanji}`}>
        <span>연상 학습 필수 예문 (例文)</span>
        <button
          onClick={() => speakJapanese(exampleSentence.japanese)}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0 z-10 ${theme.exampleAudioBtn}`}
        >
          <Volume2 className="w-4 h-4" />
          <span>예문 연속 읽기</span>
        </button>
      </div>

      {/* 일문 원고, 히라가나 요미가나, 한글 발음, 해석 */}
      <div className="space-y-1.5 z-10 relative">
        {/* 일어 원문 */}
        <p lang="ja" className={`text-base sm:text-lg font-bold tracking-wide select-all ${theme.exampleJapText}`}>
          {exampleSentence.japanese}
        </p>
        
        {/* 요미가나 */}
        <p lang="ja" className={`text-xs font-mono ${theme.exampleHiraText}`}>
          {exampleSentence.hiragana}
        </p>
        
        {/* 한글 발음 가이드 */}
        <p className={`text-xs font-sans font-medium ${theme.examplePronunciationTextKanji}`}>
          [{exampleSentence.pronunciation}]
        </p>
        
        {/* 한국어 번역 해석 */}
        <p className={`text-xs sm:text-sm border-t pt-1.5 mt-1.5 font-sans leading-relaxed ${theme.exampleMeaningText}`}>
          {exampleSentence.meaning}
        </p>
      </div>
    </div>
  );
}
