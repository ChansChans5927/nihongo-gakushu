import { useEffect, useState } from "react";
import { useStudyStore } from "./stores/studyStore";
import { useAuthStore } from "./stores/authStore";
import { NativeBridge } from "./nativeBridge";
import { AnimatePresence, motion } from "motion/react";
import { BookMarked, AlertCircle } from "lucide-react";
import { useSpeech } from "./hooks/useSpeech";
import { MainConfig } from "./components/MainConfig";
import { KanjiStudy } from "./components/KanjiStudy";
import { VocabStudy } from "./components/VocabStudy";
import { QuizTest } from "./components/QuizTest";
import { ResultReport } from "./components/ResultReport";
import { JlptTest } from "./components/JlptTest";
import { AuthCard } from "./components/AuthCard";
import { UserDropdown } from "./components/UserDropdown";
import { SettingsView } from "./components/SettingsView";
import { ShopView } from "./components/ShopView";
import { BookmarksView } from "./components/BookmarksView";
import { ConfirmModal } from "./components/ConfirmModal";
import { useConfirmStore } from "./stores/confirmStore";
import { getTheme } from "./theme";

export default function App() {
  const [isInitCompleted, setIsInitCompleted] = useState(false);

  const {
    phase, setPhase, kanjiCount, setKanjiCount, difficulty, setDifficulty, jlptCount, setJlptCount,
    kanjiList, currentKanjiIndex, questions, currentQuestionIndex, userAnswers,
    masteredKanji, studyMode, setStudyMode, points, unlockedThemes, currentTheme,
    vocabCount, setVocabCount, vocabList, currentVocabIndex, masteredVocab,
    bookmarkedKanjis, bookmarkedVocabs, selectedJlptLevel, setSelectedJlptLevel, jlptQuestions,
    currentJlptIndex, jlptAnswers, isJlptGraded, isJlptLoading, jlptErrorMsg,
    isLoading, errorMsg, apiSource,
    fetchUserProgress, resetProgressState, handleResetMastery,
    handleResetVocabMastery, handleToggleBookmark, startKanjiStudy, startVocabStudy,
    startJlptQuiz, handleSelectAnswer, handleNextStudy, handlePrevStudy,
    handleNextQuestion, handlePrevQuestion, handleGradeQuiz, handleSelectJlptAnswer,
    handleNextJlptQuestion, handlePrevJlptQuestion, handleGradeJlptQuiz, handleGoHomeJlpt,
    handleGoHome
  } = useStudyStore();

  const {
    currentUser, setCurrentUser, isReviewMode, setIsReviewMode, logout
  } = useAuthStore();

  const theme = getTheme(currentTheme);

  // Hook for speech synthesis
  const { speakJapanese } = useSpeech(currentUser?.username);

  // Reset scroll to top on any phase or learning index changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [phase, currentKanjiIndex, currentVocabIndex, currentQuestionIndex, currentJlptIndex]);

  // Handle Back Button natively via WebView bridge
  useEffect(() => {
    const handleHardwareBack = () => {
      if (phase !== 'config') {
        handleGoHome();
      } else {
        // 홈 화면(config)일 경우 네이티브 앱 종료 요청
        if (NativeBridge.isMobileApp()) {
          NativeBridge.exitApp();
        } else {
          console.log("웹 브라우저에서는 홈 화면입니다.");
        }
      }
    };

    window.addEventListener('hardwareBackPress', handleHardwareBack as EventListener);
    return () => window.removeEventListener('hardwareBackPress', handleHardwareBack as EventListener);
  }, [phase, isJlptGraded, handleGoHome]);

  // 1. Restore session and fetch user progress sequentially on app launch
  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          // Wait for progress to be loaded from DB before marking initialization complete
          await fetchUserProgress(user.username);
        } catch (e) {
          console.error("Failed to restore session or progress", e);
          resetProgressState();
        }
      } else {
        resetProgressState();
      }
      setIsInitCompleted(true);
    };

    initApp();
  }, [setCurrentUser, fetchUserProgress, resetProgressState]);

  // 2. Fetch progress when user logs in manually or signs out (after initial sync is done)
  useEffect(() => {
    if (!isInitCompleted) return;

    if (currentUser) {
      fetchUserProgress(currentUser.username);
    } else {
      resetProgressState();
    }
  }, [currentUser, isInitCompleted, fetchUserProgress, resetProgressState]);

  // Handle unauthorized event (e.g. token expired) for auto-logout
  useEffect(() => {
    const handleUnauthorized = () => {
      if (!(window as any).unauthorizedAlerted) {
        (window as any).unauthorizedAlerted = true;
        logout();
        setPhase('config');
        useConfirmStore.getState().showAlert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        setTimeout(() => {
          (window as any).unauthorizedAlerted = false;
        }, 1000);
      }
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [logout, setPhase]);

  // Handle Deep Links via URL Parameters or Service Worker messages
  useEffect(() => {
    // 앱 구동 시 사용자 정보 및 진도율 로딩(DB fetch)이 완료된 후에만 딥링크를 파싱하도록 안전 가드 적용
    if (!isInitCompleted) return;

    const handleDeepLink = (data: any) => {
      if (data && data.targetItem) {
        const type = data.type === 'deep_link_study' ? (data.studyMode || 'vocab') : data.type;
        if (type === 'vocab') {
          setStudyMode('vocab');
          startVocabStudy(false, data.targetItem, data.level);
        } else if (type === 'kanji') {
          setStudyMode('kanji');
          startKanjiStudy(false, data.targetItem, data.level);
        }
      }
    };

    // Check URL
    const params = new URLSearchParams(window.location.search);
    const targetItem = params.get('targetItem') || params.get('item');
    const type = params.get('type');
    const level = params.get('level');
    
    if (targetItem && type) {
      handleDeepLink({ targetItem, type, level });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen to messages from service worker or React Native WebView (window.postMessage)
    const handleMessage = (event: MessageEvent) => {
      // event.data can come from SW or window.postMessage
      // In RN WebView, sometimes event.data is parsed, sometimes it's a string
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }

      if (data) {
        if (data.type === 'DEEP_LINK_STUDY' && data.payload) {
          handleDeepLink(data.payload);
        }
      }
    };

    // 1. Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }
    // 2. React Native WebView messages
    window.addEventListener('message', handleMessage);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [isInitCompleted, setStudyMode, startVocabStudy, startKanjiStudy]);

  // Sync push token if notifications are enabled
  useEffect(() => {
    if (currentUser) {
      fetch(`/api/user/settings?username=${encodeURIComponent(currentUser.username)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            if (data.data?.notificationsEnabled) {
              syncPushToken(currentUser.username);
            }
            // Save TTS settings to localStorage for useSpeech hook
            localStorage.setItem(`${currentUser.username}_ttsSpeed`, data.data?.ttsSpeed || "normal");
            localStorage.setItem(`${currentUser.username}_ttsGender`, data.data?.ttsGender || "female");
          }
        })
        .catch(err => console.error("Failed to fetch settings on login", err));
    }
  }, [currentUser]);

  // Function to silently sync the push token on app start
  const syncPushToken = async (username: string) => {
    try {
      if (NativeBridge.isMobileApp()) {
        const expoPushToken = await NativeBridge.requestExpoToken();
        if (expoPushToken) {
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, expoPushToken })
          });
          console.log("[Token Sync] Successfully synced Expo push token.");
        }
      } else {
        // PC Browser Web Push
        // 로컬 환경(localhost, 127.0.0.1)에서는 웹 푸시 구독 동기화를 차단하여 운영 DB 덮어쓰기 방지
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocal) {
          console.log("[Token Sync] Localhost detected. Skipping web push token sync.");
          return;
        }

        if ('serviceWorker' in navigator) {
          const swRegistration = await navigator.serviceWorker.ready;
          const subscription = await swRegistration.pushManager.getSubscription();
          if (subscription) {
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, subscription })
            });
            console.log("[Token Sync] Successfully synced Web Push subscription.");
          }
        }
      }
    } catch (error) {
      console.error("[Token Sync] Failed to sync push token silently:", error);
    }
  };

  const handleLogout = async () => {
    const confirmed = await useConfirmStore.getState().showConfirm("로그아웃 하시겠습니까?");
    if (confirmed) {
      logout();
      setPhase('config');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme.globalBg}`}>
      {/* Upper Navigation Bar */}
      <header className={`sticky top-0 z-40 px-4 py-3 sm:px-6 transition-all duration-300 ${theme.headerBgClass}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 group focus:outline-none text-left"
          >
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:rotate-12">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-sm sm:text-lg font-display font-bold tracking-tight transition-colors duration-300 ${theme.headerTextClass}`}>
                <span className="hidden sm:inline">일본어 한자 & 단어 마스터</span>
                <span className="inline sm:hidden">일본어 한자 & 단어</span>
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block font-mono tracking-wider">Mnemonic Associations & JLPT Solver</p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentUser && (
              <div className="flex items-center gap-2 sm:gap-3 mr-1 sm:mr-2">
                {/* Points GNB Badge */}
                <div
                  className={`inline-flex border shadow-2xs px-2.5 py-1 rounded-xl items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${theme.wordPanelBg} ${theme.tableBorder}`}
                  onClick={() => setPhase('shop')}
                  title="테마 상점 이동"
                >
                  <span className={`text-[9px] font-bold uppercase tracking-widest hidden xs:inline ${theme.wordSubText}`}>Points</span>
                  <strong className={`font-mono font-black text-xs ${theme.breakdownKanjiMeaning}`}>
                    {points.toLocaleString()} <span className="text-amber-500">P</span>
                  </strong>
                </div>

                <UserDropdown
                  username={currentUser.username}
                  onNavigateSettings={() => setPhase('settings')}
                  onNavigateShop={() => setPhase('shop')}
                  onNavigateBookmarks={() => setPhase('bookmarks')}
                  onLogout={handleLogout}
                />
              </div>
            )}
            {currentUser && (phase === 'studying' || phase === 'jlpt' || phase === 'testing' || phase === 'result' || (apiSource === 'fallback' && phase !== 'config')) && (
              <div className={`h-5 border-r mx-1.5 sm:mx-2 transition-colors duration-300 ${theme.tableBorder}`} />
            )}
            {(phase === 'studying' || phase === 'jlpt') && (
              <>
                <span className={`hidden sm:inline text-xs border px-2.5 py-1 rounded-full font-mono font-semibold ${theme.wordPanelBg} ${theme.tableBorder} ${theme.breakdownKanjiMeaning}`}>
                  {phase === 'jlpt'
                    ? `JLPT ${selectedJlptLevel} 테스트: ${currentJlptIndex + 1} / ${jlptQuestions.length}`
                    : studyMode === 'vocab'
                      ? `공부 단계: ${currentVocabIndex + 1} / ${vocabList.length}`
                      : `공부 단계: ${currentKanjiIndex + 1} / ${kanjiList.length}`}
                </span>
                <span className={`inline sm:hidden text-[10px] border px-2 py-0.5 rounded-full font-mono font-semibold ${theme.wordPanelBg} ${theme.tableBorder} ${theme.breakdownKanjiMeaning}`}>
                  {phase === 'jlpt'
                    ? `JLPT ${selectedJlptLevel}: ${currentJlptIndex + 1}/${jlptQuestions.length}`
                    : studyMode === 'vocab'
                      ? `공부: ${currentVocabIndex + 1}/${vocabList.length}`
                      : `공부: ${currentKanjiIndex + 1}/${kanjiList.length}`}
                </span>
              </>
            )}
            {phase === 'testing' && (
              <>
                <span className={`hidden sm:inline text-xs border px-2.5 py-1 rounded-full font-mono font-semibold ${theme.wordPanelBg} ${theme.tableBorder} ${theme.breakdownKanjiMeaning}`}>
                  테스트 단계: {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className={`inline sm:hidden text-[10px] border px-2 py-0.5 rounded-full font-mono font-semibold ${theme.wordPanelBg} ${theme.tableBorder} ${theme.breakdownKanjiMeaning}`}>
                  테스트: {currentQuestionIndex + 1}/{questions.length}
                </span>
              </>
            )}
            {phase === 'result' && (
              <span className={`text-[10px] sm:text-xs border px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono font-semibold ${theme.wordPanelBg} ${theme.tableBorder} ${theme.breakdownKanjiMeaning}`}>
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
        {jlptErrorMsg && phase !== 'jlpt' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
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
              {phase === 'config' && (
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
                  points={points}
                  unlockedThemes={unlockedThemes}
                  currentTheme={currentTheme}
                  currentUser={currentUser}
                  onThemeUpdate={() => currentUser && fetchUserProgress(currentUser.username)}
                  onOpenShop={() => setPhase('shop')}
                />
              )}

              {/* PHASE 2: Step-by-Step Interactive Studying Screen */}
              {phase === 'studying' && (
                studyMode === 'vocab' ? (
                  vocabList.length > 0 && (
                    <VocabStudy
                      vocabList={vocabList}
                      currentVocabIndex={currentVocabIndex}
                      handlePrevStudy={handlePrevStudy}
                      handleNextStudy={handleNextStudy}
                      speakJapanese={speakJapanese}
                      currentTheme={currentTheme}
                      bookmarkedVocabs={bookmarkedVocabs}
                      onToggleBookmark={handleToggleBookmark}
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
                      currentTheme={currentTheme}
                      bookmarkedKanjis={bookmarkedKanjis}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  )
                )
              )}

              {/* PHASE 3: Objective Challenge Quiz Testing Screen */}
              {phase === 'testing' && questions.length > 0 && (
                <QuizTest
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  userAnswers={userAnswers}
                  handleSelectAnswer={handleSelectAnswer}
                  handlePrevQuestion={handlePrevQuestion}
                  handleNextQuestion={handleNextQuestion}
                  handleGradeQuiz={handleGradeQuiz}
                  currentTheme={currentTheme}
                />
              )}

              {/* PHASE 4: Score report and Explaining Incorrect mnemonics */}
              {phase === 'result' && questions.length > 0 && (
                <ResultReport
                  questions={questions}
                  userAnswers={userAnswers}
                  isLoading={isLoading}
                  startKanjiStudy={startKanjiStudy}
                  startVocabStudy={startVocabStudy}
                  handleGoHome={handleGoHome}
                  handleReturnToBookmarks={() => setPhase('bookmarks')}
                  studyMode={studyMode}
                  currentTheme={currentTheme}
                />
              )}



              {/* PHASE 6: Settings View */}
              {phase === 'settings' && currentUser && (
                <SettingsView
                  username={currentUser.username}
                  currentTheme={currentTheme}
                  onGoBack={handleGoHome}
                  onLogout={() => {
                    logout();
                    setPhase('config');
                  }}
                />
              )}

              {/* PHASE 7: Shop View */}
              {phase === 'shop' && currentUser && (
                <ShopView
                  points={points}
                  unlockedThemes={unlockedThemes}
                  currentTheme={currentTheme}
                  onThemeUpdate={() => currentUser && fetchUserProgress(currentUser.username)}
                  onGoBack={handleGoHome}
                />
              )}

              {/* PHASE 8: Bookmarks View */}
              {phase === 'bookmarks' && currentUser && (
                <BookmarksView
                  currentTheme={currentTheme}
                  bookmarkedKanjis={bookmarkedKanjis}
                  bookmarkedVocabs={bookmarkedVocabs}
                  onToggleBookmark={handleToggleBookmark}
                  speakJapanese={speakJapanese}
                  onGoBack={handleGoHome}
                />
              )}

              {/* JLPT Quiz Mode: Solving & Results Screens */}
              {phase === 'jlpt' && jlptQuestions.length > 0 && (
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
                  currentTheme={currentTheme}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant minimalist bottom footer */}
      <footer className={`p-4 text-center text-xs space-y-1 transition-all duration-300 ${theme.footerBgClass}`}>
        <p className="font-medium">일본어 한자 & 단어 마스터 © {new Date().getFullYear()} Japanese Kanji & Word Workspace</p>
      </footer>

      <ConfirmModal />
    </div>
  );
}
