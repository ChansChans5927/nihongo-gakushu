import { Sparkles } from "lucide-react";

// 연상 암기 패널 Props 인터페이스 정의
interface KanjiMnemonicPanelProps {
  mnemonic: string;  // 연상 암기 스토리
  theme: any;        // 적용된 테마 객체
}

// 한자 핵심 이미지 연상 암기 설명 블록 컴포넌트
export function KanjiMnemonicPanel({
  mnemonic,
  theme
}: KanjiMnemonicPanelProps) {
  return (
    <div className={`rounded-2xl p-4 space-y-2 relative z-10 w-full ${theme.mnemonicPanelBg}`}>
      {/* 우측 상단 반짝이 아이콘 데코레이션 */}
      <div className={`absolute top-2.5 right-2 ${theme.mnemonicIconColor}`}>
        <Sparkles className="w-5 h-5" />
      </div>
      
      {/* 라벨 헤더 */}
      <span className={`text-[10px] font-bold tracking-wider block ${theme.mnemonicTitleColor}`}>
        💡 핵심 이미지 연상 암기 키워드
      </span>
      
      {/* 연상 내용 본문 */}
      <p className={`text-sm sm:text-base font-medium leading-relaxed ${theme.radicalKanjiMeaning}`}>
        {mnemonic}
      </p>
    </div>
  );
}
