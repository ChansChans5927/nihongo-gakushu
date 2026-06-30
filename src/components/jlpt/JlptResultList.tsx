import { CheckCircle2, HelpCircle, XCircle, Sparkles } from "lucide-react";
import { JlptQuestion } from "../../types";

// 결과 상세 리포트 Props 인터페이스
interface JlptResultListProps {
  questions: JlptQuestion[];                     // 문제 객체 리스트
  answers: { [questionId: string]: number };     // 사용자의 답안 키-값 맵
  theme: any;                                    // 테마 스타일 객체
}

// 시험 완료 후 출력되는 개별 기출문제 오답/정답 해설 보고서 리스트 컴포넌트
export function JlptResultList({
  questions,
  answers,
  theme
}: JlptResultListProps) {
  return (
    <div className="space-y-4">
      {/* 분석 타이틀 헤더 */}
      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
        <HelpCircle className="w-4 h-4 text-amber-500" />
        <span>틀린 문제 상세 분석 및 맞춤형 오답 해설 리포트</span>
      </h4>

      {/* 개별 문항 해설 카드 순차 렌더링 */}
      {questions.map((q, idx) => {
        const ansIdx = answers[q.id];
        const isCorrect = ansIdx === q.correctIndex;
        const parts = q.questionSentence.split("__");

        return (
          <div
            key={q.id}
            className={`bg-white border rounded-2xl overflow-hidden p-4 sm:p-5 space-y-4 transition-all ${
              isCorrect
                ? "border-emerald-200/60 shadow-xs"
                : "border-red-200 shadow-sm"
            }`}
          >
            {/* 문항 번호 및 정답 여부 라벨 */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-400">
                기출문제 #{idx + 1}
              </span>

              {isCorrect ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  정답
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 px-2 py-0.5 rounded font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  정답 오선택
                </span>
              )}
            </div>

            {/* 문제의 일본어 원본 문장 렌더링 (빈칸 정답 단어로 대치 및 조사 강조 표시) */}
            <div className="space-y-2">
              <div lang="ja" className="text-lg font-semibold text-slate-800 tracking-wide font-sans leading-relaxed py-3 bg-slate-50 border border-slate-100 rounded-xl px-4 select-all">
                {parts.map((p, pIdx) => {
                  if (pIdx % 2 === 1) {
                    if (p.toLowerCase() === "blank") {
                      // 빈칸 자리에 정답 단어를 밀어넣어 완전한 문장으로 표시
                      return (
                        <strong key={pIdx} className="text-emerald-600 font-extrabold underline underline-offset-4 decoration-emerald-500 mx-1">
                          {q.targetWord}
                        </strong>
                      );
                    } else {
                      // 키워드 강조 처리
                      return (
                        <strong key={pIdx} className="text-amber-600 font-extrabold mx-0.5">
                          {p}
                        </strong>
                      );
                    }
                  }
                  return p;
                })}
              </div>
              {/* 번역 한글 해석 제공 */}
              <p className="text-xs text-slate-500 font-medium italic">
                * 해석 : {q.translation}
              </p>
            </div>

            {/* 문항 질문 텍스트 */}
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-slate-800">
                Q. {q.questionText.replace(/__/g, "")}
              </h5>
            </div>

            {/* 실제 정답보기와 사용자가 마킹한 답을 나열하는 레이아웃 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* 올바른 정답 보기 */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5 border border-slate-100">
                <span className="text-slate-400 font-medium block">정답보기</span>
                <span lang="ja" className="font-bold text-emerald-800">
                  {q.choices[q.correctIndex]}
                </span>
              </div>

              {/* 사용자가 답안 제출한 마킹 보기 */}
              <div className={`p-3 rounded-xl space-y-0.5 border ${
                isCorrect
                  ? "bg-slate-50 border-slate-100"
                  : "bg-red-50/50 border-red-100"
              }`}>
                <span className="text-slate-400 font-medium block">내가 고른 답</span>
                <span lang="ja" className={`font-semibold ${isCorrect ? "text-slate-800" : "text-red-700 font-bold"}`}>
                  {ansIdx !== undefined
                    ? q.choices[ansIdx]
                    : "응답 없음"}
                </span>
              </div>
            </div>

            {/* 한자 해설 분석 상자 (AI가 분석한 정밀 풀이) */}
            <div className="bg-slate-50 border-l-4 border-amber-500 rounded-r-xl p-3 sm:p-4 space-y-2 text-xs leading-relaxed">
              <div className="flex items-center gap-1 text-slate-900 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>기출 분석 핵심 해설</span>
              </div>
              <p className="text-slate-700 font-medium bg-white p-3 rounded-lg border border-slate-200">
                {q.explanation}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
