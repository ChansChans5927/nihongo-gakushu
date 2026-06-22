export interface ThemeConfig {
  key: string;
  isSamurai: boolean;
  isYokai: boolean;
  isZen: boolean;
  isDefault: boolean;

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
  strokeCountText: string;
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
}

export const THEME_CONFIGS: Record<string, ThemeConfig> = {
  default: {
    key: "default",
    isSamurai: false,
    isYokai: false,
    isZen: false,
    isDefault: true,

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

    footerBg: "bg-slate-50 border-t border-slate-100",
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
    strokeCountText: "text-slate-400",
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
    radicalsBoxBg: "bg-slate-50 border border-slate-100"
  },
  samurai: {
    key: "samurai",
    isSamurai: true,
    isYokai: false,
    isZen: false,
    isDefault: false,

    headerTextColor: "text-amber-900",
    headerIconColor: "text-amber-800",
    progressTrackBg: "bg-amber-900/20",
    progressBarBg: "bg-[#8b4513]",

    cardContainer: "bg-[#f4e8d1] border-y-[12px] border-y-[#3e2723] border-x-2 border-x-amber-900/30 rounded-md shadow-[inset_0_0_50px_rgba(139,69,19,0.15),0_10px_20px_rgba(0,0,0,0.1)] font-serif text-amber-950",
    cardHeaderBg: "bg-[rgba(255,255,255,0.2)] border-b border-amber-900/20",
    cardIndexText: "text-amber-900/70",
    badgeBg: "bg-amber-900/20 text-amber-950",

    wordPanelBg: "samurai-card-texture sword-glint",
    wordTextHover: "text-amber-950 hover:text-red-800 ink-reveal",
    wordSubText: "text-amber-900/70",
    wordAudioBtn: "bg-amber-900/20 border border-amber-900/40 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]",
    meaningBadge: "bg-[#3e2723] text-[#f4e8d1]",

    breakdownPanelBg: "bg-amber-900/10 border border-amber-900/20",
    breakdownIconColor: "text-amber-700",
    breakdownTitleColor: "text-amber-950",
    breakdownItemBg: "bg-[rgba(255,255,255,0.3)] border-amber-900/20 hover:border-amber-900/40",
    breakdownKanjiBox: "text-red-800 bg-[#f4e8d1] border border-amber-900/30 hover:bg-[#f8f5ec]",
    breakdownKanjiMeaning: "text-amber-950",
    breakdownMnemonicText: "text-amber-900/70 font-serif",
    breakdownEmptyText: "text-amber-900/55",

    exampleBoxBg: "bg-[rgba(255,255,255,0.3)] border border-amber-900/20 text-amber-950",
    exampleOverlayText: "text-amber-900/10",
    exampleTitleColor: "text-amber-900/80",
    exampleAudioBtn: "bg-amber-900/10 hover:bg-amber-900/20 text-amber-950",
    exampleJapText: "text-amber-950",
    exampleHiraText: "text-amber-900/70",
    examplePronunciationText: "text-red-800",
    exampleMeaningText: "text-amber-950 border-amber-900/20",

    footerBg: "bg-transparent border-t border-amber-900/20",
    btnSecondary: "bg-transparent hover:bg-amber-900/10 text-amber-950 border border-amber-900/30 rounded-none",
    btnPrimary: "bg-[#3e2723] hover:bg-[#2d1b18] text-[#f4e8d1] rounded-none border border-amber-900/50",

    sealBadgeClass: "inline-block px-3 py-1 bg-transparent text-red-800 border-2 border-red-800 text-[11px] font-bold uppercase tracking-widest rounded-sm transform -rotate-2 opacity-90 select-none",
    choiceBtnBase: "bg-transparent border-amber-900/40 hover:border-amber-950 text-amber-950 hover:bg-amber-900/5 border-2 rounded-none sword-glint p-3 sm:p-4 text-sm",
    choiceBtnSelected: "bg-amber-900/10 border-amber-950 text-amber-950 font-serif rounded-none ring-1 ring-amber-950 border-2",
    choiceIdxBase: "bg-transparent text-amber-950 border border-amber-900/50 rounded-none font-bold",
    choiceIdxSelected: "bg-red-800 text-amber-50 font-bold rounded-sm border-2 border-red-900 transform -rotate-3",
    checkIconColor: "text-red-800",
    choiceTextNormal: "text-amber-950 font-serif",
    choiceTextSelected: "text-amber-950 font-serif",

    // Kanji specific (samurai)
    badgeGradeBg: "bg-[#3e2723] text-[#f4e8d1] border border-amber-900/50",
    strokeCountText: "text-amber-950/70",
    kanjiTextHover: "text-amber-950 hover:text-red-800 ink-reveal",
    kanjiAudioBtn: "bg-amber-900/20 border border-amber-900/40 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]",
    kanjiMeaningBadge: "bg-[#3e2723] text-[#f4e8d1]",
    mnemonicPanelBg: "bg-amber-900/10 border border-amber-900/20",
    mnemonicIconColor: "text-amber-700",
    mnemonicTitleColor: "text-amber-950",
    radicalItemBg: "bg-[rgba(255,255,255,0.3)] border border-amber-900/20 hover:border-amber-900/40 hover:bg-[rgba(255,255,255,0.5)]",
    radicalKanjiBox: "text-red-800 bg-[#f4e8d1] border border-amber-900/30 group-hover:bg-[#f8f5ec]",
    radicalKanjiMeaning: "text-amber-950",
    radicalItemBadge: "text-red-900 bg-amber-900/10 border border-amber-900/20",
    radicalItemBadgeIcon: "text-red-700",
    tableBorder: "border-amber-900/20",
    tableHeaderCol: "bg-[rgba(255,255,255,0.2)] text-amber-950 border-amber-900/20",
    tableHeaderLabelText: "text-amber-900/60",
    tableValueCol: "bg-transparent",
    tableJapText: "text-amber-950",
    tableOnyomiKoreanBadge: "bg-amber-900/10 text-amber-900",
    tableHunyomiKoreanBadge: "bg-red-900/10 text-red-900",
    tableAudioBtn: "bg-amber-900/20 border border-amber-900/40 text-amber-950 hover:bg-[#3e2723] hover:text-[#f4e8d1]",
    relatedWordCard: "bg-transparent hover:bg-[rgba(255,255,255,0.2)] border-amber-900/20 hover:border-amber-900/40",
    relatedWordJapText: "text-amber-950",
    relatedWordSubText: "text-amber-900/70",
    relatedWordPronunciationText: "text-amber-950",
    relatedWordMeaningText: "text-amber-900 border-amber-900/20",
    exampleTitleColorKanji: "text-amber-900/80",
    examplePronunciationTextKanji: "text-red-800",
    btnPrimaryKanji: "bg-[#3e2723] hover:bg-[#2d1b18] text-[#f4e8d1] rounded-none border border-amber-900/50",

    // JLPT specific (samurai)
    headerIconColorKanji: "text-amber-800",
    progressTrackBgJlpt: "bg-amber-900/10",
    progressBarBgJlpt: "bg-gradient-to-r from-amber-700 to-red-800",
    sealBadgeClassJlpt: "inline-block px-3 py-1 bg-transparent text-red-800 border-2 border-red-800 text-[11px] font-bold uppercase tracking-widest rounded-sm transform -rotate-2 opacity-90 select-none",
    abandonLinkColor: "text-amber-900/60 hover:text-amber-900",
    questionInstructionColor: "text-amber-900/80",
    questionInstructionIcon: "text-amber-800",
    questionSentenceBox: "bg-[rgba(255,255,255,0.3)] border-amber-900/20 text-amber-950 font-serif",
    blankFillBlock: "bg-amber-900/5 border-amber-900/30 text-amber-900 font-sans",
    highlightWordBlock: "bg-amber-900/10 text-amber-950 border-amber-900/20",
    questionPromptText: "text-amber-950",
    questionPromptSubText: "text-amber-900/70",
    choiceBtnSelectedJlpt: "bg-amber-900/10 border-amber-950 text-amber-950 font-serif rounded-none ring-1 ring-amber-950 border-2",
    choiceIdxSelectedJlpt: "bg-red-800 text-amber-50 font-bold rounded-sm border-2 border-red-900 transform -rotate-3",
    checkIconColorJlpt: "text-red-800",
    choiceTextNormalJlpt: "text-amber-950",
    choiceTextSelectedJlpt: "text-amber-950",
    btnSecondaryJlpt: "bg-transparent text-amber-950 border border-amber-900/20 hover:bg-amber-900/10 rounded-none",
    btnNextJlpt: "bg-amber-950 hover:bg-amber-900 text-[#f4e8d1]",
    btnGradeJlpt: "bg-gradient-to-r from-red-800 to-amber-900 text-amber-100",

    // Quiz specific (samurai)
    headerIconColorQuiz: "text-amber-800",
    progressBarBgQuiz: "bg-[#8b4513]",
    quizDisplayBox: "bg-[rgba(255,255,255,0.2)] border-y border-y-amber-900/20 shadow-inner",
    blankFillBlockQuiz: "bg-amber-900/10 border-amber-900/40 text-amber-900",
    quizBigDisplayHint: "text-red-800",
    btnNextQuiz: "bg-[#3e2723] hover:bg-[#2d1b18] text-[#f4e8d1] rounded-none border border-amber-900/50",
    btnGradeQuiz: "bg-gradient-to-r from-red-800 to-red-955 hover:from-red-900 hover:to-black text-amber-50 rounded-none border-2 border-red-955",
    radicalsBoxBg: "bg-amber-900/5 border border-amber-900/20"
  },
  yokai: {
    key: "yokai",
    isSamurai: false,
    isYokai: true,
    isZen: false,
    isDefault: false,

    headerTextColor: "text-[#0ea5e9]",
    headerIconColor: "text-[#0ea5e9]",
    progressTrackBg: "bg-[#0f172a]/80 shadow-[inset_0_0_5px_rgba(14,165,233,0.2)]",
    progressBarBg: "bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.8)]",

    cardContainer: "yokai-theme-base rounded-xl text-slate-200",
    cardHeaderBg: "bg-[#0f172a]/80 border-b border-[#38bdf8]/30 backdrop-blur-md",
    cardIndexText: "text-[#38bdf8]",
    badgeBg: "bg-[#030712] text-[#0ea5e9] border border-[#38bdf8]/50",

    wordPanelBg: "bg-[#0f172a]/50 border border-[#0ea5e9]/30 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)] backdrop-blur-sm z-10",
    wordTextHover: "text-[#f8f9fa] hover:text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]",
    wordSubText: "text-[#38bdf8]/70",
    wordAudioBtn: "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white hover:shadow-[0_0_15px_rgba(14,165,233,0.6)]",
    meaningBadge: "bg-[#0ea5e9] text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]",

    breakdownPanelBg: "bg-[#0f172a]/60 border border-[#0ea5e9]/30",
    breakdownIconColor: "text-[#38bdf8]",
    breakdownTitleColor: "text-[#38bdf8]",
    breakdownItemBg: "bg-[#0f172a]/40 border-[#38bdf8]/20 hover:border-[#38bdf8]/50",
    breakdownKanjiBox: "text-[#38bdf8] bg-[#030712] border border-[#38bdf8]/50 hover:bg-[#0f172a]",
    breakdownKanjiMeaning: "text-slate-200",
    breakdownMnemonicText: "text-[#38bdf8]/70",
    breakdownEmptyText: "text-slate-400",

    exampleBoxBg: "bg-[#030712]/80 border border-[#0ea5e9]/30 text-slate-200",
    exampleOverlayText: "text-[#38bdf8]/5",
    exampleTitleColor: "text-[#38bdf8]",
    exampleAudioBtn: "bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30",
    exampleJapText: "text-[#f8f9fa] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]",
    exampleHiraText: "text-[#38bdf8]/70",
    examplePronunciationText: "text-[#0ea5e9]",
    exampleMeaningText: "text-[#e2e8f0] border-[#0ea5e9]/30",

    footerBg: "bg-transparent border-t border-[#0ea5e9]/30",
    btnSecondary: "bg-transparent hover:bg-[#0ea5e9]/20 text-[#e2e8f0] border border-[#0ea5e9]/40 rounded-lg",
    btnPrimary: "yokai-button-selected text-white rounded-lg border border-[#38bdf8] shadow-[0_0_15px_rgba(14,165,233,0.4)]",

    sealBadgeClass: "yokai-seal-badge inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-sm transform -rotate-1 opacity-90 select-none",
    choiceBtnBase: "yokai-button text-[#e2e8f0] rounded-xl border p-3 sm:p-4 text-sm",
    choiceBtnSelected: "yokai-button-selected text-white rounded-xl border",
    choiceIdxBase: "bg-[#0f172a] text-[#38bdf8] border border-[#0ea5e9]/30 rounded-full",
    choiceIdxSelected: "bg-[#0ea5e9] text-white shadow-[0_0_10px_rgba(14,165,233,0.8)] rounded-full",
    checkIconColor: "text-[#38bdf8]",
    choiceTextNormal: "text-slate-200",
    choiceTextSelected: "text-white",

    // Kanji specific (yokai)
    badgeGradeBg: "bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30",
    strokeCountText: "text-[#38bdf8]/70",
    kanjiTextHover: "text-[#f8f9fa] hover:text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]",
    kanjiAudioBtn: "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white hover:shadow-[0_0_15px_rgba(14,165,233,0.6)]",
    kanjiMeaningBadge: "bg-[#030712] text-[#e2e8f0] border border-[#0ea5e9]/40 shadow-[0_0_10px_rgba(14,165,233,0.2)]",
    mnemonicPanelBg: "bg-[#0f172a]/60 border border-[#0ea5e9]/30",
    mnemonicIconColor: "text-[#38bdf8]",
    mnemonicTitleColor: "text-[#38bdf8]",
    radicalItemBg: "bg-[#0f172a]/80 border border-[#38bdf8]/20 hover:border-[#38bdf8]/50 hover:bg-[#0f172a] shadow-[inset_0_0_10px_rgba(14,165,233,0.05)]",
    radicalKanjiBox: "text-[#38bdf8] bg-[#030712] border border-[#38bdf8]/40 group-hover:bg-[#0f172a]",
    radicalKanjiMeaning: "text-slate-200",
    radicalItemBadge: "text-[#0ea5e9] bg-[#0f172a] border border-[#0ea5e9]/40 group-hover:bg-[#0ea5e9]/20",
    radicalItemBadgeIcon: "text-[#38bdf8]",
    tableBorder: "border-[#0ea5e9]/30",
    tableHeaderCol: "bg-[#030712]/80 text-[#38bdf8] border-[#0ea5e9]/30",
    tableHeaderLabelText: "text-[#38bdf8]/60",
    tableValueCol: "bg-[#0f172a]/50",
    tableJapText: "text-[#f8f9fa]",
    tableOnyomiKoreanBadge: "bg-[#0ea5e9]/20 text-[#38bdf8]",
    tableHunyomiKoreanBadge: "bg-rose-900/20 text-rose-400 border border-rose-900/50",
    tableAudioBtn: "bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#0ea5e9] hover:text-white",
    relatedWordCard: "bg-[#030712]/50 hover:bg-[#0ea5e9]/10 border-[#0ea5e9]/20 hover:border-[#0ea5e9]/50",
    relatedWordJapText: "text-[#f8f9fa]",
    relatedWordSubText: "text-[#38bdf8]/70",
    relatedWordPronunciationText: "text-[#38bdf8]",
    relatedWordMeaningText: "text-slate-300 border-[#0ea5e9]/30",
    exampleTitleColorKanji: "text-[#38bdf8]",
    examplePronunciationTextKanji: "text-[#0ea5e9]",
    btnPrimaryKanji: "yokai-button-selected text-white rounded-lg border border-[#38bdf8] shadow-[0_0_15px_rgba(14,165,233,0.4)]",

    // JLPT specific (yokai)
    headerIconColorKanji: "text-[#0ea5e9]",
    progressTrackBgJlpt: "bg-[#0ea5e9]/10",
    progressBarBgJlpt: "bg-gradient-to-r from-cyan-600 to-blue-600",
    sealBadgeClassJlpt: "yokai-seal-badge inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-sm transform -rotate-1 opacity-90 select-none",
    abandonLinkColor: "text-[#38bdf8]/60 hover:text-[#38bdf8]",
    questionInstructionColor: "text-[#38bdf8]/80",
    questionInstructionIcon: "text-[#0ea5e9]",
    questionSentenceBox: "bg-[#030712]/50 border-[#0ea5e9]/20 text-[#f8f9fa] font-sans",
    blankFillBlock: "bg-[#0ea5e9]/10 border-[#0ea5e9]/40 text-[#38bdf8] font-sans",
    highlightWordBlock: "bg-[#0ea5e9]/20 text-white border-[#0ea5e9]/30",
    questionPromptText: "text-[#f8f9fa]",
    questionPromptSubText: "text-[#38bdf8]/70",
    choiceBtnSelectedJlpt: "yokai-button-selected text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]",
    choiceIdxSelectedJlpt: "bg-[#0ea5e9] text-white shadow-[0_0_10px_rgba(14,165,233,0.8)]",
    checkIconColorJlpt: "text-[#38bdf8]",
    choiceTextNormalJlpt: "text-[#e2e8f0]",
    choiceTextSelectedJlpt: "text-white",
    btnSecondaryJlpt: "bg-transparent text-slate-300 border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/10 rounded-xl",
    btnNextJlpt: "bg-[#0ea5e9] hover:bg-sky-500 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]",
    btnGradeJlpt: "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]",

    // Quiz specific (yokai)
    headerIconColorQuiz: "text-[#0ea5e9]",
    progressBarBgQuiz: "bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.8)]",
    quizDisplayBox: "bg-[#0f172a]/50 border-y border-[#38bdf8]/30 backdrop-blur-sm",
    blankFillBlockQuiz: "bg-[#38bdf8]/10 border-[#38bdf8]/40 text-[#38bdf8]",
    quizBigDisplayHint: "text-[#38bdf8]",
    btnNextQuiz: "bg-[#0f172a] hover:bg-[#1e293b] text-[#38bdf8] border border-[#0ea5e9]/50 rounded-lg shadow-[0_0_10px_rgba(14,165,233,0.2)]",
    btnGradeQuiz: "yokai-button-selected text-white rounded-lg border border-[#38bdf8] shadow-[0_0_15px_rgba(14,165,233,0.4)]",
    radicalsBoxBg: "bg-[#0c1322]/80 border border-[#0ea5e9]/20"
  },
  zen: {
    key: "zen",
    isSamurai: false,
    isYokai: false,
    isZen: true,
    isDefault: false,

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
    btnPrimary: "zen-button-selected text-white rounded-lg border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",

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
    strokeCountText: "text-emerald-800/50",
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
    btnPrimaryKanji: "zen-button-selected text-white rounded-lg border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",

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
    btnNextJlpt: "bg-[#ffffff] hover:bg-emerald-50 text-emerald-800 border border-emerald-600/30 rounded-lg shadow-sm",
    btnGradeJlpt: "zen-button-selected text-white border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",

    // Quiz specific (zen)
    headerIconColorQuiz: "text-emerald-600",
    progressBarBgQuiz: "bg-emerald-600",
    quizDisplayBox: "bg-[#ffffff] border-y border-y-emerald-600/10",
    blankFillBlockQuiz: "bg-emerald-800/10 border-emerald-600/40 text-emerald-800",
    quizBigDisplayHint: "text-emerald-600",
    btnNextQuiz: "bg-[#ffffff] hover:bg-emerald-50 text-emerald-800 border border-emerald-600/30 rounded-lg",
    btnGradeQuiz: "zen-button-selected text-white rounded-lg border border-emerald-600 shadow-[0_4px_14px_rgba(74,114,86,0.2)]",
    radicalsBoxBg: "bg-emerald-50/40 border border-emerald-600/10"
  }
};

export function getTheme(currentTheme: string): ThemeConfig {
  return THEME_CONFIGS[currentTheme] || THEME_CONFIGS.default;
}
