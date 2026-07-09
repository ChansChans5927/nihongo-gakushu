export interface ThemeConfig {
  key: string;
  isSamurai: boolean;
  isYokai: boolean;
  isZen: boolean;
  isDefault: boolean;
  isChalkboard: boolean;

  // Header & Progress Tracker
  headerTextColor: string;
  headerIconColor: string;
  progressTrackBg: string;
  progressBarBg: string;

  // Main Card Container
  cardContainer: string;
  cardHeaderBg: string;
  cardIndexText: string;
  badgeBg: string;

  // Word Panel
  wordPanelBg: string;
  wordTextHover: string;
  wordSubText: string;
  wordAudioBtn: string;
  meaningBadge: string;

  // Radicals / Breakdown Panel
  breakdownPanelBg: string;
  breakdownIconColor: string;
  breakdownTitleColor: string;
  breakdownItemBg: string;
  breakdownKanjiBox: string;
  breakdownKanjiMeaning: string;
  breakdownMnemonicText: string;
  breakdownEmptyText: string;

  // Example Sentence Box
  exampleBoxBg: string;
  exampleOverlayText: string;
  exampleTitleColor: string;
  exampleAudioBtn: string;
  exampleJapText: string;
  exampleHiraText: string;
  examplePronunciationText: string;
  exampleMeaningText: string;

  // Footer & Navigation Actions
  footerBg: string;
  btnSecondary: string;
  btnPrimary: string;

  // Quiz Specifics
  sealBadgeClass: string;
  choiceBtnBase: string;
  choiceBtnSelected: string;
  choiceIdxBase: string;
  choiceIdxSelected: string;
  checkIconColor: string;
  choiceTextNormal: string;
  choiceTextSelected: string;

  // --- KanjiStudy Specifics ---
  badgeGradeBg: string;
  kanjiTextHover: string;
  kanjiAudioBtn: string;
  kanjiMeaningBadge: string;
  mnemonicPanelBg: string;
  mnemonicIconColor: string;
  mnemonicTitleColor: string;
  radicalItemBg: string;
  radicalKanjiBox: string;
  radicalKanjiMeaning: string;
  radicalItemBadge: string;
  radicalItemBadgeIcon: string;
  tableBorder: string;
  tableHeaderCol: string;
  tableHeaderLabelText: string;
  tableValueCol: string;
  tableJapText: string;
  tableOnyomiKoreanBadge: string;
  tableHunyomiKoreanBadge: string;
  tableAudioBtn: string;
  relatedWordCard: string;
  relatedWordJapText: string;
  relatedWordSubText: string;
  relatedWordPronunciationText: string;
  relatedWordMeaningText: string;
  exampleTitleColorKanji: string;
  examplePronunciationTextKanji: string;
  btnPrimaryKanji: string;

  // --- JlptTest Specifics ---
  headerIconColorKanji: string;
  progressTrackBgJlpt: string;
  progressBarBgJlpt: string;
  sealBadgeClassJlpt: string;
  abandonLinkColor: string;
  questionInstructionColor: string;
  questionInstructionIcon: string;
  questionSentenceBox: string;
  blankFillBlock: string;
  highlightWordBlock: string;
  questionPromptText: string;
  questionPromptSubText: string;
  choiceBtnSelectedJlpt: string;
  choiceIdxSelectedJlpt: string;
  checkIconColorJlpt: string;
  choiceTextNormalJlpt: string;
  choiceTextSelectedJlpt: string;
  btnSecondaryJlpt: string;
  btnNextJlpt: string;
  btnGradeJlpt: string;

  // --- QuizTest Specifics ---
  headerIconColorQuiz: string;
  progressBarBgQuiz: string;
  quizDisplayBox: string;
  blankFillBlockQuiz: string;
  quizBigDisplayHint: string;
  btnNextQuiz: string;
  btnGradeQuiz: string;
  radicalsBoxBg: string;

  // New properties for pronunciation visibility & Quiz hints to keep code clean and decoupled
  wordPronunciationBlock: string;
  wordPronunciationText: string;
  btnHintQuiz: string;
  hintModalBg: string;

  // --- Global Application Layout Specifics ---
  globalBg: string;
  headerBgClass: string;
  headerTextClass: string;
  footerBgClass: string;
}

