import { CheckCircle2, RefreshCw } from "lucide-react";
import { NativeBridge } from "../../nativeBridge";


// 결과 성적판 Props 인터페이스
interface JlptResultScoreProps {
  correctCount: number;          // 맞은 개수
  totalCount: number;            // 전체 개수
  level: string;                 // 시험 등급 (예: N3)
  isJlptLoading: boolean;        // 다시 풀기 로딩 여부
  startJlptQuiz: () => void;     // 한 번 더 응시 핸들러
  handleGoHome: () => void;      // 모의 테스트 목록 홈으로 이동 핸들러
  theme: any;                    // 테마 스타일 객체
}

// 시험 완료 후 출력되는 성적 요약 및 재시도 액션 영역 컴포넌트
export function JlptResultScore({
  correctCount,
  totalCount,
  level,
  isJlptLoading,
  startJlptQuiz,
  handleGoHome,
  theme
}: JlptResultScoreProps) {
  // 백분율 점수 계산
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs text-center space-y-4 relative transition-colors duration-300 ${theme.cardContainer}`}>
      {/* 상단 무지개 색상 데코레이션 탑라인 */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500" />

      {/* 점수 텍스트를 담은 동그라미 판 */}
      <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center relative border ${theme.wordPanelBg} ${theme.tableBorder}`}>
        <div className={`text-2xl font-display font-extrabold font-mono whitespace-nowrap ${theme.breakdownKanjiMeaning}`}>
          {correctCount} / {totalCount}
        </div>
        <div className={`absolute -bottom-1 -right-1 rounded-full p-1 shadow ${scorePercent >= 80 ? 'bg-emerald-500 text-white' : scorePercent >= 40 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 성적 요약 텍스트 설명글 */}
      <div className="space-y-1">
        <h3 className={`text-2xl font-bold transition-colors duration-300 ${theme.breakdownKanjiMeaning}`}>
          JLPT {level} 모의 테스트 성적 : {scorePercent}점!
        </h3>
        <p className={`text-sm max-w-md mx-auto leading-relaxed transition-colors duration-300 ${theme.wordSubText}`}>
          {scorePercent === 100
            ? "대단합니다! 해당 레벨의 핵심 어휘를 완벽히 마스터하셨습니다. 다음 등급에도 도전해 보세요!"
            : "오답 해설을 통해 헷갈렸던 어휘를 정리해 보세요. 고빈도 단어는 합격의 가장 든든한 기초가 됩니다."}
        </p>
      </div>

      {/* 액션 버튼 컨트롤러 (한 번 더 풀기 / 홈으로 가기) */}
      <div className="pt-2 flex justify-center gap-3">
        {/* 한 번 더 풀기 버튼 */}
        <button
          onClick={() => {
            NativeBridge.showInterstitialAd();
            startJlptQuiz();
          }}
          disabled={isJlptLoading}
          className={`py-2.5 px-5 text-xs font-bold rounded-xl transition-all shadow hover:shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-45 ${theme.btnPrimary}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isJlptLoading ? "animate-spin" : ""}`} />
          <span>한 번 더 응시하기</span>
        </button>

        {/* 세트 목록 홈으로 이동 버튼 */}
        <button
          onClick={() => {
            NativeBridge.showInterstitialAd();
            handleGoHome();
          }}
          className={`py-2.5 px-5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${theme.btnSecondary}`}
        >
          모의 테스트 목록으로
        </button>
      </div>
    </div>
  );
}
