import { Star, Volume2 } from "lucide-react";

// 시각 패널 컴포넌트의 Props 인터페이스 정의
interface VocabVisualPanelProps {
  word: string;                      // 표시할 단어 한자 표기 (예: 食べる)
  hiragana: string;                  // 히라가나 읽기 (예: たべる)
  pronunciation: string;             // 한글 발음 가이드 (예: 타베루)
  meaning: string;                   // 한국어 뜻 (예: 먹다)
  isBookmarked: boolean;             // 북마크 등록 여부
  onToggleBookmark: () => void;      // 북마크 토글 버튼 클릭 핸들러
  speakJapanese: (text: string) => void; // 일본어 오디오 재생 함수
  theme: any;                        // 적용된 디자인 테마 객체
}

// 메인 단어 카드 내 좌측 시각 정보 표시 영역 (단어 표기, 한글 가이드, 소리 재생, 북마크)
export function VocabVisualPanel({
  word,
  hiragana,
  pronunciation,
  meaning,
  isBookmarked,
  onToggleBookmark,
  speakJapanese,
  theme
}: VocabVisualPanelProps) {
  // 단어 글자 수에 맞춘 글자 크기 조절 함수
  const getFontSizeClass = (wordLength: number) => {
    if (wordLength >= 8) return "text-xl sm:text-3xl";
    if (wordLength >= 6) return "text-2xl sm:text-4xl";
    if (wordLength >= 4) return "text-3xl sm:text-5xl";
    return "text-4xl sm:text-6xl";
  };

  return (
    <div
      className={`md:col-span-4 rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ${theme.wordPanelBg}`}
    >
      {/* 우측 상단 북마크 토글 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark();
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-95 focus:outline-none z-20"
        title="북마크 토글"
      >
        <Star
          className={`w-5 h-5 transition-all ${
            isBookmarked
              ? "text-amber-500 fill-amber-500 scale-110"
              : "text-slate-400 fill-none"
          }`}
        />
      </button>

      {/* 중앙 단어 텍스트 및 발음/뜻 영역 */}
      <div className="my-auto py-5 flex flex-col items-center justify-center gap-2">
        {/* 메인 한자 표기 */}
        <div className="relative group inline-block">
          <h1
            lang="ja"
            className={`${getFontSizeClass(word.length)} font-serif font-semibold leading-none select-none select-all relative group transition-colors ${theme.wordTextHover}`}
          >
            {word}
          </h1>
        </div>

        {/* 요미가나 및 한국어 발음 표기 영역 */}
        <div className="flex items-center justify-center gap-2.5 mt-1.5">
          <span lang="ja" className={`text-base font-bold tracking-wide ${theme.wordPronunciationText}`}>
            {hiragana} <span lang="ko" className="opacity-80 font-semibold">({pronunciation})</span>
          </span>
          
          {/* 단어 오디오 듣기 스피커 버튼 (절대값 겹침을 방지하기 위해 Flex로 나란히 배치) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              speakJapanese(word);
            }}
            className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ${theme.wordAudioBtn}`}
            title="단어 발음 듣기"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 단어의 한국어 의미를 담은 배지 */}
        <div className={`inline-block mt-2 px-3.5 py-1.5 rounded-full text-base font-bold ${theme.meaningBadge}`}>
          {meaning}
        </div>
      </div>
    </div>
  );
}