export const THEME_CONFIGS: Record<string, ThemeConfig> = {
  default: {
    key: "default",
    isSamurai: false,
    isYokai: false,
    isZen: false,
    isDefault: true,
    isChalkboard: false,

    headerTextColor: "text-slate-500",
    headerIconColor: "text-emerald-500",
    progressTrackBg: "bg-slate-200",
    progressBarBg: "bg-gradient-to-r from-emerald-500 to-teal-500",

    cardContainer: "bg-white border border-slate-200 rounded-3xl shadow-sm",
    cardHeaderBg: "bg-slate-50 border-b border-slate-100",
    cardIndexText: "text-slate-400",
    badgeBg: "bg-slate-100 text-slate-700",

    wordPanelBg: "bg-slate-50 border border-slate-100",
    wordTextHover: "text-slate-900 hover:text-emerald-600",
    wordSubText: "text-slate-400",
    wordAudioBtn: "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-emerald-600",
    meaningBadge: "bg-slate-900 text-white",

    breakdownPanelBg: "bg-emerald-50/50 border border-emerald-200/50",
    breakdownIconColor: "text-emerald-500/80",
    breakdownTitleColor: "text-emerald-800",
    breakdownItemBg: "bg-white border-slate-200/60 shadow-3xs hover:border-emerald-300",
    breakdownKanjiBox: "text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100",
    breakdownKanjiMeaning: "text-slate-800",
    breakdownMnemonicText: "text-slate-600",
    breakdownEmptyText: "text-slate-400",

    exampleBoxBg: "bg-slate-900 text-slate-100",
    exampleOverlayText: "text-slate-800 opacity-25",
    exampleTitleColor: "text-emerald-400",
    exampleAudioBtn: "bg-white/10 hover:bg-white/20 text-white",
    exampleJapText: "text-white",
    exampleHiraText: "text-slate-400",
    examplePronunciationText: "text-emerald-200",
    exampleMeaningText: "text-slate-300 border-white/10",

    footerBg: "bg-transparent border-t border-slate-100",
    btnSecondary: "bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200",
    btnPrimary: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl",

    sealBadgeClass: "px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold uppercase rounded-md tracking-wider",
    choiceBtnBase: "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs rounded-xl border",
    choiceBtnSelected: "bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/20 shadow-sm rounded-xl border",
    choiceIdxBase: "bg-slate-100 text-slate-500 rounded-full",
    choiceIdxSelected: "bg-blue-500 text-white font-bold rounded-full",
    checkIconColor: "text-blue-500",
    choiceTextNormal: "text-slate-800",
    choiceTextSelected: "text-blue-900",

    // Kanji specific (default)
    badgeGradeBg: "bg-amber-50 border border-amber-200 text-amber-800",
    kanjiTextHover: "text-slate-900 hover:text-amber-600",
    kanjiAudioBtn: "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-amber-600",
    kanjiMeaningBadge: "bg-slate-900 text-white",
    mnemonicPanelBg: "bg-amber-50/50 border border-amber-200/50",
    mnemonicIconColor: "text-amber-400/80",
    mnemonicTitleColor: "text-amber-800",
    radicalItemBg: "bg-white border border-slate-200/60 shadow-3xs hover:border-amber-300 hover:bg-amber-50/10 hover:shadow-2xs active:scale-[0.99]",
    radicalKanjiBox: "text-amber-600 bg-amber-50 border border-amber-100 group-hover:bg-amber-100/60",
    radicalKanjiMeaning: "text-slate-800",
    radicalItemBadge: "text-amber-700 bg-amber-50/80 border border-amber-100 group-hover:bg-amber-100",
    radicalItemBadgeIcon: "text-amber-500",
    tableBorder: "border-slate-200",
    tableHeaderCol: "bg-slate-50 text-slate-700 border-slate-200",
    tableHeaderLabelText: "text-slate-400",
    tableValueCol: "bg-white",
    tableJapText: "text-slate-900",
    tableOnyomiKoreanBadge: "bg-amber-100 text-amber-900",
    tableHunyomiKoreanBadge: "bg-rose-100 text-rose-900",
    tableAudioBtn: "bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-500 hover:text-emerald-600",
    relatedWordCard: "bg-slate-50 hover:bg-amber-50/20 border-slate-100 hover:border-amber-100",
    relatedWordJapText: "text-slate-900",
    relatedWordSubText: "text-slate-400",
    relatedWordPronunciationText: "text-slate-500",
    relatedWordMeaningText: "text-slate-700 border-slate-200/40",
    exampleTitleColorKanji: "text-amber-400",
    examplePronunciationTextKanji: "text-amber-200",
    btnPrimaryKanji: "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl",

    // JLPT specific (default)
    headerIconColorKanji: "text-amber-500",
    progressTrackBgJlpt: "bg-slate-200",
    progressBarBgJlpt: "bg-gradient-to-r from-amber-500 to-rose-500",
    sealBadgeClassJlpt: "px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded-md tracking-wider",
    abandonLinkColor: "text-slate-500 hover:text-slate-800",
    questionInstructionColor: "text-slate-400",
    questionInstructionIcon: "text-amber-500",
    questionSentenceBox: "bg-slate-50 border-slate-100 text-slate-900 font-sans",
    blankFillBlock: "bg-amber-50 border-amber-400 text-amber-800",
    highlightWordBlock: "bg-amber-100 text-amber-950 border-amber-200/80",
    questionPromptText: "text-slate-800",
    questionPromptSubText: "text-slate-400",
    choiceBtnSelectedJlpt: "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20 shadow-sm rounded-xl border",
    choiceIdxSelectedJlpt: "bg-amber-500 text-slate-950 font-black rounded-full",
    checkIconColorJlpt: "text-amber-600",
    choiceTextNormalJlpt: "text-slate-800",
    choiceTextSelectedJlpt: "text-amber-900",
    btnSecondaryJlpt: "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 rounded-xl",
    btnNextJlpt: "bg-slate-900 hover:bg-slate-800 text-white",
    btnGradeJlpt: "bg-gradient-to-r from-amber-500 to-rose-500 text-white",

    // Quiz specific (default)
    headerIconColorQuiz: "text-blue-500",
    progressBarBgQuiz: "bg-blue-500",
    quizDisplayBox: "bg-slate-50 border border-slate-100 rounded-2xl",
    blankFillBlockQuiz: "bg-emerald-50 border-emerald-400 text-emerald-800",
    quizBigDisplayHint: "text-amber-500",
    btnNextQuiz: "bg-slate-900 hover:bg-slate-800 text-white rounded-xl",
    btnGradeQuiz: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl",
    radicalsBoxBg: "bg-slate-50 border border-slate-100",

    wordPronunciationBlock: "bg-slate-50 border border-slate-200",
    wordPronunciationText: "text-slate-700 font-bold",
    btnHintQuiz: "border border-dashed border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100",
    hintModalBg: "bg-white/95 backdrop-blur-md border-slate-200/80 text-slate-800 rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.15)]",
    globalBg: "bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-950",
    headerBgClass: "bg-white/80 backdrop-blur-md border-b border-slate-200/80",
    headerTextClass: "text-slate-900",
    footerBgClass: "bg-white border-t border-slate-200/80 text-slate-450"
  },
  samurai: {
    key: "samurai",
    isSamurai: true,
    isYokai: false,
    isZen: false,
    isDefault: false,
    isChalkboard: false,

    headerTextColor: "text-amber-900",
    headerIconColor: "text-amber-800",
    progressTrackBg: "bg-amber-900/20",
    progressBarBg: "bg-[#8b4513]",

    cardContainer: "bg-[#f4e8d1] border-2 border-amber-900/22 rounded-3xl shadow-[inset_0_0_30px_rgba(139,69,19,0.06),0_10px_25px_rgba(0,0,0,0.05)] text-amber-955",
    cardHeaderBg: "bg-[rgba(255,255,255,0.2)] border-b border-amber-900/20",
    cardIndexText: "text-amber-900/70",
    badgeBg: "bg-amber-900/20 text-amber-955",

    wordPanelBg: "bg-[#e5d8b7] border border-amber-900/20",
    wordTextHover: "text-amber-955 hover:text-red-900 transition-colors duration-200",
    wordSubText: "text-amber-955/80 font-bold",
    wordAudioBtn: "bg-amber-900/20 border border-amber-900/40 text-amber-955 hover:bg-[#3e2723] hover:text-[#f4e8d1]",
    meaningBadge: "bg-[#3e2723] text-[#f4e8d1]",

    breakdownPanelBg: "bg-amber-900/10 border border-amber-900/20",
    breakdownIconColor: "text-amber-700",
    breakdownTitleColor: "text-amber-950",
    breakdownItemBg: "bg-[rgba(255,255,255,0.3)] border-amber-900/20 hover:border-amber-900/40",
    breakdownKanjiBox: "text-red-800 bg-[#f4e8d1] border border-amber-900/30 hover:bg-[#f8f5ec]",
    breakdownKanjiMeaning: "text-amber-950",
    breakdownMnemonicText: "text-amber-900/70",
    breakdownEmptyText: "text-amber-900/55",

    exampleBoxBg: "bg-[rgba(255,255,255,0.3)] border border-amber-900/20 text-amber-950",
    exampleOverlayText: "text-amber-900/10",
    exampleTitleColor: "text-amber-900/80",
    exampleAudioBtn: "bg-amber-900/10 hover:bg-amber-900/20 text-amber-955",
    exampleJapText: "text-amber-955",
    exampleHiraText: "text-amber-900/70",
    examplePronunciationText: "text-red-800",
    exampleMeaningText: "text-amber-950 border-amber-900/20",

    footerBg: "bg-transparent border-t border-amber-900/20",
    btnSecondary: "bg-transparent hover:bg-amber-900/10 text-amber-955 border border-amber-900/30 rounded-xl",
    btnPrimary: "bg-[#4e3629] hover:bg-[#3e2723] text-[#f4ebd6] rounded-xl border border-amber-900/30 shadow-[0_4px_12px_rgba(78,54,41,0.2)]",

    sealBadgeClass: "inline-block px-3 py-1 bg-transparent text-red-800 border-2 border-red-800 text-[11px] font-bold uppercase tracking-widest rounded-md transform -rotate-2 opacity-90 select-none",
    choiceBtnBase: "bg-transparent border-amber-900/25 hover:border-amber-800 text-amber-955 hover:bg-amber-900/5 border-2 rounded-xl sword-glint p-3 sm:p-4 text-sm",
    choiceBtnSelected: "bg-amber-900/12 border-amber-800 text-amber-955 rounded-xl ring-1 ring-amber-800/30 border-2",
    choiceIdxBase: "bg-transparent text-amber-955 border border-amber-900/50 rounded-full font-bold",
    choiceIdxSelected: "bg-red-800 text-amber-50 font-bold rounded-sm border-2 border-red-900 transform -rotate-3",
    checkIconColor: "text-red-800",
    choiceTextNormal: "text-amber-955",
    choiceTextSelected: "text-amber-955",

    // Kanji specific (samurai)
    badgeGradeBg: "bg-[#3e2723] text-[#f4e8d1] border border-amber-900/50",
    kanjiTextHover: "text-amber-955 hover:text-red-800 transition-colors duration-200",
    kanjiAudioBtn: "bg-amber-900/20 border border-amber-900/40 text-amber-955 hover:bg-[#3e2723] hover:text-[#f4e8d1]",
    kanjiMeaningBadge: "bg-[#3e2723] text-[#f4e8d1]",
    mnemonicPanelBg: "bg-amber-900/10 border border-amber-900/20",
    mnemonicIconColor: "text-amber-700",
    mnemonicTitleColor: "text-amber-955",
    radicalItemBg: "bg-[rgba(255,255,255,0.3)] border border-amber-900/20 hover:border-amber-900/40 hover:bg-[rgba(255,255,255,0.5)]",
    radicalKanjiBox: "text-red-800 bg-[#f4e8d1] border border-amber-900/30 group-hover:bg-[#f8f5ec]",
    radicalKanjiMeaning: "text-amber-955",
    radicalItemBadge: "text-red-900 bg-amber-900/10 border border-amber-900/20",
    radicalItemBadgeIcon: "text-red-700",
    tableBorder: "border-amber-900/20",
    tableHeaderCol: "bg-[rgba(255,255,255,0.2)] text-amber-955 border-amber-900/20",
    tableHeaderLabelText: "text-amber-900/60",
    tableValueCol: "bg-transparent",
    tableJapText: "text-amber-955",
    tableOnyomiKoreanBadge: "bg-amber-900/10 text-amber-900",
    tableHunyomiKoreanBadge: "bg-red-900/10 text-red-900",
    tableAudioBtn: "bg-amber-900/20 border border-amber-900/40 text-amber-955 hover:bg-[#3e2723] hover:text-[#f4e8d1]",
    relatedWordCard: "bg-transparent hover:bg-[rgba(255,255,255,0.2)] border-amber-900/20 hover:border-amber-900/40",
    relatedWordJapText: "text-amber-955",
    relatedWordSubText: "text-amber-900/70",
    relatedWordPronunciationText: "text-amber-955",
    relatedWordMeaningText: "text-amber-900 border-amber-900/20",
    exampleTitleColorKanji: "text-amber-900/80",
    examplePronunciationTextKanji: "text-red-800",
    btnPrimaryKanji: "bg-[#4e3629] hover:bg-[#3e2723] text-[#f4ebd6] rounded-xl border border-amber-900/30 shadow-[0_4px_12px_rgba(78,54,41,0.2)]",

    // JLPT specific (samurai)
    headerIconColorKanji: "text-amber-800",
    progressTrackBgJlpt: "bg-amber-900/10",
    progressBarBgJlpt: "bg-gradient-to-r from-amber-700 to-red-800",
    sealBadgeClassJlpt: "inline-block px-3 py-1 bg-transparent text-red-800 border-2 border-red-800 text-[11px] font-bold uppercase tracking-widest rounded-md transform -rotate-2 opacity-90 select-none",
    abandonLinkColor: "text-amber-900/60 hover:text-amber-900",
    questionInstructionColor: "text-amber-900/80",
    questionInstructionIcon: "text-amber-800",
    questionSentenceBox: "bg-[rgba(255,255,255,0.3)] border-amber-900/20 text-amber-955 font-sans",
    blankFillBlock: "bg-amber-900/5 border-amber-900/30 text-amber-900 font-sans",
    highlightWordBlock: "bg-amber-900/10 text-amber-955 border-amber-900/20",
    questionPromptText: "text-amber-955",
    questionPromptSubText: "text-amber-900/70",
    choiceBtnSelectedJlpt: "bg-amber-900/12 border-amber-800 text-amber-955 rounded-xl ring-1 ring-amber-800/30 border-2",
    choiceIdxSelectedJlpt: "bg-red-800 text-amber-50 font-bold rounded-sm border-2 border-red-900 transform -rotate-3",
    checkIconColorJlpt: "text-red-800",
    choiceTextNormalJlpt: "text-amber-955",
    choiceTextSelectedJlpt: "text-amber-955",
    btnSecondaryJlpt: "bg-transparent text-amber-955 border border-amber-900/20 hover:bg-amber-900/10 rounded-xl",
    btnNextJlpt: "bg-amber-955 hover:bg-amber-900 text-[#f4e8d1] rounded-xl",
    btnGradeJlpt: "bg-gradient-to-r from-red-800 to-amber-900 text-amber-100 rounded-xl",

    // Quiz specific (samurai)
    headerIconColorQuiz: "text-amber-800",
    progressBarBgQuiz: "bg-[#8b4513]",
    quizDisplayBox: "bg-[rgba(255,255,255,0.2)] border-y border-y-amber-900/20 shadow-inner",
    blankFillBlockQuiz: "bg-amber-900/10 border-amber-900/40 text-amber-900",
    quizBigDisplayHint: "text-red-800",
    btnNextQuiz: "bg-[#4e3629] hover:bg-[#3e2723] text-[#f4ebd6] rounded-xl border border-amber-900/30 shadow-[0_4px_12px_rgba(78,54,41,0.2)]",
    btnGradeQuiz: "bg-gradient-to-r from-red-800 to-amber-900 text-amber-100 rounded-xl",
    radicalsBoxBg: "bg-amber-900/5 border border-amber-900/20",

    wordPronunciationBlock: "bg-amber-900/10 border border-amber-900/30",
    wordPronunciationText: "text-amber-955 font-black",
    btnHintQuiz: "border border-dashed border-amber-900/40 text-amber-955 bg-amber-900/5 hover:bg-amber-900/10 rounded-xl",
    hintModalBg: "bg-[#f5e6ca] border-amber-900/40 text-amber-955 rounded-xl shadow-[6px_6px_0px_#5d3a1a] font-sans",
    globalBg: "bg-[#efe4cb] text-amber-955 font-sans min-h-screen",
    headerBgClass: "bg-[#f4e8d1]/90 backdrop-blur-md border-b border-amber-900/30",
    headerTextClass: "text-amber-955 font-sans font-bold",
    footerBgClass: "bg-[#f4e8d1]/90 border-t border-amber-900/20 text-amber-900/70"
  },
  yokai: {
    key: "yokai",
    isSamurai: false,
    isYokai: true,
    isZen: false,
    isDefault: false,
    isChalkboard: false,

    headerTextColor: "text-[#a78bfa]",
    headerIconColor: "text-[#a78bfa]",
    progressTrackBg: "bg-[#111827]/80 shadow-[inset_0_0_5px_rgba(139,92,246,0.15)]",
    progressBarBg: "bg-gradient-to-r from-violet-600 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]",

    cardContainer: "yokai-theme-base rounded-xl text-slate-200",
    cardHeaderBg: "bg-[#0b101c]/85 border-b border-[#a78bfa]/15 backdrop-blur-md",
    cardIndexText: "text-[#a78bfa]",
    badgeBg: "bg-[#0b101c] text-[#a78bfa] border border-[#a78bfa]/35",

    wordPanelBg: "yokai-panel z-10 relative",
    wordTextHover: "text-[#f8f9fa] hover:text-[#c084fc] drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]",
    wordSubText: "text-slate-400",
    wordAudioBtn: "bg-[#111827]/60 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20 hover:text-white",
    meaningBadge: "bg-[#1e1b4b]/90 text-[#e9d5ff] border border-[#a78bfa]/30 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide drop-shadow-sm",

    breakdownPanelBg: "yokai-panel",
    breakdownIconColor: "text-[#a78bfa]",
    breakdownTitleColor: "text-[#a78bfa]",
    breakdownItemBg: "bg-[#111827]/30 border-[#a78bfa]/15 hover:border-[#a78bfa]/35",
    breakdownKanjiBox: "text-[#a78bfa] bg-[#0b101c] border border-[#a78bfa]/35 hover:bg-[#111827]/60",
    breakdownKanjiMeaning: "text-slate-300",
    breakdownMnemonicText: "text-slate-400/80",
    breakdownEmptyText: "text-slate-500",

    exampleBoxBg: "yokai-panel text-slate-300",
    exampleOverlayText: "text-[#a78bfa]/5",
    exampleTitleColor: "text-[#a78bfa]",
    exampleAudioBtn: "bg-[#a78bfa]/10 hover:bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/20",
    exampleJapText: "text-[#f8f9fa] drop-shadow-[0_0_6px_rgba(168,85,247,0.2)]",
    exampleHiraText: "text-[#a78bfa]/60",
    examplePronunciationText: "text-[#c084fc]",
    exampleMeaningText: "text-slate-300 border-[#a78bfa]/15",

    footerBg: "bg-transparent border-t border-[#a78bfa]/15",
    btnSecondary: "bg-transparent hover:bg-[#a78bfa]/10 text-slate-300 border border-[#a78bfa]/25 rounded-xl",
    btnPrimary: "yokai-button-selected text-white rounded-xl border border-[#a78bfa] shadow-[0_0_12px_rgba(168,85,247,0.2)]",
 
    sealBadgeClass: "bg-[#1e1b4b]/95 border border-[#a78bfa]/40 text-[#a78bfa] inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md select-none",
    choiceBtnBase: "yokai-button text-[#e2e8f0] rounded-xl border p-3 sm:p-4 text-sm",
    choiceBtnSelected: "yokai-button-selected text-white rounded-xl border",
    choiceIdxBase: "bg-[#111827] text-[#a78bfa] border border-[#a78bfa]/25 rounded-full",
    choiceIdxSelected: "bg-[#7c3aed] text-white shadow-[0_0_8px_rgba(139,92,246,0.6)] rounded-full",
    checkIconColor: "text-[#a78bfa]",
    choiceTextNormal: "text-slate-300",
    choiceTextSelected: "text-white",
 
    // Kanji specific (yokai)
    badgeGradeBg: "bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/25",
    kanjiTextHover: "text-[#f8f9fa] hover:text-[#c084fc] drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]",
    kanjiAudioBtn: "bg-[#111827]/60 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20 hover:text-white",
    kanjiMeaningBadge: "bg-[#1e1b4b]/60 text-slate-300 border border-[#a78bfa]/20",
    mnemonicPanelBg: "yokai-panel",
    mnemonicIconColor: "text-[#a78bfa]",
    mnemonicTitleColor: "text-[#a78bfa]",
    radicalItemBg: "bg-[#111827]/60 border border-[#a78bfa]/15 hover:border-[#a78bfa]/35 hover:bg-[#111827]",
    radicalKanjiBox: "text-[#a78bfa] bg-[#0b101c] border border-[#a78bfa]/30 group-hover:bg-[#111827]",
    radicalKanjiMeaning: "text-slate-300",
    radicalItemBadge: "text-[#a78bfa] bg-[#111827]/80 border border-[#a78bfa]/30 group-hover:bg-[#a78bfa]/10",
    radicalItemBadgeIcon: "text-[#a78bfa]",
    tableBorder: "border-[#a78bfa]/15",
    tableHeaderCol: "bg-[#0b101c]/80 text-[#a78bfa] border-[#a78bfa]/15",
    tableHeaderLabelText: "text-slate-400/80",
    tableValueCol: "bg-[#111827]/40",
    tableJapText: "text-[#f8f9fa]",
    tableOnyomiKoreanBadge: "bg-[#a78bfa]/10 text-[#a78bfa]",
    tableHunyomiKoreanBadge: "bg-rose-950/30 text-rose-350 border border-rose-900/30",
    tableAudioBtn: "bg-[#111827]/60 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20 hover:text-white",
    relatedWordCard: "bg-[#111827]/30 hover:bg-[#a78bfa]/5 border-[#a78bfa]/15 hover:border-[#a78bfa]/30",
    relatedWordJapText: "text-[#f8f9fa]",
    relatedWordSubText: "text-[#a78bfa]/60",
    relatedWordPronunciationText: "text-[#a78bfa]",
    relatedWordMeaningText: "text-slate-300 border-[#a78bfa]/15",
    exampleTitleColorKanji: "text-[#a78bfa]",
    examplePronunciationTextKanji: "text-[#c084fc]",
    btnPrimaryKanji: "yokai-button-selected text-white rounded-xl border border-[#a78bfa] shadow-[0_0_12px_rgba(168,85,247,0.2)]",
 
    // JLPT specific (yokai)
    headerIconColorKanji: "text-[#a78bfa]",
    progressTrackBgJlpt: "bg-[#a78bfa]/10",
    progressBarBgJlpt: "bg-gradient-to-r from-violet-600 to-indigo-600",
    sealBadgeClassJlpt: "bg-[#1e1b4b]/95 border border-[#a78bfa]/40 text-[#a78bfa] inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md select-none",
    abandonLinkColor: "text-[#a78bfa]/60 hover:text-[#a78bfa]",
    questionInstructionColor: "text-[#a78bfa]/80",
    questionInstructionIcon: "text-[#a78bfa]",
    questionSentenceBox: "bg-[#111827]/40 border-[#a78bfa]/15 text-[#f8f9fa] font-sans",
    blankFillBlock: "bg-[#a78bfa]/10 border-[#a78bfa]/30 text-[#a78bfa] font-sans",
    highlightWordBlock: "bg-[#a78bfa]/20 text-white border-[#a78bfa]/30",
    questionPromptText: "text-[#f8f9fa]",
    questionPromptSubText: "text-[#a78bfa]/60",
    choiceBtnSelectedJlpt: "yokai-button-selected text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]",
    choiceIdxSelectedJlpt: "bg-[#7c3aed] text-white shadow-[0_0_8px_rgba(139,92,246,0.6)]",
    checkIconColorJlpt: "text-[#a78bfa]",
    choiceTextNormalJlpt: "text-slate-300",
    choiceTextSelectedJlpt: "text-white",
    btnSecondaryJlpt: "bg-transparent text-slate-300 border-[#a78bfa]/20 hover:bg-[#a78bfa]/10 rounded-xl",
    btnNextJlpt: "bg-[#7c3aed] hover:bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]",
    btnGradeJlpt: "bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]",
 
    // Quiz specific (yokai)
    headerIconColorQuiz: "text-[#a78bfa]",
    progressBarBgQuiz: "bg-gradient-to-r from-violet-600 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    quizDisplayBox: "bg-[#111827]/40 border-y border-[#a78bfa]/15 backdrop-blur-sm",
    blankFillBlockQuiz: "bg-[#a78bfa]/10 border-[#a78bfa]/30 text-[#a78bfa]",
    quizBigDisplayHint: "text-[#a78bfa]",
    btnNextQuiz: "bg-[#111827] hover:bg-[#1e293b] text-[#a78bfa] border border-[#a78bfa]/30 rounded-xl shadow-[0_0_10px_rgba(139,92,246,0.1)]",
    btnGradeQuiz: "yokai-button-selected text-white rounded-xl border border-[#a78bfa] shadow-[0_0_12px_rgba(168,85,247,0.2)]",
    radicalsBoxBg: "bg-[#0b101c]/80 border border-[#a78bfa]/15",

    wordPronunciationBlock: "bg-[#111827]/60 border border-[#a78bfa]/20 backdrop-blur-sm",
    wordPronunciationText: "text-[#c084fc] font-bold",
    btnHintQuiz: "border border-dashed border-[#a78bfa]/40 text-[#a78bfa] bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15",
    hintModalBg: "bg-[#0b101c] border-[#a78bfa]/30 text-[#f8f9fa] rounded-[20px] shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    globalBg: "bg-[#030712] text-slate-200 font-sans min-h-screen",
    headerBgClass: "bg-[#030712]/80 backdrop-blur-lg border-b border-[#a78bfa]/10",
    headerTextClass: "text-[#a78bfa] font-bold",
    footerBgClass: "bg-[#030712]/90 border-t border-[#a78bfa]/10 text-[#a78bfa]/40"
  },
  zen: {
    key: "zen",
    isSamurai: false,
    isYokai: false,
    isZen: true,
    isDefault: false,
    isChalkboard: false,

    headerTextColor: "text-emerald-800",
    headerIconColor: "text-emerald-600",
    progressTrackBg: "bg-emerald-800/10",
    progressBarBg: "bg-emerald-600",

    cardContainer: "zen-theme-base rounded-xl text-emerald-955",
    cardHeaderBg: "bg-emerald-50/50 border-b border-emerald-600/10",
    cardIndexText: "text-emerald-800/80",
    badgeBg: "bg-emerald-800/10 text-emerald-900 border border-emerald-600/10",

    wordPanelBg: "bg-[#ffffff] border border-emerald-600/20 shadow-[inset_0_0_20px_rgba(74,114,86,0.03)] z-10",
    wordTextHover: "text-emerald-955 hover:text-emerald-700",
    wordSubText: "text-emerald-800/70",
    wordAudioBtn: "bg-[#ffffff] border border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900",
    meaningBadge: "bg-emerald-700 text-white",

    breakdownPanelBg: "bg-emerald-50/80 border border-emerald-600/20 text-emerald-955",
    breakdownIconColor: "text-emerald-600",
    breakdownTitleColor: "text-emerald-800",
    breakdownItemBg: "bg-white/80 border border-emerald-600/10 hover:border-emerald-500/30 text-emerald-955",
    breakdownKanjiBox: "text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100",
    breakdownKanjiMeaning: "text-emerald-955",
    breakdownMnemonicText: "text-emerald-800/70",
    breakdownEmptyText: "text-emerald-800/50",

    exampleBoxBg: "bg-emerald-950/10 border border-emerald-600/20 text-emerald-955",
    exampleOverlayText: "text-emerald-800/10",
    exampleTitleColor: "text-emerald-800",
    exampleAudioBtn: "bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 border border-emerald-600/20",
    exampleJapText: "text-emerald-955",
    exampleHiraText: "text-emerald-800/70",
    examplePronunciationText: "text-emerald-850",
    exampleMeaningText: "text-emerald-900 border-emerald-600/20",

    footerBg: "bg-transparent border-t border-emerald-600/15",
    btnSecondary: "bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-600/20",
    btnPrimary: "zen-button-selected text-white rounded-xl border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",

    sealBadgeClass: "zen-seal-badge inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-md opacity-95 select-none",
    choiceBtnBase: "zen-button text-[#2d4635] rounded-xl border p-3 sm:p-4 text-sm",
    choiceBtnSelected: "zen-button-selected text-white rounded-xl border",
    choiceIdxBase: "bg-emerald-50 text-emerald-800 border border-emerald-600/10 rounded-full",
    choiceIdxSelected: "bg-emerald-600 text-white font-bold rounded-full",
    checkIconColor: "text-emerald-600",
    choiceTextNormal: "text-emerald-955 font-medium",
    choiceTextSelected: "text-white",

    // Kanji specific (zen)
    badgeGradeBg: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    kanjiTextHover: "text-emerald-955 hover:text-emerald-700",
    kanjiAudioBtn: "bg-[#ffffff] border border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900",
    kanjiMeaningBadge: "bg-emerald-700 text-white",
    mnemonicPanelBg: "bg-emerald-50/80 border border-emerald-600/20 text-emerald-955",
    mnemonicIconColor: "text-emerald-600",
    mnemonicTitleColor: "text-emerald-800",
    radicalItemBg: "bg-white/80 border border-emerald-600/10 hover:border-emerald-500/30 hover:bg-emerald-50/10 hover:shadow-2xs active:scale-[0.99]",
    radicalKanjiBox: "text-emerald-700 bg-emerald-50 border border-emerald-100/60 group-hover:bg-emerald-100",
    radicalKanjiMeaning: "text-emerald-955",
    radicalItemBadge: "text-emerald-800 bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-100",
    radicalItemBadgeIcon: "text-emerald-600",
    tableBorder: "border-emerald-600/20",
    tableHeaderCol: "bg-emerald-50/80 text-emerald-900 border-emerald-600/20",
    tableHeaderLabelText: "text-emerald-800/60",
    tableValueCol: "bg-white/50",
    tableJapText: "text-emerald-955",
    tableOnyomiKoreanBadge: "bg-emerald-100 text-emerald-800",
    tableHunyomiKoreanBadge: "bg-emerald-50 text-emerald-800 border border-emerald-200/50",
    tableAudioBtn: "bg-[#ffffff] border border-emerald-600/30 text-emerald-800 hover:bg-emerald-50",
    relatedWordCard: "bg-[#ffffff] hover:bg-emerald-50/30 border-emerald-600/10 hover:border-emerald-500/20 text-emerald-955",
    relatedWordJapText: "text-emerald-955",
    relatedWordSubText: "text-emerald-800/70",
    relatedWordPronunciationText: "text-emerald-900",
    relatedWordMeaningText: "text-emerald-900 border-emerald-600/20",
    exampleTitleColorKanji: "text-emerald-800",
    examplePronunciationTextKanji: "text-emerald-850",
    btnPrimaryKanji: "zen-button-selected text-white rounded-xl border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",

    // JLPT specific (zen)
    headerIconColorKanji: "text-emerald-600",
    progressTrackBgJlpt: "bg-emerald-800/10",
    progressBarBgJlpt: "bg-emerald-600",
    sealBadgeClassJlpt: "zen-seal-badge inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-md opacity-95 select-none",
    abandonLinkColor: "text-emerald-800/60 hover:text-emerald-850",
    questionInstructionColor: "text-emerald-800/80",
    questionInstructionIcon: "text-emerald-600",
    questionSentenceBox: "bg-white border-emerald-600/10 text-emerald-950 font-sans",
    blankFillBlock: "bg-emerald-800/10 border-emerald-600/40 text-emerald-800 font-sans",
    highlightWordBlock: "bg-emerald-600/20 text-emerald-955 border-emerald-600/20",
    questionPromptText: "text-emerald-955",
    questionPromptSubText: "text-emerald-800/80",
    choiceBtnSelectedJlpt: "zen-button-selected text-white shadow-[0_4px_14px_rgba(74,114,86,0.1)] rounded-xl border",
    choiceIdxSelectedJlpt: "bg-emerald-600 text-white font-bold rounded-full",
    checkIconColorJlpt: "text-emerald-600",
    choiceTextNormalJlpt: "text-emerald-[#2d4635]", // note: zen choice button text color
    choiceTextSelectedJlpt: "text-white",
    btnSecondaryJlpt: "bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-600/20",
    btnNextJlpt: "bg-[#ffffff] hover:bg-emerald-50 text-emerald-800 border border-emerald-600/30 rounded-xl shadow-sm",
    btnGradeJlpt: "zen-button-selected text-white border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",

    // Quiz specific (zen)
    headerIconColorQuiz: "text-emerald-600",
    progressBarBgQuiz: "bg-emerald-600",
    quizDisplayBox: "bg-[#ffffff] border-y border-y-emerald-600/10",
    blankFillBlockQuiz: "bg-emerald-800/10 border-emerald-600/40 text-emerald-800",
    quizBigDisplayHint: "text-emerald-600",
    btnNextQuiz: "bg-[#ffffff] hover:bg-emerald-50 text-emerald-800 border border-emerald-600/30 rounded-xl",
    btnGradeQuiz: "zen-button-selected text-white rounded-xl border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",
    radicalsBoxBg: "bg-emerald-50/40 border border-emerald-600/10",

    wordPronunciationBlock: "bg-emerald-50 border border-emerald-600/20",
    wordPronunciationText: "text-emerald-900 font-bold",
    btnHintQuiz: "border border-dashed border-emerald-600/40 text-emerald-800 bg-emerald-50 hover:bg-emerald-100",
    hintModalBg: "bg-[#f5f8f6] border-emerald-600/30 text-emerald-955 rounded-[32px] shadow-[0_15px_40px_rgba(74,114,86,0.1)]",
    globalBg: "bg-[#f3f7f4] text-emerald-955 font-sans min-h-screen",
    headerBgClass: "bg-emerald-50/90 backdrop-blur-md border-b border-emerald-600/10",
    headerTextClass: "text-emerald-800 font-bold",
    footerBgClass: "bg-emerald-50/50 border-t border-emerald-600/15 text-emerald-800/60"
  },
  chalkboard: {
    key: "chalkboard",
    isSamurai: false,
    isYokai: false,
    isZen: false,
    isDefault: false,
    isChalkboard: true,

    headerTextColor: "text-emerald-300",
    headerIconColor: "text-yellow-400",
    progressTrackBg: "bg-[#0e2716] border border-white/10",
    progressBarBg: "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_8px_rgba(250,204,21,0.4)]",

    cardContainer: "chalkboard-theme-base rounded-2xl text-slate-100 border-4 chalkboard-wood-border shadow-[0_15px_30px_rgba(0,0,0,0.3)]",
    cardHeaderBg: "bg-black/15 border-b border-white/10",
    cardIndexText: "text-slate-300/70 font-mono",
    badgeBg: "bg-white/10 text-slate-100 border border-white/15",

    wordPanelBg: "bg-black/10 border border-white/5 shadow-inner",
    wordTextHover: "text-white hover:text-yellow-300 drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]",
    wordSubText: "text-emerald-200/80",
    wordAudioBtn: "bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20 hover:text-white",
    meaningBadge: "bg-yellow-400 text-slate-950 font-black shadow-md",

    breakdownPanelBg: "bg-white/5 border border-white/10",
    breakdownIconColor: "text-yellow-400",
    breakdownTitleColor: "text-emerald-200 font-bold",
    breakdownItemBg: "bg-black/20 border-white/10 hover:border-white/30 hover:bg-black/35",
    breakdownKanjiBox: "text-yellow-300 bg-white/5 border border-white/20 hover:bg-white/10",
    breakdownKanjiMeaning: "text-slate-100",
    breakdownMnemonicText: "text-slate-200/90",
    breakdownEmptyText: "text-slate-450",

    exampleBoxBg: "bg-black/25 border border-white/10 text-slate-100",
    exampleOverlayText: "text-white/5",
    exampleTitleColor: "text-yellow-400",
    exampleAudioBtn: "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/25",
    exampleJapText: "text-white",
    exampleHiraText: "text-emerald-200/80",
    examplePronunciationText: "text-yellow-200",
    exampleMeaningText: "text-slate-200 border-white/10",

    footerBg: "bg-transparent border-t border-white/10",
    btnSecondary: "bg-white/5 hover:bg-white/15 text-slate-200 border border-white/20 rounded-xl",
    btnPrimary: "bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-xl border border-yellow-500 shadow-md",

    sealBadgeClass: "chalkboard-seal-badge inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-md border-2 border-dashed border-yellow-400 text-yellow-300 opacity-90 select-none",
    choiceBtnBase: "chalkboard-button text-slate-200 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 p-3.5 sm:p-4.5 rounded-xl text-sm transition-all duration-200",
    choiceBtnSelected: "chalkboard-button-selected text-yellow-300 font-black rounded-xl border-2 border-yellow-400 bg-white/5 ring-1 ring-yellow-400/30 shadow-md shadow-yellow-400/5",
    choiceIdxBase: "bg-white/10 text-slate-300 border border-white/15 rounded-full",
    choiceIdxSelected: "bg-yellow-400 text-slate-950 font-bold rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]",
    checkIconColor: "text-yellow-400",
    choiceTextNormal: "text-slate-200",
    choiceTextSelected: "text-yellow-300",

    // Kanji specific
    badgeGradeBg: "bg-[#143520] text-yellow-300 border border-yellow-300/30",
    kanjiTextHover: "text-white hover:text-yellow-300/90 font-sans",
    kanjiAudioBtn: "bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20 hover:text-white",
    kanjiMeaningBadge: "bg-yellow-400 text-slate-950 font-black shadow-md",
    mnemonicPanelBg: "bg-white/5 border border-white/10",
    mnemonicIconColor: "text-yellow-400",
    mnemonicTitleColor: "text-emerald-200",
    radicalItemBg: "bg-black/20 border border-white/10 hover:border-white/30 hover:bg-black/35 hover:shadow-2xs active:scale-[0.99]",
    radicalKanjiBox: "text-yellow-300 bg-white/5 border border-white/20 group-hover:bg-white/10",
    radicalKanjiMeaning: "text-slate-100",
    radicalItemBadge: "text-yellow-400 bg-white/10 border border-yellow-500/30 group-hover:bg-white/15",
    radicalItemBadgeIcon: "text-yellow-400",
    tableBorder: "border-white/10",
    tableHeaderCol: "bg-black/15 text-slate-200 border-white/10",
    tableHeaderLabelText: "text-emerald-300/50",
    tableValueCol: "bg-transparent",
    tableJapText: "text-white",
    tableOnyomiKoreanBadge: "bg-yellow-400/20 text-yellow-300 border border-yellow-500/30",
    tableHunyomiKoreanBadge: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    tableAudioBtn: "bg-white/10 border border-white/20 text-slate-200 hover:bg-white/20 hover:text-white",
    relatedWordCard: "bg-black/10 hover:bg-black/20 border-white/10 hover:border-white/25",
    relatedWordJapText: "text-white",
    relatedWordSubText: "text-emerald-200/70",
    relatedWordPronunciationText: "text-yellow-200/90",
    relatedWordMeaningText: "text-slate-350 border-white/10",
    exampleTitleColorKanji: "text-yellow-400",
    examplePronunciationTextKanji: "text-yellow-200",
    btnPrimaryKanji: "bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-xl border border-yellow-500",

    // JLPT specific
    headerIconColorKanji: "text-yellow-400",
    progressTrackBgJlpt: "bg-[#0e2716] border border-white/10",
    progressBarBgJlpt: "bg-gradient-to-r from-yellow-400 to-amber-500",
    sealBadgeClassJlpt: "chalkboard-seal-badge inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-md border-2 border-dashed border-yellow-400 text-yellow-300 opacity-90 select-none",
    abandonLinkColor: "text-slate-300 hover:text-white",
    questionInstructionColor: "text-emerald-300/70",
    questionInstructionIcon: "text-yellow-400",
    questionSentenceBox: "bg-black/20 border-white/10 text-white font-sans",
    blankFillBlock: "bg-yellow-400/10 border-yellow-400/40 text-yellow-300",
    highlightWordBlock: "bg-white/15 text-white border-white/20",
    questionPromptText: "text-slate-150",
    questionPromptSubText: "text-emerald-300/50",
    choiceBtnSelectedJlpt: "chalkboard-button-selected text-yellow-300 font-black rounded-xl border-2 border-yellow-400 bg-white/5 ring-1 ring-yellow-400/30",
    choiceIdxSelectedJlpt: "bg-yellow-400 text-slate-950 font-bold rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]",
    checkIconColorJlpt: "text-yellow-400",
    choiceTextNormalJlpt: "text-slate-200",
    choiceTextSelectedJlpt: "text-yellow-300",
    btnSecondaryJlpt: "bg-white/5 hover:bg-white/15 text-slate-200 border border-white/20 rounded-xl",
    btnNextJlpt: "bg-slate-100 hover:bg-white text-slate-950 font-bold",
    btnGradeJlpt: "bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold",

    // Quiz specific
    headerIconColorQuiz: "text-yellow-400",
    progressBarBgQuiz: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]",
    quizDisplayBox: "bg-black/15 border border-white/10 rounded-2xl",
    blankFillBlockQuiz: "bg-yellow-400/15 border-yellow-400/40 text-yellow-300",
    quizBigDisplayHint: "text-slate-100",
    btnNextQuiz: "bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl",
    btnGradeQuiz: "bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold rounded-xl",
    radicalsBoxBg: "bg-black/10 border border-white/10",

    wordPronunciationBlock: "bg-black/25 border border-white/20",
    wordPronunciationText: "text-emerald-100 font-bold",
    btnHintQuiz: "border border-dashed border-white/20 text-yellow-300 bg-white/5 hover:bg-white/10",
    hintModalBg: "bg-[#163024] border border-white/20 text-slate-100 rounded-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.4)] font-mono",
    globalBg: "bg-[#0b2415] text-slate-100 font-sans min-h-screen",
    headerBgClass: "bg-black/25 border-b border-white/10",
    headerTextClass: "text-yellow-400 font-bold",
    footerBgClass: "bg-black/25 border-t border-white/10 text-slate-350/70"
  },
  golden_sakura: {
    key: "golden_sakura",
    isSamurai: false,
    isYokai: false,
    isZen: false,
    isDefault: false,
    isChalkboard: false,

    headerTextColor: "text-rose-900",
    headerIconColor: "text-rose-500",
    progressTrackBg: "bg-rose-100",
    progressBarBg: "bg-gradient-to-r from-rose-400 to-amber-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]",

    cardContainer: "bg-white/90 border border-rose-200/80 shadow-[0_8px_30px_rgba(244,63,94,0.06)] rounded-3xl text-rose-950 font-sans",
    cardHeaderBg: "bg-rose-50/50 border-b border-rose-100/50",
    cardIndexText: "text-rose-400/80 font-mono",
    badgeBg: "bg-rose-100 text-rose-700 border border-rose-200/30",

    wordPanelBg: "bg-rose-50/30 border border-rose-100/60 shadow-inner",
    wordTextHover: "text-rose-900 hover:text-rose-600 drop-shadow-[0_2px_8px_rgba(244,63,94,0.15)]",
    wordSubText: "text-rose-400",
    wordAudioBtn: "bg-white/80 border border-rose-200/50 hover:bg-rose-50 text-rose-500 hover:text-rose-600",
    meaningBadge: "bg-rose-600 text-white shadow-sm",

    breakdownPanelBg: "bg-amber-50/40 border border-amber-200/50",
    breakdownIconColor: "text-rose-500/80",
    breakdownTitleColor: "text-rose-800",
    breakdownItemBg: "bg-white/60 border border-rose-100/50 hover:border-rose-300",
    breakdownKanjiBox: "text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100",
    breakdownKanjiMeaning: "text-rose-900",
    breakdownMnemonicText: "text-rose-700/80 font-sans",
    breakdownEmptyText: "text-rose-400",

    exampleBoxBg: "bg-[#4c1d39] text-[#fff1f2] border border-rose-950/20 shadow-md",
    exampleOverlayText: "text-white/5",
    exampleTitleColor: "text-rose-300",
    exampleAudioBtn: "bg-white/10 hover:bg-white/20 text-[#fff1f2] border border-white/10",
    exampleJapText: "text-white drop-shadow-[0_2px_4px_rgba(244,63,94,0.2)]",
    exampleHiraText: "text-rose-300/80",
    examplePronunciationText: "text-amber-200",
    exampleMeaningText: "text-rose-100/80 border-rose-800/40",

    footerBg: "bg-transparent border-t border-rose-100",
    btnSecondary: "bg-white/80 hover:bg-rose-50/50 text-rose-800 rounded-xl border border-rose-200/60 shadow-3xs",
    btnPrimary: "bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-md",

    sealBadgeClass: "px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-3xs",
    choiceBtnBase: "bg-white/60 border-rose-200 hover:border-rose-300 text-rose-800 hover:bg-rose-50/30 rounded-xl border shadow-2xs p-3.5",
    choiceBtnSelected: "bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/20 shadow-sm rounded-xl border p-3.5",
    choiceIdxBase: "bg-rose-100 text-rose-500 rounded-full",
    choiceIdxSelected: "bg-rose-500 text-white font-bold rounded-full",
    checkIconColor: "text-rose-500",
    choiceTextNormal: "text-rose-900 font-medium",
    choiceTextSelected: "text-rose-950 font-bold",

    // Kanji specific
    badgeGradeBg: "bg-rose-50/50 border border-rose-200 text-rose-700",
    kanjiTextHover: "text-rose-955 hover:text-rose-700",
    kanjiAudioBtn: "bg-white/80 border border-rose-200/50 hover:bg-rose-50 text-rose-500 hover:text-rose-600",
    kanjiMeaningBadge: "bg-rose-600 text-white",
    mnemonicPanelBg: "bg-rose-50/40 border border-rose-200/40",
    mnemonicIconColor: "text-rose-400",
    mnemonicTitleColor: "text-rose-800",
    radicalItemBg: "bg-white/70 border border-rose-100/60 shadow-3xs hover:border-rose-300 hover:bg-rose-50/20",
    radicalKanjiBox: "text-rose-700 bg-rose-50 border border-rose-100/60 group-hover:bg-rose-100/80",
    radicalKanjiMeaning: "text-rose-900",
    radicalItemBadge: "text-rose-800 bg-rose-50 border border-rose-200 group-hover:bg-rose-100",
    radicalItemBadgeIcon: "text-rose-500",
    tableBorder: "border-rose-100",
    tableHeaderCol: "bg-rose-50/50 text-rose-800 border-rose-100",
    tableHeaderLabelText: "text-rose-400",
    tableValueCol: "bg-white/40",
    tableJapText: "text-rose-900",
    tableOnyomiKoreanBadge: "bg-rose-100 text-rose-900 border border-rose-200/20",
    tableHunyomiKoreanBadge: "bg-amber-100 text-amber-900 border border-amber-200/20",
    tableAudioBtn: "bg-white/80 border border-rose-200/50 hover:bg-rose-50 text-rose-500 hover:text-rose-600",
    relatedWordCard: "bg-rose-50/20 hover:bg-rose-50 border-rose-100 hover:border-rose-200",
    relatedWordJapText: "text-rose-900",
    relatedWordSubText: "text-rose-400",
    relatedWordPronunciationText: "text-rose-600",
    relatedWordMeaningText: "text-rose-800/80 border-rose-100/60",
    exampleTitleColorKanji: "text-rose-300",
    examplePronunciationTextKanji: "text-amber-200",
    btnPrimaryKanji: "bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-md",

    // JLPT specific
    headerIconColorKanji: "text-rose-500",
    progressTrackBgJlpt: "bg-rose-100",
    progressBarBgJlpt: "bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400",
    sealBadgeClassJlpt: "px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-3xs",
    abandonLinkColor: "text-rose-500 hover:text-rose-700",
    questionInstructionColor: "text-rose-450",
    questionInstructionIcon: "text-rose-500",
    questionSentenceBox: "bg-rose-50/30 border-rose-100 text-rose-900 font-sans",
    blankFillBlock: "bg-rose-100 border-rose-300 text-rose-800",
    highlightWordBlock: "bg-rose-200/80 text-rose-950 border-rose-300/85",
    questionPromptText: "text-rose-950",
    questionPromptSubText: "text-rose-400",
    choiceBtnSelectedJlpt: "bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/20 shadow-sm rounded-xl border p-3.5",
    choiceIdxSelectedJlpt: "bg-rose-500 text-white font-bold rounded-full",
    checkIconColorJlpt: "text-rose-500",
    choiceTextNormalJlpt: "text-rose-800",
    choiceTextSelectedJlpt: "text-rose-900",
    btnSecondaryJlpt: "bg-white/80 hover:bg-rose-50/50 text-rose-700 border-rose-200 rounded-xl shadow-3xs",
    btnNextJlpt: "bg-rose-900 hover:bg-rose-850 text-white rounded-xl",
    btnGradeJlpt: "bg-gradient-to-r from-rose-400 via-pink-500 to-amber-500 text-white rounded-xl shadow-md",

    // Quiz specific
    headerIconColorQuiz: "text-rose-500",
    progressBarBgQuiz: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
    quizDisplayBox: "bg-rose-50/20 border border-rose-100/60 rounded-2xl",
    blankFillBlockQuiz: "bg-rose-100 border-rose-300 text-rose-800",
    quizBigDisplayHint: "text-rose-500",
    btnNextQuiz: "bg-rose-900 hover:bg-rose-850 text-white rounded-xl shadow-3xs",
    btnGradeQuiz: "bg-gradient-to-r from-rose-400 via-pink-500 to-amber-500 text-white rounded-xl shadow-md",
    radicalsBoxBg: "bg-rose-50/30 border border-rose-100",

    wordPronunciationBlock: "bg-rose-50/40 border border-rose-200",
    wordPronunciationText: "text-rose-850 font-bold",
    btnHintQuiz: "border border-dashed border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50",
    hintModalBg: "bg-white/95 border-rose-200/80 text-rose-800 rounded-xl shadow-[0_10px_30px_rgba(244,63,94,0.15)]",
    globalBg: "bg-gradient-to-tr from-[#fff1f2] via-[#fff5f6] to-[#fffbeb] text-rose-950 min-h-screen selection:bg-rose-200",
    headerBgClass: "bg-white/80 border-b border-rose-200/50 backdrop-blur-md",
    headerTextClass: "text-rose-900 font-bold",
    footerBgClass: "bg-white border-t border-rose-100 text-rose-450"
  },
  golden_aura: {
    key: "golden_aura",
    isSamurai: false,
    isYokai: false,
    isZen: false,
    isDefault: false,
    isChalkboard: false,

    headerTextColor: "text-amber-400",
    headerIconColor: "text-amber-500",
    progressTrackBg: "bg-stone-900 shadow-inner",
    progressBarBg: "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",

    cardContainer: "bg-[#171412]/95 border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.12)] rounded-3xl text-stone-200 font-sans relative overflow-hidden",
    cardHeaderBg: "bg-stone-900/40 border-b border-stone-800",
    cardIndexText: "text-amber-500/70 font-mono",
    badgeBg: "bg-amber-950/40 text-amber-400 border border-amber-500/20",

    wordPanelBg: "bg-stone-900/30 border border-stone-850 shadow-inner",
    wordTextHover: "text-white hover:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    wordSubText: "text-stone-450",
    wordAudioBtn: "bg-stone-900 border border-amber-500/20 text-stone-300 hover:bg-stone-800 hover:text-white",
    meaningBadge: "bg-amber-500 text-stone-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]",

    breakdownPanelBg: "bg-amber-950/10 border border-amber-500/20",
    breakdownIconColor: "text-amber-400",
    breakdownTitleColor: "text-amber-400",
    breakdownItemBg: "bg-stone-900/40 border border-stone-800 hover:border-amber-500/30 text-stone-200",
    breakdownKanjiBox: "text-amber-400 bg-stone-950 border border-amber-500/30 hover:bg-stone-900",
    breakdownKanjiMeaning: "text-stone-200",
    breakdownMnemonicText: "text-stone-300/80 font-sans",
    breakdownEmptyText: "text-stone-500",

    exampleBoxBg: "bg-stone-950 border border-amber-500/20 text-stone-100 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]",
    exampleOverlayText: "text-white/5",
    exampleTitleColor: "text-amber-400",
    exampleAudioBtn: "bg-stone-900 hover:bg-stone-850 text-amber-400 border border-amber-500/20",
    exampleJapText: "text-white drop-shadow-[0_0_6px_rgba(245,158,11,0.2)]",
    exampleHiraText: "text-stone-400",
    examplePronunciationText: "text-amber-200",
    exampleMeaningText: "text-stone-300 border-stone-800",

    footerBg: "bg-transparent border-t border-stone-900",
    btnSecondary: "bg-stone-900/60 hover:bg-stone-900 text-amber-400 rounded-xl border border-amber-500/20 shadow-sm",
    btnPrimary: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-bold rounded-xl border border-amber-400/50 shadow-md",

    sealBadgeClass: "px-2.5 py-1 bg-stone-900 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-3xs",
    choiceBtnBase: "bg-stone-950/40 border-stone-800 hover:border-amber-500/30 text-stone-300 hover:bg-[#252220] rounded-xl border transition-all duration-200 p-3.5",
    choiceBtnSelected: "bg-amber-950/30 border-amber-400 text-amber-100 ring-2 ring-amber-400/20 shadow-md rounded-xl border p-3.5",
    choiceIdxBase: "bg-stone-900 text-stone-450 rounded-full",
    choiceIdxSelected: "bg-amber-500 text-stone-950 font-bold rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    checkIconColor: "text-amber-400",
    choiceTextNormal: "text-stone-300",
    choiceTextSelected: "text-amber-100",

    // Kanji specific
    badgeGradeBg: "bg-amber-955/40 text-amber-400 border border-amber-500/20",
    kanjiTextHover: "text-white hover:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    kanjiAudioBtn: "bg-stone-900 border border-amber-500/20 text-stone-300 hover:bg-stone-800 hover:text-white",
    kanjiMeaningBadge: "bg-amber-500 text-stone-950 font-bold",
    mnemonicPanelBg: "bg-amber-950/10 border border-amber-500/20",
    mnemonicIconColor: "text-amber-450",
    mnemonicTitleColor: "text-amber-400",
    radicalItemBg: "bg-stone-900/40 border border-stone-800 hover:border-amber-500/30 hover:bg-[#221f1d]",
    radicalKanjiBox: "text-amber-450 bg-stone-950 border border-amber-500/30 group-hover:bg-stone-900",
    radicalKanjiMeaning: "text-stone-200",
    radicalItemBadge: "text-stone-300 bg-stone-900 border border-stone-800 group-hover:bg-[#221f1d]",
    radicalItemBadgeIcon: "text-amber-500",
    tableBorder: "border-stone-800",
    tableHeaderCol: "bg-stone-900/50 text-stone-300 border-stone-800",
    tableHeaderLabelText: "text-stone-500",
    tableValueCol: "bg-transparent",
    tableJapText: "text-stone-200",
    tableOnyomiKoreanBadge: "bg-amber-950 text-amber-300 border border-amber-500/20",
    tableHunyomiKoreanBadge: "bg-stone-900 text-stone-300 border border-stone-700",
    tableAudioBtn: "bg-stone-900 border border-amber-500/20 text-stone-300 hover:bg-stone-850",
    relatedWordCard: "bg-stone-900/20 hover:bg-stone-900/40 border-stone-850 hover:border-amber-500/20",
    relatedWordJapText: "text-stone-200",
    relatedWordSubText: "text-stone-550",
    relatedWordPronunciationText: "text-amber-300",
    relatedWordMeaningText: "text-stone-400 border-stone-800",
    exampleTitleColorKanji: "text-amber-400",
    examplePronunciationTextKanji: "text-amber-200",
    btnPrimaryKanji: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-bold rounded-xl border border-amber-400/50 shadow-md",

    // JLPT specific
    headerIconColorKanji: "text-amber-500",
    progressTrackBgJlpt: "bg-stone-900",
    progressBarBgJlpt: "bg-gradient-to-r from-amber-500 to-yellow-500",
    sealBadgeClassJlpt: "px-2.5 py-1 bg-stone-900 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-3xs",
    abandonLinkColor: "text-stone-400 hover:text-amber-400",
    questionInstructionColor: "text-stone-500",
    questionInstructionIcon: "text-amber-400",
    questionSentenceBox: "bg-stone-900/30 border border-stone-800 text-stone-200 font-sans",
    blankFillBlock: "bg-amber-950/20 border-amber-500/40 text-amber-350",
    highlightWordBlock: "bg-amber-500/10 text-white border-amber-500/30",
    questionPromptText: "text-stone-200",
    questionPromptSubText: "text-stone-500",
    choiceBtnSelectedJlpt: "bg-amber-955/30 border-amber-400 text-amber-100 ring-2 ring-amber-400/20 shadow-md rounded-xl border p-3.5",
    choiceIdxSelectedJlpt: "bg-amber-500 text-stone-950 font-bold rounded-full",
    checkIconColorJlpt: "text-amber-450",
    choiceTextNormalJlpt: "text-stone-300",
    choiceTextSelectedJlpt: "text-amber-100",
    btnSecondaryJlpt: "bg-stone-900/60 hover:bg-stone-900 text-stone-300 border-stone-800 rounded-xl shadow-3xs",
    btnNextJlpt: "bg-amber-500 hover:bg-amber-450 text-stone-950 font-bold rounded-xl border border-amber-400/40 shadow-sm",
    btnGradeJlpt: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-stone-950 font-extrabold rounded-xl shadow-md",

    // Quiz specific
    headerIconColorQuiz: "text-amber-400",
    progressBarBgQuiz: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    quizDisplayBox: "bg-[#171412] border border-stone-800 rounded-2xl",
    blankFillBlockQuiz: "bg-amber-950/20 border-amber-500/40 text-amber-350",
    quizBigDisplayHint: "text-stone-100",
    btnNextQuiz: "bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl border border-amber-500/20 shadow-sm",
    btnGradeQuiz: "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold rounded-xl border border-amber-400/50 shadow-md",
    radicalsBoxBg: "bg-[#120f0e] border border-stone-850",

    wordPronunciationBlock: "bg-stone-900/40 border border-stone-800",
    wordPronunciationText: "text-amber-300 font-bold",
    btnHintQuiz: "border border-dashed border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10",
    hintModalBg: "bg-stone-950 border-amber-500/30 text-stone-200 rounded-xl shadow-[0_10px_35px_rgba(245,158,11,0.1)]",
    globalBg: "bg-[#0c0a09] text-stone-200 min-h-screen",
    headerBgClass: "bg-[#1c1917]/90 border-b border-amber-500/20 backdrop-blur-md",
    headerTextClass: "text-amber-400 font-bold font-display",
    footerBgClass: "bg-[#120f0e] border-t border-stone-900 text-stone-500"
  }
};

export function getTheme(currentTheme: string): ThemeConfig {
  return THEME_CONFIGS[currentTheme] || THEME_CONFIGS.default;
}
