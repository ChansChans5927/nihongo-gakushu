import { Star, Volume2 } from "lucide-react";

// 비주얼 패널 Props 인터페이스 정의
interface KanjiVisualPanelProps {
  kanji: string;                     // 한자 글자 (예: 見)
  meaning: string;                   // 뜻과 음 (예: 볼 견)
  strokeCount: number;               // 획수
  isBookmarked: boolean;             // 북마크 등록 여부
  onToggleBookmark: () => void;      // 북마크 토글 이벤트 핸들러
  speakJapanese: (text: string) => void; // 일어 음성 재생 함수
  theme: any;                        // 적용된 테마 객체
}

// 좌측 메인 한자 패널 컴포넌트 (획수, 한자 문자, 사운드 재생, 북마크 토글, 뜻음 배지)
export function KanjiVisualPanel({
  kanji,
  meaning,
  strokeCount,
  isBookmarked,
  onToggleBookmark,
  speakJapanese,
  theme
}: KanjiVisualPanelProps) {
  return (
    <div
      className={`md:col-span-4 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden ${theme.wordPanelBg}`}
    >
      {/* 좌측 상단 획수 정보 */}
      <div className={`absolute top-2 left-2 text-[10px] font-mono font-bold ${theme.strokeCountText}`}>
        {strokeCount} 획
      </div>

      {/* 우측 상단 북마크 별 아이콘 토글 */}
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

      {/* 중앙 메인 한자 표기 및 사운드 스피커 버튼 */}
      <div className="my-auto py-4">
        <div
          lang="ja"
          className={`text-7xl sm:text-8xl font-serif font-semibold leading-none select-none select-all relative group transition-colors ${theme.kanjiTextHover}`}
        >
          {kanji}
          <button
            onClick={(e) => {
              e.stopPropagation();
              speakJapanese(kanji);
            }}
            className={`absolute -top-4 -right-6 p-1.5 rounded-full shadow-sm transition-all opacity-100 cursor-pointer flex items-center justify-center ${theme.kanjiAudioBtn}`}
            title="한자 발음 듣기"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* 한자 한국어 뜻음 배지 */}
        <div className={`mt-4 px-3 py-1 rounded-full text-base font-bold ${theme.kanjiMeaningBadge}`}>
          {meaning}
        </div>
      </div>
    </div>
  );
}
