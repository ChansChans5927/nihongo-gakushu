import { BookOpen } from "lucide-react";

// 게이지 바 컴포넌트의 Props 인터페이스 정의
interface VocabProgressBarProps {
  currentIndex: number;    // 현재 학습 중인 단어의 인덱스 (0-based)
  totalCount: number;      // 전체 단어 수
  theme: any;              // 적용된 디자인 테마 객체
}

// 상단 단어 암기 진행률 게이지 바 컴포넌트
export function VocabProgressBar({
  currentIndex,
  totalCount,
  theme
}: VocabProgressBarProps) {
  // 1부터 시작하는 순서 및 퍼센트 계산
  const displayIndex = currentIndex + 1;
  const progressPercent = totalCount > 0 ? Math.round((displayIndex / totalCount) * 100) : 0;

  return (
    <div className="space-y-2">
      {/* 진행 상황 요약 정보 텍스트 영역 */}
      <div className={`flex items-center justify-between text-xs font-semibold ${theme.headerTextColor}`}>
        <span className="flex items-center gap-1">
          <BookOpen className={`w-4 h-4 ${theme.headerIconColor}`} />
          <span>단어 암기 진행률</span>
        </span>
        <span className="font-mono">
          {displayIndex} / {totalCount} 단어 ({progressPercent}%)
        </span>
      </div>
      
      {/* 진행 상황 시각적 게이지 바 */}
      <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressTrackBg}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${theme.progressBarBg}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
