import { Award } from "lucide-react";

// 진행률 게이지 바 Props 인터페이스
interface JlptProgressBarProps {
  currentIndex: number;    // 현재 질문 인덱스 (0-based)
  totalCount: number;      // 전체 질문 개수
  level: string;           // JLPT 등급 (예: N1, N2)
  theme: any;              // 테마 스타일 객체
}

// JLPT 시험 진행률 상단 게이지 바 컴포넌트
export function JlptProgressBar({
  currentIndex,
  totalCount,
  level,
  theme
}: JlptProgressBarProps) {
  const displayIndex = currentIndex + 1;
  const progressPercent = totalCount > 0 ? Math.round((displayIndex / totalCount) * 100) : 0;

  return (
    <div className="space-y-2">
      {/* 텍스트 진행률 가이드 */}
      <div className={`flex items-center justify-between text-xs font-semibold ${theme.headerTextColor}`}>
        <span className="flex items-center gap-1">
          <Award className={`w-4 h-4 ${theme.headerIconColorKanji}`} />
          <span>JLPT {level} 모의 테스트</span>
        </span>
        <span className="font-mono">
          진행률: {displayIndex} / {totalCount} 문제 ({progressPercent}%)
        </span>
      </div>
      
      {/* 게이지 바 트랙 */}
      <div className={`w-full h-2 rounded-full overflow-hidden ${theme.progressTrackBgJlpt}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${theme.progressBarBgJlpt}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
