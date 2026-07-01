import { Sparkles } from "lucide-react";

// 한자 분석 구성요소 인터페이스 정의
interface KanjiBreakdownItem {
  kanji: string;      // 낱개 한자 문자 (예: 食)
  meaning: string;    // 한자 풀이 (예: 밥 식)
  mnemonic: string;   // 연상 암기 스토리 (예: 사람이 뚜껑을 덮어 밥을 보관하는 모양입니다.)
}

// 한자 분해 컴포넌트의 Props 인터페이스 정의
interface VocabKanjiBreakdownProps {
  kanjiBreakdown?: KanjiBreakdownItem[]; // 한자 분해 목록 배열
  speakJapanese: (text: string) => void; // 일어 음성 재생 함수
  theme: any;                            // 적용된 디자인 테마 객체
}

// 단어 내 한자들을 개별 분해하여 뜻과 연상 암기법을 제공하는 패널 컴포넌트
export function VocabKanjiBreakdown({
  kanjiBreakdown,
  speakJapanese,
  theme
}: VocabKanjiBreakdownProps) {
  return (
    <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
      <div className={`rounded-2xl p-4 space-y-3 relative z-10 w-full ${theme.breakdownPanelBg}`}>
        {/* 데코레이션 아이콘 */}
        <div className={`absolute top-2.5 right-2 ${theme.breakdownIconColor}`}>
          <Sparkles className="w-5 h-5" />
        </div>
        
        {/* 설명 타이틀 */}
        <span className={`text-[13px] font-bold tracking-wider block ${theme.breakdownTitleColor}`}>
          단어 속 한자 하나씩 나누어 외우기
        </span>

        {/* 한자 분석 카드 리스트 */}
        <div className="space-y-3 pt-2">
          {kanjiBreakdown && kanjiBreakdown.length > 0 ? (
            kanjiBreakdown.map((kj, kjIdx) => (
              <div
                key={kjIdx}
                className={`border rounded-xl p-3 sm:p-3.5 flex items-start gap-3 transition-colors ${theme.breakdownItemBg}`}
              >
                {/* 낱개 한자 클릭 패널 (클릭 시 개별 음성 재생) */}
                <div
                  onClick={() => speakJapanese(kj.kanji)}
                  lang="ja"
                  className={`text-xl font-serif font-black rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${theme.breakdownKanjiBox}`}
                  title="클릭하여 발음 듣기"
                >
                  {kj.kanji}
                </div>
                
                {/* 한자 뜻과 암기 설명글 */}
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${theme.breakdownKanjiMeaning}`}>
                      {kj.meaning}
                    </span>
                  </div>
                  <p className={`text-[11px] sm:text-xs leading-relaxed font-sans font-medium ${theme.breakdownMnemonicText}`}>
                    {kj.mnemonic}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // 분해 정보가 없는 경우 표시할 예외 문구
            <p className={`text-xs italic ${theme.breakdownEmptyText}`}>
              한자 분해 정보를 찾을 수 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
