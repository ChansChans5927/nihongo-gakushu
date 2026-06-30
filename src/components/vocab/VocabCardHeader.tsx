// 헤더 컴포넌트의 Props 인터페이스 정의
interface VocabCardHeaderProps {
  currentIndex: number;    // 현재 학습 중인 단어의 인덱스 (0-based)
  pos: string;             // 단어의 품사 (예: 명사, 동사 등)
  theme: any;              // 적용된 디자인 테마 객체
}

// 단어 카드의 상단 바 컴포넌트 (인덱스 번호 및 품사 배지 표기)
export function VocabCardHeader({
  currentIndex,
  pos,
  theme
}: VocabCardHeaderProps) {
  // 인덱스 번호를 4자리 포맷(예: #0001)으로 패딩
  const formattedIndex = String(currentIndex + 1).padStart(4, '0');

  return (
    <div className={`px-5 py-3.5 flex items-center justify-between z-10 relative ${theme.cardHeaderBg}`}>
      {/* 4자리 단어 인덱스 넘버 */}
      <span className={`font-mono text-xs font-bold ${theme.cardIndexText}`}>
        VOCAB INDEX #{formattedIndex}
      </span>
      
      {/* 단어 품사(Part of Speech) 정보 배지 */}
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${theme.badgeBg}`}>
          {pos}
        </span>
      </div>
    </div>
  );
}
