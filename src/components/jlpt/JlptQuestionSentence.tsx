// 질문 문장 박스 Props 인터페이스
interface JlptQuestionSentenceProps {
  questionSentence: string;  // 빈칸 채우기 기호(__)를 포함한 일어 문장
  theme: any;                // 테마 스타일 객체
}

// 시험지 내 핵심 제시 일본어 예문 렌더링 컴포넌트 (빈칸 채우기 및 강조 블록 분기)
export function JlptQuestionSentence({
  questionSentence,
  theme
}: JlptQuestionSentenceProps) {
  // "__" 구분자를 기준으로 문장을 분할하여 처리
  const parts = questionSentence.split("__");

  return (
    <div lang="ja" className={`text-lg sm:text-2xl font-semibold tracking-wide leading-relaxed text-center py-4 sm:py-6 px-3 border rounded-xl sm:rounded-2xl select-all ${theme.questionSentenceBox}`}>
      {parts.map((p, idx) => {
        // 인덱스가 홀수인 경우가 빈칸 혹은 강조 표시 대상 부분
        if (idx % 2 === 1) {
          if (p.toLowerCase() === "blank") {
            // 빈칸 채우기형 문항의 경우 점선 박스로 대체
            return (
              <span
                key={idx}
                lang="ko"
                className={`inline-flex items-center border-2 border-dashed px-3 py-1 rounded-xl text-xs tracking-widest font-bold mx-1 animate-pulse select-none ${theme.blankFillBlock}`}
              >
                ( 빈칸에 들어갈 말 )
              </span>
            );
          } else {
            // 특정 단어 독음/의미를 묻는 문항의 경우 형광 블록 강조 처리
            return (
              <span
                key={idx}
                className={`font-bold px-2 py-0.5 rounded-lg border shadow-xs mx-1 ${theme.highlightWordBlock}`}
              >
                {p}
              </span>
            );
          }
        }
        // 인덱스가 짝수인 일반 텍스트 부분
        return p;
      })}
    </div>
  );
}
