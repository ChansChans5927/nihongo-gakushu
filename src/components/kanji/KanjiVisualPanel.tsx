import { Star } from "lucide-react";

// 비주얼 패널 Props 인터페이스 정의
interface KanjiVisualPanelProps {
  kanji: string;                     // 한자 글자 (예: 見)
  meaning: string;                   // 뜻과 음 (예: 볼 견)
  isBookmarked: boolean;             // 북마크 등록 여부
  onToggleBookmark: () => void;      // 북마크 토글 이벤트 핸들러
  speakJapanese: (text: string) => void; // 일어 음성 재생 함수
  theme: any;                        // 적용된 테마 객체
}

// 좌측 메인 한자 패널 컴포넌트 (한자 문자, 북마크 토글, 뜻음 배지)
export function KanjiVisualPanel({
  kanji,
  meaning,
  isBookmarked,
  onToggleBookmark,
  speakJapanese,
  theme
}: KanjiVisualPanelProps) {
  return (
    <div
      className={`md:col-span-4 rounded-2xl p-5 flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[160px] ${theme.wordPanelBg}`}
    >
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

      {/* 중앙 메인 한자 표기 */}
      <div className="my-auto py-4">
        <div
          lang="ja"
          className={`text-7xl sm:text-8xl font-serif font-semibold leading-none select-none select-all relative group transition-colors ${theme.kanjiTextHover}`}
        >
          {kanji}
        </div>

        {/* 한자 한국어 뜻음 배지 */}
        <div className={`mt-4 px-3 py-1 rounded-full text-base font-bold ${theme.kanjiMeaningBadge}`}>
          {meaning}
        </div>
      </div>
    </div>
  );
}
