import { BookOpen, HelpCircle, Volume2 } from "lucide-react";

// 탭 헤더 Props 인터페이스
interface NewsTabHeaderProps {
  activeTab: "subtitles" | "vocab" | "quiz";              // 현재 활성 탭
  setActiveTab: (tab: "subtitles" | "vocab" | "quiz") => void; // 탭 변경 콜백 함수
  vocabCount: number;                                     // 중요 단어 총개수
}

// 뉴스 학습 3단계 전환 탭 헤더 컴포넌트
export function NewsTabHeader({
  activeTab,
  setActiveTab,
  vocabCount
}: NewsTabHeaderProps) {
  return (
    <div className="flex border-b border-slate-200">
      {/* 탭 1. 자막 전체 보기 */}
      <button
        onClick={() => setActiveTab("subtitles")}
        className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
          activeTab === "subtitles"
            ? "border-rose-500 text-rose-600 bg-rose-50/10"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>자막 전체 보기</span>
      </button>

      {/* 탭 2. 중요 단어 카드 */}
      <button
        onClick={() => setActiveTab("vocab")}
        className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
          activeTab === "vocab"
            ? "border-rose-500 text-rose-600 bg-rose-50/10"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
        }`}
      >
        <Volume2 className="w-4 h-4" />
        <span>중요 단어 카드 ({vocabCount})</span>
      </button>

      {/* 탭 3. 뉴스 퀴즈 풀기 */}
      <button
        onClick={() => setActiveTab("quiz")}
        className={`flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
          activeTab === "quiz"
            ? "border-rose-500 text-rose-600 bg-rose-50/10"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
        }`}
      >
        <HelpCircle className="w-4 h-4" />
        <span>뉴스 퀴즈 풀기</span>
      </button>
    </div>
  );
}
