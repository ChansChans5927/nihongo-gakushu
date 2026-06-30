// 헤더 Props 인터페이스 정의
interface KanjiCardHeaderProps {
  currentIndex: number;    // 현재 한자 인덱스 (0-based)
  grade: string;           // 상용 한자 등 학년 등급 정보
  jlptLevel: string;       // JLPT 해당 등급 (N1~N5)
  theme: any;              // 적용된 테마 객체
}

// 한자 카드 상단 바 컴포넌트 (인덱스 표기 및 등급 배지들)
export function KanjiCardHeader({
  currentIndex,
  grade,
  jlptLevel,
  theme
}: KanjiCardHeaderProps) {
  const formattedIndex = String(currentIndex + 1).padStart(4, '0');

  return (
    <div className={`px-5 py-3.5 flex items-center justify-between z-10 relative ${theme.cardHeaderBg}`}>
      {/* 4자리 한자 인덱스 번호 */}
      <span className={`font-mono text-xs font-bold ${theme.cardIndexText}`}>
        INDEX #{formattedIndex}
      </span>
      
      {/* 한자 정보 배지 목록 (학년 등급 및 JLPT 등급) */}
      <div className="flex items-center gap-1.5">
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${theme.badgeGradeBg}`}>
          GRADE: {grade}
        </span>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${theme.badgeBg}`}>
          JLPT: {jlptLevel}
        </span>
      </div>
    </div>
  );
}
