import { CornerDownRight, Volume2 } from "lucide-react";

// 연관 단어 상세 구조 인터페이스 정의
interface RelatedWordItem {
  word: string;          // 한자 단어 (예: 見学)
  hiragana: string;      // 요미가나 (예: けんがく)
  pronunciation: string; // 한국어 발음 가이드 (예: 켄가쿠)
  meaning: string;       // 한국어 의미 뜻 (예: 견학)
}

// 연관 단어 Props 인터페이스 정의
interface KanjiRelatedWordsProps {
  relatedWords: RelatedWordItem[];   // 단어 객체 배열
  speakJapanese: (text: string) => void; // 일어 음성 재생 함수
  theme: any;                        // 적용된 테마 객체
}

// 해당 한자가 쓰인 3가지 주요 예시 어휘 리스트를 보여주는 카드 그리드 컴포넌트
export function KanjiRelatedWords({
  relatedWords,
  speakJapanese,
  theme
}: KanjiRelatedWordsProps) {
  return (
    <div className="space-y-3 pt-2">
      {/* 서브 섹션 타이틀 헤더 */}
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        <CornerDownRight className="w-3.5 h-3.5 text-amber-500" />
        연관 핵심 어휘 확장하기
      </h4>
      
      {/* 연관 단어들의 3열 격자 구조 카드 배치 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {relatedWords.map((item, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-3 space-y-1 text-xs transition-colors relative group z-10 ${theme.relatedWordCard}`}
          >
            {/* 단어 원문과 사운드 재생 버튼 */}
            <div className="flex justify-between items-center gap-2">
              <span lang="ja" className={`font-bold text-sm tracking-wide font-mono select-all ${theme.relatedWordJapText}`}>
                {item.word}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(item.word);
                }}
                className={`p-1.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center ${theme.tableAudioBtn}`}
                title="발음 듣기"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* 요미가나 발음 정보 영역 */}
            <div className={`flex items-center gap-1 text-[11px] font-mono ${theme.relatedWordSubText}`}>
              <span lang="ja">{item.hiragana}</span>
              <span> | </span>
              <span lang="ko" className={theme.relatedWordPronunciationText}>{item.pronunciation}</span>
            </div>
            
            {/* 한국어 뜻풀이 하단 구분 선 */}
            <div className={`font-semibold font-sans border-t pt-1 mt-1 text-[11px] ${theme.relatedWordMeaningText}`}>
              뜻: {item.meaning}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
