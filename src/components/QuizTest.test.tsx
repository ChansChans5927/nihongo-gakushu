import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuizTest } from "./QuizTest";
import { Question } from "../types";

const mockQuestions: Question[] = [
  {
    id: 1,
    type: "meaning",
    questionText: "「見」의 한국어 뜻은 무엇일까요?",
    choices: ["볼 견", "들일 입", "날 일", "달 월"],
    correctIndex: 0,
    kanjiItem: {
      id: "kanji_1",
      kanji: "見",
      strokeCount: 7,
      jlptLevel: "N5",
      grade: "초등 1학년",
      mnemonic: "눈 위에 다리가 달린 모양으로 보다",
      meaning: "볼 견",
      onyomi: "けん",
      onyomiKorean: "켄",
      hunyomi: "み.る",
      hunyomiKorean: "미루",
      relatedWords: [],
      exampleSentence: {
        japanese: "見る",
        hiragana: "みる",
        pronunciation: "미루",
        meaning: "보다",
      },
    },
  },
  {
    id: 2,
    type: "blank_fill",
    questionText: "제시된 일본어 예문의 빈칸에 들어갈 알맞은 단어는 무엇일까요?",
    questionSentence: "日本語を__blank__します。",
    choices: ["勉強", "遊び", "仕事", "食事"],
    correctIndex: 0,
  },
];

describe("QuizTest Component", () => {
  it("renders correctly with the first question and its options", () => {
    render(
      <QuizTest
        questions={mockQuestions}
        currentQuestionIndex={0}
        userAnswers={{}}
        handleSelectAnswer={vi.fn()}
        handlePrevQuestion={vi.fn()}
        handleNextQuestion={vi.fn()}
        handleGradeQuiz={vi.fn()}
      />
    );

    // 질문이 렌더링되었는지 확인
    expect(screen.getByText("「見」의 한국어 뜻은 무엇일까요?")).toBeInTheDocument();
    
    // 보기들이 렌더링되었는지 확인
    expect(screen.getByText("볼 견")).toBeInTheDocument();
    expect(screen.getByText("들일 입")).toBeInTheDocument();
    expect(screen.getByText("날 일")).toBeInTheDocument();
    expect(screen.getByText("달 월")).toBeInTheDocument();
  });

  it("calls handleSelectAnswer when a choice is clicked", () => {
    const handleSelectAnswer = vi.fn();
    render(
      <QuizTest
        questions={mockQuestions}
        currentQuestionIndex={0}
        userAnswers={{}}
        handleSelectAnswer={handleSelectAnswer}
        handlePrevQuestion={vi.fn()}
        handleNextQuestion={vi.fn()}
        handleGradeQuiz={vi.fn()}
      />
    );

    // 첫 번째 보기("볼 견")를 클릭
    fireEvent.click(screen.getByText("볼 견"));
    expect(handleSelectAnswer).toHaveBeenCalledWith(0);
  });

  it("calls handleNextQuestion when next button is clicked on non-final question", () => {
    const handleNextQuestion = vi.fn();
    render(
      <QuizTest
        questions={mockQuestions}
        currentQuestionIndex={0}
        userAnswers={{}}
        handleSelectAnswer={vi.fn()}
        handlePrevQuestion={vi.fn()}
        handleNextQuestion={handleNextQuestion}
        handleGradeQuiz={vi.fn()}
      />
    );

    // '다음 문제' 버튼 클릭
    fireEvent.click(screen.getByText("다음 문제"));
    expect(handleNextQuestion).toHaveBeenCalled();
  });

  it("renders 'Grade' button and calls handleGradeQuiz on the final question", () => {
    const handleGradeQuiz = vi.fn();
    render(
      <QuizTest
        questions={mockQuestions}
        currentQuestionIndex={1} // 마지막 질문 (인덱스 1)
        userAnswers={{ 1: 0, 2: 0 }}
        handleSelectAnswer={vi.fn()}
        handlePrevQuestion={vi.fn()}
        handleNextQuestion={vi.fn()}
        handleGradeQuiz={handleGradeQuiz}
      />
    );

    // '채점하기' 버튼이 렌더링되었는지 확인 및 클릭
    const gradeButton = screen.getByText("채점하기");
    expect(gradeButton).toBeInTheDocument();
    fireEvent.click(gradeButton);
    expect(handleGradeQuiz).toHaveBeenCalled();
  });
});
