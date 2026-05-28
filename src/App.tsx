import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookMarked, BookOpen, CheckCircle2, User, LogOut } from "lucide-react";
import { KanjiItem, Question, JlptQuestion, VocabItem, UserSession } from "./types";
import { generateQuiz, generateVocabQuiz } from "./utils";
import { useSpeech } from "./hooks/useSpeech";
import { MainConfig } from "./components/MainConfig";
import { KanjiStudy } from "./components/KanjiStudy";
import { VocabStudy } from "./components/VocabStudy";
import { QuizTest } from "./components/QuizTest";
import { ResultReport } from "./components/ResultReport";
import { JlptTest } from "./components/JlptTest";
import { AuthCard } from "./components/AuthCard";

export default function App() {
  // App Phase States: 'config' | 'studying' | 'testing' | 'result'
  const [phase, setPhase] = useState<'config' | 'studying' | 'testing' | 'result'>('config');

  // Configuration Settings
  const [kanjiCount, setKanjiCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [jlptCount, setJlptCount] = useState<number>(5);

  // Quiz and Study lists
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState<number>(0);

  // Testing States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number }>({});
  const [isGraded, setIsGraded] = useState<boolean>(false);

  // Mastered Kanji List
  const [masteredKanji, setMasteredKanji] = useState<string[]>([]);

  // Study Mode State: 'kanji' | 'vocab'
  const [studyMode, setStudyMode] = useState<'kanji' | 'vocab'>('kanji');

  // Vocab States
  const [vocabCount, setVocabCount] = useState<number>(5);
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [currentVocabIndex, setCurrentVocabIndex] = useState<number>(0);
  const [masteredVocab, setMasteredVocab] = useState<string[]>([]);
  const [vocabQuestions, setVocabQuestions] = useState<Question[]>([]);

  // JLPT Past Exam Subsystem States
  const [selectedJlptLevel, setSelectedJlptLevel] = useState<string>("N5");
  const [jlptQuestions, setJlptQuestions] = useState<JlptQuestion[]>([]);
  const [currentJlptIndex, setCurrentJlptIndex] = useState<number>(0);
  const [jlptAnswers, setJlptAnswers] = useState<{ [questionId: string]: number }>({});
  const [isJlptQuizActive, setIsJlptQuizActive] = useState<boolean>(false);
  const [isJlptGraded, setIsJlptGraded] = useState<boolean>(false);
  const [isJlptLoading, setIsJlptLoading] = useState<boolean>(false);
  const [jlptErrorMsg, setJlptErrorMsg] = useState<string | null>(null);


  // Loading & Error boundary states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>("gemini");

  // User Authentication & Review States
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  // Hook for speech synthesis
  const { textToSpeechSupported, speakJapanese } = useSpeech();

  // Load session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  // Fetch progress from MongoDB and sync with localStorage data if any
  const fetchUserProgress = async (username: string) => {
    try {
      const response = await fetch(`/api/progress/get?username=${encodeURIComponent(username)}`);
      const resData = await response.json();
      if (resData.success) {
        setMasteredKanji(resData.masteredKanjis || []);
        setMasteredVocab(resData.masteredVocabs || []);

        // Sync local storage data if user previously worked offline/without account
        const localKanji = localStorage.getItem("mastered_kanji");
        const localVocab = localStorage.getItem("mastered_vocab");
        let syncKanjis: string[] = [];
        let syncVocabs: string[] = [];

        if (localKanji) {
          try {
            const parsed = JSON.parse(localKanji);
            syncKanjis = parsed.filter((item: string) => !(resData.masteredKanjis || []).includes(item));
          } catch (e) { }
        }
        if (localVocab) {
          try {
            const parsed = JSON.parse(localVocab);
            syncVocabs = parsed.filter((item: string) => !(resData.masteredVocabs || []).includes(item));
          } catch (e) { }
        }

        if (syncKanjis.length > 0) {
          await fetch("/api/progress/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, type: "kanji", items: syncKanjis })
          });
          setMasteredKanji(prev => Array.from(new Set([...prev, ...syncKanjis])));
          localStorage.removeItem("mastered_kanji");
        }
        if (syncVocabs.length > 0) {
          await fetch("/api/progress/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, type: "vocab", items: syncVocabs })
          });
          setMasteredVocab(prev => Array.from(new Set([...prev, ...syncVocabs])));
          localStorage.removeItem("mastered_vocab");
        }
      }
    } catch (err) {
      console.error("Failed to fetch user progress from DB:", err);
    }
  };

  // Load progress when user signs in
  useEffect(() => {
    if (currentUser) {
      fetchUserProgress(currentUser.username);
    } else {
      setMasteredKanji([]);
      setMasteredVocab([]);
    }
  }, [currentUser]);

  const saveMasteredKanji = async (list: string[], newlyLearned: string[] = []) => {
    setMasteredKanji(list);
    if (currentUser && newlyLearned.length > 0) {
      try {
        const masteredDetails = kanjiList.filter(item => newlyLearned.includes(item.kanji));
        await fetch("/api/progress/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "kanji",
            items: newlyLearned,
            cardDetails: masteredDetails
          })
        });
      } catch (err) {
        console.error("Failed to save mastered kanji to DB:", err);
      }
    }
  };

  const handleResetMastery = async () => {
    if (confirm("외운 한자 내역을 전부 초기화하고 처음부터 다시 공부하시겠습니까?")) {
      setMasteredKanji([]);
      if (currentUser) {
        try {
          await fetch("/api/progress/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUser.username, type: "kanji" })
          });
        } catch (err) {
          console.error("Failed to reset progress in DB:", err);
        }
      }
    }
  };

  const saveMasteredVocab = async (list: string[], newlyLearned: string[] = []) => {
    setMasteredVocab(list);
    if (currentUser && newlyLearned.length > 0) {
      try {
        const masteredDetails = vocabList.filter(item => newlyLearned.includes(item.word));
        const masteredQuizzes = vocabQuestions.filter(q => newlyLearned.includes(q.targetWord));
        await fetch("/api/progress/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "vocab",
            items: newlyLearned,
            cardDetails: masteredDetails,
            quizDetails: masteredQuizzes
          })
        });
      } catch (err) {
        console.error("Failed to save mastered vocab to DB:", err);
      }
    }
  };

  const handleResetVocabMastery = async () => {
    if (confirm("외운 단어 내역을 전부 초기화하고 처음부터 다시 공부하시겠습니까?")) {
      setMasteredVocab([]);
      if (currentUser) {
        try {
          await fetch("/api/progress/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUser.username, type: "vocab" })
          });
        } catch (err) {
          console.error("Failed to reset progress in DB:", err);
        }
      }
    }
  };

  // Trigger Study Generation from server Express + Gemini API
  const startKanjiStudy = async (isReviewOverride?: boolean) => {
    const isReview = typeof isReviewOverride === 'boolean' ? isReviewOverride : isReviewMode;
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentKanjiIndex(0);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsGraded(false);
    setIsJlptQuizActive(false); // make sure JLPT mode is closed
    setIsReviewMode(isReview);
    setStudyMode('kanji');

    try {
      let response;
      if (isReview) {
        if (!currentUser) {
          throw new Error("로그인이 필요한 서비스입니다.");
        }
        response = await fetch("/api/progress/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "kanji"
          })
        });
      } else {
        response = await fetch("/api/kanji/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count: kanjiCount,
            level: difficulty,
            excludeKanji: masteredKanji
          }),
        });
      }

      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        setKanjiList(resData.data);
        setApiSource(resData.source || "mongodb_cache");
        setPhase('studying');
      } else {
        throw new Error(resData.errorMsg || resData.message || "한자를 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load kanji sets:", err);
      setErrorMsg(err.message || "서버 통신에 오류가 발생했거나 한자 데이터를 받아오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Vocab Study Generation from server Express + Gemini API
  const startVocabStudy = async (isReviewOverride?: boolean) => {
    const isReview = typeof isReviewOverride === 'boolean' ? isReviewOverride : isReviewMode;
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentVocabIndex(0);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsGraded(false);
    setIsJlptQuizActive(false);
    setIsReviewMode(isReview);
    setStudyMode('vocab');

    try {
      let response;
      if (isReview) {
        if (!currentUser) {
          throw new Error("로그인이 필요한 서비스입니다.");
        }
        response = await fetch("/api/progress/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser.username,
            type: "vocab"
          })
        });
      } else {
        response = await fetch("/api/vocab/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count: vocabCount,
            level: difficulty,
            excludeVocab: masteredVocab
          }),
        });
      }

      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        setVocabList(resData.data);
        setVocabQuestions(resData.quiz || []);
        setApiSource(resData.source || "mongodb_cache");
        setPhase('studying');
      } else {
        throw new Error(resData.errorMsg || resData.message || "단어를 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load vocab sets:", err);
      setErrorMsg(err.message || "서버 통신에 오류가 발생했거나 단어 데이터를 받아오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // JLPT Past Exam Study Initializer
  const startJlptQuiz = async () => {
    setIsJlptLoading(true);
    setJlptErrorMsg(null);
    setCurrentJlptIndex(0);
    setJlptAnswers({});
    setIsJlptGraded(false);
    setIsJlptQuizActive(false);

    try {
      const response = await fetch("/api/jlpt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selectedJlptLevel, count: jlptCount }),
      });
      const resData = await response.json();

      if (resData.success && resData.data && resData.data.length > 0) {
        setJlptQuestions(resData.data);
        setIsJlptQuizActive(true);
      } else {
        throw new Error(resData.errorMsg || "JLPT 기출문제를 불러오는 데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Failed to load JLPT questions:", err);
      setJlptErrorMsg(err.message || "JLPT 기출문제를 가져오는 도중 연결 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsJlptLoading(false);
    }
  };

  // Navigates study slides
  const handleNextStudy = () => {
    if (studyMode === 'vocab') {
      if (currentVocabIndex < vocabList.length - 1) {
        setCurrentVocabIndex(prev => prev + 1);
      } else {
        const nextQuestions = vocabQuestions.length > 0 ? vocabQuestions : generateVocabQuiz(vocabList);
        setQuestions(nextQuestions);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setIsGraded(false);
        setPhase('testing');
      }
    } else {
      if (currentKanjiIndex < kanjiList.length - 1) {
        setCurrentKanjiIndex(prev => prev + 1);
      } else {
        // Completed last study item -> Generate quiz questions from current list
        const generatedQuiz = generateQuiz(kanjiList);
        setQuestions(generatedQuiz);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setIsGraded(false);
        setPhase('testing');
      }
    }
  };

  const handlePrevStudy = () => {
    if (studyMode === 'vocab') {
      if (currentVocabIndex > 0) {
        setCurrentVocabIndex(prev => prev - 1);
      }
    } else {
      if (currentKanjiIndex > 0) {
        setCurrentKanjiIndex(prev => prev - 1);
      }
    }
  };

  // Handle quiz answer selection
  const handleSelectAnswer = (choiceIndex: number) => {
    if (isGraded) return; // Prevent change after grading
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: choiceIndex
    }));
  };

  // Navigate to Next Quiz / Grade quiz
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Complete & Grade Quiz
  const handleGradeQuiz = () => {
    // Check if all answered
    const unansweredCount = questions.length - Object.keys(userAnswers).length;
    if (unansweredCount > 0) {
      if (!confirm(`아직 풀지 않은 문제가 ${unansweredCount}개 있습니다. 이대로 채점하시겠습니까?`)) {
        return;
      }
    }
    setIsGraded(true);
    setPhase('result');

    if (studyMode === 'vocab') {
      const correctVocabList = questions
        .filter(q => userAnswers[q.id] === q.correctIndex && q.vocabItem)
        .map(q => q.vocabItem!.word as string);
      const finishedVocab = Array.from(new Set<string>(correctVocabList));
      const updated = Array.from(new Set<string>([...masteredVocab, ...finishedVocab]));
      saveMasteredVocab(updated, finishedVocab);
    } else {
      // Add learned Kanji to masteredKanji and save so they don't appear in "새로운 한자 코스 풀기"
      const correctKanjiList = questions
        .filter(q => userAnswers[q.id] === q.correctIndex && q.kanjiItem)
        .map(q => q.kanjiItem!.kanji as string);
      const finishedKanjis = Array.from(new Set<string>(correctKanjiList));
      const updated = Array.from(new Set<string>([...masteredKanji, ...finishedKanjis]));
      saveMasteredKanji(updated, finishedKanjis);
    }
  };

  // JLPT state handlers
  const handleSelectJlptAnswer = (choiceIndex: number) => {
    if (isJlptGraded) return;
    const currentQ = jlptQuestions[currentJlptIndex];
    setJlptAnswers(prev => ({
      ...prev,
      [currentQ.id]: choiceIndex
    }));
  };

  const handleNextJlptQuestion = () => {
    if (currentJlptIndex < jlptQuestions.length - 1) {
      setCurrentJlptIndex(prev => prev + 1);
    }
  };

  const handlePrevJlptQuestion = () => {
    if (currentJlptIndex > 0) {
      setCurrentJlptIndex(prev => prev - 1);
    }
  };

  const handleGradeJlptQuiz = () => {
    const unansweredCount = jlptQuestions.length - Object.keys(jlptAnswers).length;
    if (unansweredCount > 0) {
      if (!confirm(`아직 풀지 않은 문제가 ${unansweredCount}개 있습니다. 이대로 채점하시겠습니까?`)) {
        return;
      }
    }
    setIsJlptGraded(true);
  };

  const handleGoHomeJlpt = () => {
    setIsJlptQuizActive(false);
    setIsJlptGraded(false);
    setJlptQuestions([]);
    setJlptAnswers({});
    setJlptErrorMsg(null);
  };

  // Reset progress and go to main landing
  const handleGoHome = () => {
    setPhase('config');
    setKanjiList([]);
    setVocabList([]);
    setQuestions([]);
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      setCurrentUser(null);
      localStorage.removeItem("user");
      setIsReviewMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-950 flex flex-col">
      {/* Upper Navigation Bar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 group focus:outline-none text-left"
          >
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:rotate-12">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-display font-bold text-slate-900 tracking-tight">
                <span className="hidden sm:inline">일본어 한자 & 단어 마스터</span>
                <span className="inline sm:hidden">일본어 한자 & 단어</span>
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block font-mono tracking-wider">Mnemonic Associations & JLPT Solver</p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentUser && (
              <div className="flex items-center gap-2 mr-2 border-r border-slate-200 pr-2">
                <span className="hidden sm:inline-flex whitespace-nowrap text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <strong>{currentUser.username}</strong>님
                </span>
                <button
                  onClick={handleLogout}
                  title="로그아웃"
                  className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            {(phase === 'studying' || isJlptQuizActive) && (
              <>
                <span className="hidden sm:inline text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-mono font-medium">
                  {isJlptQuizActive
                    ? `JLPT ${selectedJlptLevel} 테스트: ${currentJlptIndex + 1} / ${jlptQuestions.length}`
                    : studyMode === 'vocab'
                      ? `공부 단계: ${currentVocabIndex + 1} / ${vocabList.length}`
                      : `공부 단계: ${currentKanjiIndex + 1} / ${kanjiList.length}`}
                </span>
                <span className="inline sm:hidden text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {isJlptQuizActive
                    ? `JLPT ${selectedJlptLevel}: ${currentJlptIndex + 1}/${jlptQuestions.length}`
                    : studyMode === 'vocab'
                      ? `공부: ${currentVocabIndex + 1}/${vocabList.length}`
                      : `공부: ${currentKanjiIndex + 1}/${kanjiList.length}`}
                </span>
              </>
            )}
            {phase === 'testing' && !isJlptQuizActive && (
              <>
                <span className="hidden sm:inline text-xs bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-mono font-medium">
                  테스트 단계: {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="inline sm:hidden text-[10px] bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                  테스트: {currentQuestionIndex + 1}/${questions.length}
                </span>
              </>
            )}
            {phase === 'result' && !isJlptQuizActive && (
              <span className="text-[10px] sm:text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono font-medium">
                결과 리포트
              </span>
            )}
            {apiSource === 'fallback' && phase !== 'config' && (
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
                오프라인
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Interactive Work Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {/* Loading error messages for JLPT */}
        {jlptErrorMsg && !isJlptQuizActive && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-2xl flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>{jlptErrorMsg}</div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!currentUser ? (
            <motion.div
              key="auth-card-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex justify-center"
            >
              <AuthCard
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  localStorage.setItem("user", JSON.stringify(user));
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="authenticated-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col justify-center"
            >
              {/* PHASE 1: Configuration Landing */}
              {phase === 'config' && !isJlptQuizActive && (
                <MainConfig
                  kanjiCount={kanjiCount}
                  setKanjiCount={setKanjiCount}
                  vocabCount={vocabCount}
                  setVocabCount={setVocabCount}
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  jlptCount={jlptCount}
                  setJlptCount={setJlptCount}
                  selectedJlptLevel={selectedJlptLevel}
                  setSelectedJlptLevel={setSelectedJlptLevel}
                  masteredKanji={masteredKanji}
                  masteredVocab={masteredVocab}
                  isLoading={isLoading}
                  isJlptLoading={isJlptLoading}
                  errorMsg={errorMsg}
                  startKanjiStudy={startKanjiStudy}
                  startVocabStudy={startVocabStudy}
                  startJlptQuiz={startJlptQuiz}
                  handleResetMastery={handleResetMastery}
                  handleResetVocabMastery={handleResetVocabMastery}
                  studyMode={studyMode}
                  setStudyMode={setStudyMode}
                  isReviewMode={isReviewMode}
                  setIsReviewMode={setIsReviewMode}
                />
              )}

              {/* PHASE 2: Step-by-Step Interactive Studying Screen */}
              {phase === 'studying' && !isJlptQuizActive && (
                studyMode === 'vocab' ? (
                  vocabList.length > 0 && (
                    <VocabStudy
                      vocabList={vocabList}
                      currentVocabIndex={currentVocabIndex}
                      handlePrevStudy={handlePrevStudy}
                      handleNextStudy={handleNextStudy}
                      speakJapanese={speakJapanese}
                    />
                  )
                ) : (
                  kanjiList.length > 0 && (
                    <KanjiStudy
                      kanjiList={kanjiList}
                      currentKanjiIndex={currentKanjiIndex}
                      handlePrevStudy={handlePrevStudy}
                      handleNextStudy={handleNextStudy}
                      speakJapanese={speakJapanese}
                    />
                  )
                )
              )}

              {/* PHASE 3: Objective Challenge Quiz Testing Screen */}
              {phase === 'testing' && !isJlptQuizActive && questions.length > 0 && (
                <QuizTest
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  userAnswers={userAnswers}
                  isGraded={isGraded}
                  handleSelectAnswer={handleSelectAnswer}
                  handlePrevQuestion={handlePrevQuestion}
                  handleNextQuestion={handleNextQuestion}
                  handleGradeQuiz={handleGradeQuiz}
                />
              )}

              {/* PHASE 4: Score report and Explaining Incorrect mnemonics */}
              {phase === 'result' && !isJlptQuizActive && questions.length > 0 && (
                <ResultReport
                  questions={questions}
                  userAnswers={userAnswers}
                  isLoading={isLoading}
                  startKanjiStudy={startKanjiStudy}
                  startVocabStudy={startVocabStudy}
                  handleGoHome={handleGoHome}
                  studyMode={studyMode}
                />
              )}

              {/* JLPT Quiz Mode: Solving & Results Screens */}
              {isJlptQuizActive && jlptQuestions.length > 0 && (
                <JlptTest
                  selectedJlptLevel={selectedJlptLevel}
                  jlptQuestions={jlptQuestions}
                  currentJlptIndex={currentJlptIndex}
                  jlptAnswers={jlptAnswers}
                  isJlptGraded={isJlptGraded}
                  isJlptLoading={isJlptLoading}
                  handleSelectJlptAnswer={handleSelectJlptAnswer}
                  handlePrevJlptQuestion={handlePrevJlptQuestion}
                  handleNextJlptQuestion={handleNextJlptQuestion}
                  handleGradeJlptQuiz={handleGradeJlptQuiz}
                  handleGoHomeJlpt={handleGoHomeJlpt}
                  startJlptQuiz={startJlptQuiz}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant minimalist bottom footer */}
      <footer className="bg-white border-t border-slate-200/80 p-4 text-center text-xs text-slate-400 space-y-1">
        <p className="font-medium">일본어 한자 & 단어 마스터 © {new Date().getFullYear()} Japanese Kanji & Word Workspace</p>
      </footer>
    </div>
  );
}
