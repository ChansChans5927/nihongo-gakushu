import { Volume2 } from "lucide-react";

// 예문 구조를 가진 인터페이스 정의
interface ExampleSentence {
  japanese: string;      // 일본어 예문 (예: リン고를...)
  hiragana: string;      // 히라가나 발음
  pronunciation: string; // 한글 독음 가이드
  meaning: string;       // 한국어 번역 뜻
}

// 예문 컴포넌트의 Props 인터페이스 정의
interface VocabExampleSentenceProps {
  exampleSentence: ExampleSentence;      // 학습할 예문 객체
  speakJapanese: (text: string) => void; // 일어 음성 재생 함수
  theme: any;                            // 적용된 디자인 테마 객체
}

// 단어 카드 하단 예문 다이얼로그 박스 컴포넌트
export function VocabExampleSentence({
  exampleSentence,
  speakJapanese,
  theme
}: VocabExampleSentenceProps) {
  return (
    <div className={`rounded-2xl p-4 space-y-2.5 shadow-inner relative overflow-hidden z-10 ${theme.exampleBoxBg}`}>
      {/* 한자 배경 텍스트 장식 */}
      <div className={`absolute -bottom-4 -right-4 text-7xl font-sans font-bold select-none pointer-events-none ${theme.exampleOverlayText}`}>
        文
      </div>
      
      {/* 타이틀 및 오디오 듣기 버튼 */}
      <div className={`flex items-center justify-between text-[13px] font-bold uppercase tracking-wider gap-2 ${theme.exampleTitleColor}`}>
        <span>단어 예문 (例文)</span>
        <button
          onClick={() => speakJapanese(exampleSentence.japanese)}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-xs font-semibold shrink-0 z-10 ${theme.exampleAudioBtn}`}
        >
          <Volume2 className="w-4 h-4" />
          <span>예문 듣기</span>
        </button>
      </div>

      {/* 일본어 원문, 요미가나, 독음 가이드, 번역 내용 */}
      <div className="space-y-1.5 z-10 relative">
        {/* 일본어 원문 */}
        <p lang="ja" className={`text-base sm:text-lg font-bold tracking-wide select-all ${theme.exampleJapText}`}>
          {exampleSentence.japanese}
        </p>
        
        {/* 히라가나 요미가나 */}
        <p lang="ja" className={`text-xs font-mono ${theme.exampleHiraText}`}>
          {exampleSentence.hiragana}
        </p>
        
        {/* 한글 발음 가이드 */}
        <p className={`text-xs font-sans font-medium ${theme.examplePronunciationText}`}>
          [{exampleSentence.pronunciation}]
        </p>
        
        {/* 한국어 번역 뜻 */}
        <p className={`text-xs sm:text-sm border-t pt-1.5 mt-1.5 font-sans leading-relaxed ${theme.exampleMeaningText}`}>
          {exampleSentence.meaning}
        </p>
      </div>
    </div>
  );
}
