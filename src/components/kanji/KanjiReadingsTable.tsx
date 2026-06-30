import { Volume2 } from "lucide-react";

// 발음표 Props 인터페이스 정의
interface KanjiReadingsTableProps {
  onyomi: string;                    // 일어 음독 (예: けん)
  onyomiKorean: string;              // 한국어 음독 번역 (예: 켄)
  hunyomi?: string;                  // 일어 훈독 (예: み.る)
  hunyomiKorean: string;             // 한국어 훈독 번역 (예: 미루)
  speakJapanese: (text: string) => void; // 일어 발음 듣기 재생 함수
  theme: any;                        // 적용된 테마 객체
}

// 한자의 음독(音) 및 훈독(訓) 일어 스펙과 한글 가이드를 담은 테이블 컴포넌트
export function KanjiReadingsTable({
  onyomi,
  onyomiKorean,
  hunyomi,
  hunyomiKorean,
  speakJapanese,
  theme
}: KanjiReadingsTableProps) {
  return (
    <div className={`border rounded-xl overflow-hidden text-xs z-10 relative ${theme.tableBorder}`}>
      {/* 1. 음독 (音) 로우 */}
      <div className={`grid grid-cols-12 border-b shrink-0 ${theme.tableBorder}`}>
        <div className={`col-span-3 p-2.5 font-bold flex flex-col justify-center items-center text-center border-r gap-0.5 ${theme.tableHeaderCol}`}>
          <span>음독</span>
          <span className={`text-[10px] font-mono ${theme.tableHeaderLabelText}`}>(音)</span>
        </div>
        <div className={`col-span-9 p-2.5 space-y-1 ${theme.tableValueCol}`}>
          <div className="flex items-center gap-2">
            {/* 일본어 음독 표기 */}
            <span lang="ja" className={`text-sm font-bold font-mono ${theme.tableJapText}`}>
              {onyomi}
            </span>
            {/* 한국어 음독 독음 배지 */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${theme.tableOnyomiKoreanBadge}`}>
              {onyomiKorean}
            </span>
            
            {/* 음독 오디오 듣기 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakJapanese(onyomi);
              }}
              className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ml-1 ${theme.tableAudioBtn}`}
              title="음독 발음 듣기"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 훈독 (訓) 로우 */}
      <div className="grid grid-cols-12 shrink-0">
        <div className={`col-span-3 p-2.5 font-bold flex flex-col justify-center items-center text-center border-r gap-0.5 ${theme.tableHeaderCol}`}>
          <span>훈독</span>
          <span className={`text-[10px] font-mono ${theme.tableHeaderLabelText}`}>(訓)</span>
        </div>
        <div className={`col-span-9 p-2.5 space-y-1 ${theme.tableValueCol}`}>
          <div className="flex items-center gap-2">
            {/* 일본어 훈독 표기 (온점 기호 등은 음성 재생용 문자열 처리 시 제거) */}
            <span lang="ja" className={`text-sm font-bold font-mono ${theme.tableJapText}`}>
              {hunyomi?.replace(/\./g, "")}
            </span>
            {/* 한국어 훈독 독음 배지 */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${theme.tableHunyomiKoreanBadge}`}>
              {hunyomiKorean}
            </span>
            
            {/* 훈독 오디오 듣기 버튼 */}
            {hunyomi && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(hunyomi.replace(/\./g, ""));
                }}
                className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ml-1 ${theme.tableAudioBtn}`}
                title="훈독 발음 듣기"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
