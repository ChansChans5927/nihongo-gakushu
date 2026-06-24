import React, { useState, useEffect } from "react";
import { Star, Volume2, ArrowLeft, BookOpen, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { KanjiItem, VocabItem } from "../types";
import { getTheme } from "../theme";

interface BookmarksViewProps {
  currentTheme?: string;
  bookmarkedKanjis: string[];
  bookmarkedVocabs: string[];
  onToggleBookmark: (type: "kanji" | "vocab", item: string) => void;
  speakJapanese: (text: string) => void;
  onGoBack: () => void;
}

export function BookmarksView({
  currentTheme = "default",
  bookmarkedKanjis,
  bookmarkedVocabs,
  onToggleBookmark,
  speakJapanese,
  onGoBack
}: BookmarksViewProps) {
  const [activeTab, setActiveTab] = useState<"kanji" | "vocab">("kanji");
  const [kanjiDetails, setKanjiDetails] = useState<KanjiItem[]>([]);
  const [vocabDetails, setVocabDetails] = useState<VocabItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]); // stores ID or kanji/word key

  const theme = getTheme(currentTheme);

  // Fetch detailed cards
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/progress/bookmarks/details?type=${activeTab}`);
        const resData = await response.json();
        if (resData.success && resData.data) {
          if (activeTab === "kanji") {
            setKanjiDetails(resData.data);
          } else {
            setVocabDetails(resData.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch bookmark details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [activeTab]);

  const toggleExpand = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleRemoveBookmark = (type: "kanji" | "vocab", item: string) => {
    onToggleBookmark(type, item);
    // Optimistic UI update
    if (type === "kanji") {
      setKanjiDetails(prev => prev.filter(k => k.kanji !== item));
    } else {
      setVocabDetails(prev => prev.filter(v => v.word !== item));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header section with back button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <button
          onClick={onGoBack}
          className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs md:text-sm font-bold shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인 화면으로</span>
        </button>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-1.5 sm:gap-2">
          <Star className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 text-indigo-500 fill-indigo-500" />
          <span>나만의 단어장</span>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab("kanji")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "kanji"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === "kanji" ? "text-amber-500" : ""}`} />
          <span>북마크 한자 ({bookmarkedKanjis.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("vocab")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "vocab"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeTab === "vocab" ? "text-rose-500" : ""}`} />
          <span>북마크 단어 ({bookmarkedVocabs.length})</span>
        </button>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">단어장을 불러오는 중...</p>
        </div>
      ) : activeTab === "kanji" ? (
        kanjiDetails.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
            <div className="inline-flex p-4 bg-amber-50 text-amber-500 rounded-2xl">
              <Star className="w-8 h-8 fill-none" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">북마크한 한자가 없습니다</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              암기하기 어려운 한자는 학습 중 별표(★)를 눌러 나만의 단어장에 담아보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {kanjiDetails.map((item, idx) => {
              const isExpanded = expandedItems.includes(item.kanji);
              return (
                <div
                  key={idx}
                  className={`${theme.cardContainer} border rounded-2xl overflow-hidden transition-all shadow-sm flex flex-col font-sans`}
                >
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
                    <div className="flex items-start md:items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                      {/* Big Kanji character with pronunciation click */}
                      <div
                        onClick={() => speakJapanese(item.kanji)}
                        lang="ja"
                        className={`text-2xl sm:text-4xl font-serif font-black rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer transition-colors shrink-0 select-all ${theme.wordPanelBg} ${theme.kanjiTextHover}`}
                        title="발음 듣기"
                      >
                        {item.kanji}
                      </div>

                      {/* Name / Meaning */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-base sm:text-lg font-extrabold ${theme.radicalKanjiMeaning}`}>
                            {item.meaning}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${theme.badgeBg} shrink-0`}>
                            {item.jlptLevel}
                          </span>
                        </div>
                        <div className={`text-xs font-mono mt-1.5 space-y-1 md:space-y-0 ${theme.wordSubText}`}>
                          <span className="block md:inline md:mr-3">
                            음독: <strong className={`font-semibold ${theme.breakdownKanjiMeaning}`}>{item.onyomi} ({item.onyomiKorean})</strong>
                          </span>
                          <span className="hidden md:inline opacity-50 mr-3">|</span>
                          <span className="block md:inline">
                            훈독: <strong className={`font-semibold ${theme.breakdownKanjiMeaning}`}>{item.hunyomi?.replace(/\./g, "") || "-"} ({item.hunyomiKorean || "-"})</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons (Listen, Bookmark, Expand) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto shrink-0 mt-2 md:mt-0">
                      <button
                        onClick={() => speakJapanese(item.kanji)}
                        className={`p-2 rounded-full border shadow-sm transition-all cursor-pointer ${theme.tableAudioBtn}`}
                        title="발음 듣기"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark("kanji", item.kanji)}
                        className="p-2 rounded-full border shadow-sm transition-all cursor-pointer bg-white hover:bg-slate-50 text-amber-500 hover:scale-105 active:scale-95"
                        title="북마크 해제"
                      >
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      </button>
                      <button
                        onClick={() => toggleExpand(item.kanji)}
                        className="p-2 rounded-full border shadow-sm transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-500 hover:scale-105 active:scale-95"
                        title="자세히 보기"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className={`p-4 sm:p-5 border-t ${theme.tableBorder} space-y-4 ${theme.breakdownPanelBg} text-xs sm:text-sm relative z-10`}>
                      {/* Mnemonic image */}
                      <div className={`p-3.5 rounded-xl space-y-1 relative ${theme.mnemonicPanelBg}`}>
                        <span className={`text-xs font-bold tracking-wider block ${theme.mnemonicTitleColor}`}>
                          💡 연상 암기 비법
                        </span>
                        <p className={`text-sm sm:text-base font-semibold leading-relaxed ${theme.radicalKanjiMeaning}`}>
                          {item.mnemonic}
                        </p>
                      </div>

                      {/* Related words grid */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                          📍 연관 어휘 확장
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {item.relatedWords.map((wordObj, wIdx) => (
                            <div
                              key={wIdx}
                              className={`border rounded-xl p-3 space-y-1 ${theme.relatedWordCard}`}
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span lang="ja" className={`font-bold text-base font-mono select-all ${theme.relatedWordJapText}`}>
                                  {wordObj.word}
                                </span>
                                <button
                                  onClick={() => speakJapanese(wordObj.word)}
                                  className={`p-1 rounded-full shadow-sm transition-all cursor-pointer ${theme.tableAudioBtn}`}
                                  title="발음 듣기"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className={`text-xs ${theme.relatedWordSubText}`}>
                                {wordObj.hiragana} ({wordObj.pronunciation})
                              </p>
                              <p className={`font-semibold border-t pt-1 mt-1 text-xs ${theme.relatedWordMeaningText}`}>
                                뜻: {wordObj.meaning}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Example sentence */}
                      <div className={`p-3.5 rounded-xl space-y-1.5 ${theme.exampleBoxBg}`}>
                        <div className={`flex items-center justify-between text-xs font-bold uppercase ${theme.exampleTitleColorKanji}`}>
                          <span>예문 (例文)</span>
                          <button
                            onClick={() => speakJapanese(item.exampleSentence.japanese)}
                            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer text-xs font-bold z-10 ${theme.exampleAudioBtn}`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>듣기</span>
                          </button>
                        </div>
                        <p lang="ja" className={`text-base sm:text-lg font-bold tracking-wide select-all ${theme.exampleJapText}`}>
                          {item.exampleSentence.japanese}
                        </p>
                        <p lang="ja" className={`text-xs font-mono ${theme.exampleHiraText}`}>
                          {item.exampleSentence.hiragana}
                        </p>
                        <p className={`text-xs font-sans ${theme.examplePronunciationTextKanji}`}>
                          [{item.exampleSentence.pronunciation}]
                        </p>
                        <p className={`text-sm border-t pt-1 mt-1 font-sans leading-relaxed ${theme.exampleMeaningText}`}>
                          {item.exampleSentence.meaning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : vocabDetails.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="inline-flex p-4 bg-rose-50 text-rose-500 rounded-2xl">
            <Star className="w-8 h-8 fill-none" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">북마크한 단어가 없습니다</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            헷갈리거나 자주 틀리는 단어는 학습 중 별표(★)를 눌러 나만의 단어장에 저장해보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {vocabDetails.map((item, idx) => {
            const isExpanded = expandedItems.includes(item.word);
            return (
              <div
                key={idx}
                className={`${theme.cardContainer} border rounded-2xl overflow-hidden transition-all shadow-sm flex flex-col font-sans`}
              >
                {/* Card Header Panel */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
                  <div className="flex items-start md:items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                    {/* Left Icon/Level Panel */}
                    <div
                      className={`rounded-2xl w-12 h-12 sm:w-16 sm:h-16 flex flex-col items-center justify-center shrink-0 text-center select-none ${theme.wordPanelBg}`}
                    >
                      <span className={`text-[9px] sm:text-[10px] font-mono font-bold ${theme.wordSubText}`}>JLPT</span>
                      <span className={`text-sm sm:text-lg font-black ${theme.breakdownKanjiMeaning}`}>{item.jlptLevel || "N4"}</span>
                    </div>

                    {/* Name / Meaning */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => speakJapanese(item.word)}
                          lang="ja"
                          className={`text-xl sm:text-2xl font-serif font-black cursor-pointer select-all ${theme.wordTextHover}`}
                          title="발음 듣기"
                        >
                          {item.word}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${theme.badgeBg} shrink-0`}>
                          {item.pos || "어휘"}
                        </span>
                      </div>
                      <span className={`text-xs sm:text-sm font-medium mt-0.5 break-words ${theme.wordSubText}`}>
                        뜻: <strong className={`font-bold ${theme.breakdownKanjiMeaning}`}>{item.meaning}</strong>
                      </span>
                      <span className={`text-xs font-mono mt-0.5 break-words ${theme.wordSubText}`}>
                        발음: <strong className={`font-semibold ${theme.examplePronunciationText}`}>{item.hiragana} ({item.pronunciation})</strong>
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (Listen, Bookmark, Expand) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto shrink-0 mt-2 md:mt-0">
                    <button
                      onClick={() => speakJapanese(item.word)}
                      className={`p-2 rounded-full border shadow-sm transition-all cursor-pointer ${theme.tableAudioBtn}`}
                      title="발음 듣기"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark("vocab", item.word)}
                      className="p-2 rounded-full border shadow-sm transition-all cursor-pointer bg-white hover:bg-slate-50 text-rose-500 hover:scale-105 active:scale-95"
                      title="북마크 해제"
                    >
                      <Star className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                    <button
                      onClick={() => toggleExpand(item.word)}
                      className="p-2 rounded-full border shadow-sm transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-500 hover:scale-105 active:scale-95"
                      title="자세히 보기"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail box */}
                {isExpanded && (
                  <div className={`p-4 sm:p-5 border-t ${theme.tableBorder} space-y-4 ${theme.breakdownPanelBg} text-xs sm:text-sm relative z-10`}>
                    {/* Kanji breakdowns */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        🧩 구성 한자 암기 팁
                      </span>
                      <div className="space-y-2">
                        {item.kanjiBreakdown && item.kanjiBreakdown.length > 0 ? (
                          item.kanjiBreakdown.map((kj, kjIdx) => (
                            <div
                              key={kjIdx}
                              className={`border rounded-xl p-3 flex items-start gap-3 ${theme.breakdownItemBg}`}
                            >
                              <div
                                onClick={() => speakJapanese(kj.kanji)}
                                lang="ja"
                                className={`text-lg font-serif font-black rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer shrink-0 ${theme.breakdownKanjiBox}`}
                              >
                                {kj.kanji}
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <span className={`text-xs font-bold ${theme.breakdownKanjiMeaning}`}>
                                  {kj.meaning}
                                </span>
                                <p className={`text-[10px] leading-relaxed ${theme.breakdownMnemonicText}`}>
                                  {kj.mnemonic}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs italic text-slate-400">구성 한자 분해 정보가 없습니다.</p>
                        )}
                      </div>
                    </div>

                    {/* Example sentence */}
                    <div className={`p-3.5 rounded-xl space-y-1.5 ${theme.exampleBoxBg}`}>
                      <div className={`flex items-center justify-between text-[10px] font-bold uppercase ${theme.exampleTitleColor}`}>
                        <span>예문 (例文)</span>
                        <button
                          onClick={() => speakJapanese(item.exampleSentence.japanese)}
                          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer text-[10px] font-bold z-10 ${theme.exampleAudioBtn}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>듣기</span>
                        </button>
                      </div>
                      <p lang="ja" className={`text-sm sm:text-base font-bold tracking-wide select-all ${theme.exampleJapText}`}>
                        {item.exampleSentence.japanese}
                      </p>
                      <p lang="ja" className={`text-[10px] font-mono ${theme.exampleHiraText}`}>
                        {item.exampleSentence.hiragana}
                      </p>
                      <p className={`text-[10px] font-sans ${theme.examplePronunciationText}`}>
                        [{item.exampleSentence.pronunciation}]
                      </p>
                      <p className={`text-xs border-t pt-1 mt-1 font-sans leading-relaxed ${theme.exampleMeaningText}`}>
                        {item.exampleSentence.meaning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
