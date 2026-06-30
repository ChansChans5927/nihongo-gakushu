import { Sparkles } from "lucide-react";
import { RadicalPart } from "../../types";

// 부수 분해 Props 인터페이스 정의
interface KanjiRadicalsBreakdownProps {
  radicals?: RadicalPart[];                // 부수 배열 목록
  setActiveRadical: (rad: RadicalPart) => void; // 모달 활성화 상태 업데이트 함수
  theme: any;                              // 적용된 테마 객체
}

// 한자의 부수 조각들을 나열하여 뜻과 기원을 보여주는 부수 분리 패널 컴포넌트
export function KanjiRadicalsBreakdown({
  radicals,
  setActiveRadical,
  theme
}: KanjiRadicalsBreakdownProps) {
  return (
    <div className={`rounded-2xl p-4 space-y-3 z-10 relative w-full ${theme.radicalsBoxBg}`}>
      {/* 부수 영역 설명 정보 라벨 */}
      <span className={`text-[10px] font-bold tracking-wider block uppercase ${theme.questionInstructionColor}`}>
        🧩 구성 자형 분해 (각 부수를 클릭하여 어원과 의미를 확인해 보세요)
      </span>
      
      {/* 부수들을 격자(Grid) 구조로 렌더링 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {radicals && radicals.length > 0 && radicals.map((rad, radIdx) => {
          // 세부 정보(음독/훈독/암기스토리 등)가 존재하는지 검증
          const hasDetails = !!(rad.mnemonic || rad.onyomi || rad.hunyomi);
          
          return (
            <div
              key={radIdx}
              onClick={() => {
                if (hasDetails) {
                  setActiveRadical(rad);
                }
              }}
              className={`group rounded-xl p-3 transition-all flex items-center justify-between cursor-pointer ${theme.radicalItemBg}`}
              title={hasDetails ? "클릭하여 어원 파해 및 상세 연상 암기 비법 보기" : ""}
            >
              {/* 좌측 부수 자형 문자 및 명칭 */}
              <div className="flex items-center gap-3 overflow-hidden">
                <span lang="ja" className={`text-lg font-serif font-black rounded-lg w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-all shrink-0 ${theme.radicalKanjiBox}`}>
                  {rad.component}
                </span>
                <div className="flex flex-col truncate">
                  <span className={`text-xs font-bold font-sans ${theme.radicalKanjiMeaning}`}>
                    {rad.meaning}
                  </span>
                  {rad.mnemonic && (
                    <p className={`text-[10px] font-sans truncate mt-0.5 ${theme.relatedWordSubText}`}>
                      {rad.mnemonic}
                    </p>
                  )}
                </div>
              </div>

              {/* 세부 보기 클릭을 돕는 배지 (어원이 있는 경우만) */}
              {hasDetails && (
                <div className={`flex items-center gap-1 text-[9px] font-black rounded-full px-2 py-0.5 shrink-0 transition-colors ${theme.radicalItemBadge}`}>
                  <Sparkles className={`w-2.5 h-2.5 ${theme.radicalItemBadgeIcon}`} />
                  <span>파해 보기</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
