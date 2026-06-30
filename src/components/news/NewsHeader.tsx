import { ArrowLeft } from "lucide-react";

// 뉴스 헤더 Props 인터페이스
interface NewsHeaderProps {
  title: string;           // 뉴스 제목
  handleGoHome: () => void; // 대시보드(홈)로 복귀 함수
}

// 뉴스 학습 화면 상단 타이틀 바 컴포넌트
export function NewsHeader({
  title,
  handleGoHome
}: NewsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
      {/* 학습 카테고리 태그 및 뉴스 대제목 */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
          NEWS STUDY
        </span>
        <h2 className="text-base sm:text-xl font-bold text-slate-800 mt-2 font-display">
          {title}
        </h2>
      </div>
      
      {/* 대시보드로 돌아가기 액션 버튼 */}
      <button
        onClick={handleGoHome}
        className="shrink-0 whitespace-nowrap flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-2xl transition-all cursor-pointer border-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>대시보드로</span>
      </button>
    </div>
  );
}
