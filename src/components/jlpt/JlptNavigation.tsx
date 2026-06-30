import { ArrowRight, Award } from "lucide-react";

// 내비게이션 Props 인터페이스
interface JlptNavigationProps {
  currentIndex: number;          // 현재 문항 인덱스 (0-based)
  totalCount: number;            // 전체 문항 개수
  handlePrev: () => void;        // '이전 문제' 클릭 핸들러
  handleNext: () => void;        // '다음 문제' 클릭 핸들러
  handleGrade: () => void;       // '시험 채점하기' 클릭 핸들러
  theme: any;                    // 테마 스타일 객체
}

// 시험지 하단 이전/다음 문제 컨트롤러 바 컴포넌트
export function JlptNavigation({
  currentIndex,
  totalCount,
  handlePrev,
  handleNext,
  handleGrade,
  theme
}: JlptNavigationProps) {
  const isLastQuestion = currentIndex === totalCount - 1;

  return (
    <div className={`pt-4 flex items-center justify-between relative z-10 border-t ${theme.footerBg.replace('border-t', '')}`}>
      {/* 이전 문제 버튼 (첫 번째 문제일 때 비활성화) */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`py-2.5 px-4 disabled:opacity-35 text-xs font-semibold border transition-colors disabled:cursor-not-allowed cursor-pointer ${theme.btnSecondaryJlpt}`}
      >
        이전 문제
      </button>

      {/* 다음 문제 버튼 혹은 시험 채점 버튼 */}
      <div className="flex items-center gap-2">
        {!isLastQuestion ? (
          // 마지막 문제 이전까지는 '다음 문제' 버튼 제공
          <button
            onClick={handleNext}
            className={`py-2.5 px-5 text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1 cursor-pointer ${theme.btnNextJlpt}`}
          >
            <span>다음 문제</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          // 마지막 문항일 경우에는 '시험 채점하기' 완료 버튼 제공
          <button
            onClick={handleGrade}
            className={`py-3 px-6 text-sm font-bold rounded-xl shadow-md transition-all scale-100 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer ${theme.btnGradeJlpt}`}
          >
            <Award className={`w-4 h-4 ${theme.isSamurai ? "text-amber-200" : "text-white"}`} />
            <span>시험 채점하기</span>
          </button>
        )}
      </div>
    </div>
  );
}
