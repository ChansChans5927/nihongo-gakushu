import { CheckCircle, HelpCircle, XCircle, Trophy, Lightbulb } from "lucide-react";
import { Question } from "../../types";

// 퀴즈 탭 Props 인터페이스
interface NewsQuizTabProps {
  quizzes: Question[];                                                  // 퀴즈 문제 배열
  quizAnswers: { [id: number]: number };                                // 마킹한 답안 목록
  quizGraded: boolean;                                                  // 채점 완료 여부
  quizScore: number;                                                    // 맞은 문제수
  handleSelectAnswer: (quizId: number, choiceIndex: number) => void;    // 보기 클릭 이벤트 콜백 함수
  handleGrade: () => void;                                              // 채점하기 완료 함수
  handleReset: () => void;                                              // 다시 풀기 초기화 함수
}

// 탭 3: 뉴스 내용 확인 및 어휘 평가 퀴즈 영역
export function NewsQuizTab({
  quizzes,
  quizAnswers,
  quizGraded,
  quizScore,
  handleSelectAnswer,
  handleGrade,
  handleReset
}: NewsQuizTabProps) {
  
  // 문제를 다 채웠는지(제출 가능한지) 판정하는 상태 값
  const isAllAnswered = Object.keys(quizAnswers).length < quizzes.length;

  return (
    <div className="space-y-6 text-left">
      {/* 퀴즈 기본 안내 바 */}
      {!quizGraded && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-center justify-between text-xs text-slate-500 gap-2">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>뉴스 속 핵심 표현과 중요 어휘의 맥락을 점검하는 확인 퀴즈입니다.</span>
          </span>
          <span className="font-bold text-rose-500 shrink-0">총 {quizzes.length}문제</span>
        </div>
      )}

      {/* 채점 완료 후 점수 공개 요약 판 */}
      {quizGraded && (
        <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-6 rounded-3xl text-white text-center space-y-2 shadow-sm">
          <h3 className="text-xl font-bold flex items-center justify-center gap-1.5">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span>퀴즈 풀이 결과</span>
          </h3>
          <p className="text-2xl font-black">
            {quizScore} / {quizzes.length} 문제 맞춤!
          </p>
          <p className="text-xs text-emerald-100">
            틀린 오답 카드는 아래 해설을 통해 다시 한 번 확인해 보세요.
          </p>
          <button
            onClick={handleReset}
            className="mt-3 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
          >
            다시 풀기
          </button>
        </div>
      )}

      {/* 퀴즈 질문 리스트 루프 */}
      <div className="space-y-6">
        {quizzes.map((q, qIdx) => {
          const selectedIdx = quizAnswers[q.id];
          const isCorrect = selectedIdx === q.correctIndex;
          
          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                quizGraded
                  ? isCorrect
                    ? "bg-emerald-50/30 border-emerald-200"
                    : "bg-red-50/30 border-red-200"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* 문제 번호 및 문제 분류 태그 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Q {qIdx + 1}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  q.type === 'meaning' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-purple-600 bg-purple-50'
                }`}>
                  {q.type === 'meaning' ? '뜻' : '발음'}
                </span>
              </div>

              {/* 핵심 타깃 단어 배지 */}
              {q.targetWord && (
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/50 mb-3 text-center">
                  <span className="text-xl font-black text-slate-900">{q.targetWord}</span>
                </div>
              )}

              {/* 한글 질문 텍스트 */}
              <p className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">
                {q.targetWord ? (
                  q.questionText
                    .replace(new RegExp(`단어 '${q.targetWord}'의`, 'g'), '위 단어의')
                    .replace(new RegExp(`단어 '${q.targetWord}'`, 'g'), '위 단어')
                    .replace(new RegExp(`한자 '${q.targetWord}'의`, 'g'), '위 한자의')
                    .replace(new RegExp(`한자 '${q.targetWord}'`, 'g'), '위 한자')
                ) : q.questionText}
              </p>

              {/* 4지선다 보기 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.choices.map((choice, cIdx) => {
                  const isChoiceSelected = selectedIdx === cIdx;
                  const isCurrentCorrect = cIdx === q.correctIndex;

                  let btnStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white";
                  let iconEl = null;

                  // 1. 아직 채점 전인 경우 스타일 분기
                  if (isChoiceSelected) {
                    btnStyle = "border-rose-500 bg-rose-50/50 text-rose-700 font-semibold";
                  }

                  // 2. 채점 완료 후 결과 스타일 강제 변환
                  if (quizGraded) {
                    if (isCurrentCorrect) {
                      // 정답 표시 (녹색 바탕)
                      btnStyle = "border-emerald-500 bg-emerald-500 text-white font-bold";
                      iconEl = <CheckCircle className="w-4 h-4 shrink-0" />;
                    } else if (isChoiceSelected && !isCorrect) {
                      // 오선택 오답 표시 (적색 바탕)
                      btnStyle = "border-red-500 bg-red-500 text-white font-bold";
                      iconEl = <XCircle className="w-4 h-4 shrink-0" />;
                    } else {
                      // 선택되지 않은 무관한 보기 (투명화 처리)
                      btnStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={cIdx}
                      onClick={() => handleSelectAnswer(q.id, cIdx)}
                      disabled={quizGraded}
                      className={`p-3 text-xs text-left rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                    >
                      <span>{choice}</span>
                      {iconEl}
                    </button>
                  );
                })}
              </div>

              {/* 채점 완료 후 기출 해설 텍스트 상자 노출 */}
              {quizGraded && q.explanation && (
                <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed flex items-start gap-1.5 ${isCorrect ? "bg-emerald-50/50 text-emerald-800" : "bg-red-50/50 text-red-800"}`}>
                  <Lightbulb className={`w-4 h-4 shrink-0 ${isCorrect ? "text-emerald-600" : "text-red-500"}`} />
                  <div>
                    <strong>정답 해설:</strong> {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 최종 제출(채점 완료) 버튼 */}
      {!quizGraded && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGrade}
            disabled={isAllAnswered}
            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-sm font-bold py-3 px-8 rounded-2xl shadow-md transition-all cursor-pointer border-none"
          >
            채점 완료
          </button>
        </div>
      )}
    </div>
  );
}
