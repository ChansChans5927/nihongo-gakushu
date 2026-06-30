import { BookOpen } from "lucide-react";

// 게이지 바 Props 인터페이스 정의
interface KanjiProgressBarProps {
  currentIndex: number;    // 현재 학습 중인 한자 인덱스 (0-based)
  totalCount: number;      // 전체 한자 개수
  theme: any;              // 적용된 테마 객체
}

// 한자 학습 상단 진도 게이지 바 컴포넌트
export function KanjiProgressBar({
  currentIndex,
  totalCount,
  theme
}: KanjiProgressBarProps) {
  const displayIndex = currentIndex + 1;
  const progressPercent = totalCount > 0 ? Math.round((displayIndex / totalCount) * 100) : 0;

  return (
    <div className="space-y-2">
      {/* 진행 상황 수치 요약 텍스트 */}
      <div className={`flex items-center justify-between text-xs font-semibold ${theme.headerTextColor}`}>
        <span className="flex items-center gap-1">
          <BookOpen className={`w-4 h-4 ${theme.headerIconColorKanji}`} />
          <span>한자 암기 진행률</span>
        </span>
        <span className="font-mono">
          {displayIndex} / {totalCount} 한자 ({progressPercent}%)
        </span>
      </div>
      
      {/* 백그라운드 진행 트랙 및 프로그레스 바 */}
      <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressTrackBg}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${theme.progressBarBg}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
