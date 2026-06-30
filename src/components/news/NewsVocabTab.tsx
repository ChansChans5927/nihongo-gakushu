import React from "react";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { VocabItem } from "../../types";

// 단어 탭 Props 인터페이스
interface NewsVocabTabProps {
  vocabItems: VocabItem[];                                                             // 단어 목록
  vocabIndex: number;                                                                  // 현재 단어 인덱스
  setVocabIndex: React.Dispatch<React.SetStateAction<number>>;                         // 단어 인덱스 변경 제어 상태 함수
  handleTTS: (text: string) => void;                                                  // TTS 사운드 핸들러
  speechActive: string | null;                                                         // 오디오 재생 중 여부
  renderHighlightedSentence: (text: string, fallbackWord: string) => React.ReactNode;  // 예문 단어 하이라이트 함수
}

// 탭 2: 중요 단어 학습용 플래시카드 컴포넌트 (부수 분석 스토리 및 예문 결합)
export function NewsVocabTab({
  vocabItems,
  vocabIndex,
  setVocabIndex,
  handleTTS,
  speechActive,
  renderHighlightedSentence
}: NewsVocabTabProps) {
  const currentVocab = vocabItems[vocabIndex];

  return (
    <div className="flex flex-col items-center">
      {/* 단어 플래시 카드 카드 박스 */}
      <div className="w-full max-w-lg bg-gradient-to-tr from-amber-50/50 to-orange-50/30 border border-orange-200/60 p-6 rounded-3xl shadow-sm text-center space-y-5">
        <div className="flex items-center justify-between">
          {/* JLPT 레벨 라벨 */}
          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 border border-orange-200/50 px-3 py-1 rounded-full">
            {currentVocab.jlptLevel || "N1~N3"}
          </span>

          {/* 오디오 발음 청취 버튼 */}
          <button
            onClick={() => handleTTS(currentVocab.word)}
            className={`p-2 rounded-full border shadow-sm transition-all cursor-pointer ${
              speechActive === currentVocab.word
                ? "bg-rose-500 border-rose-500 text-white animate-pulse"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="단어 발음 듣기"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* 단어 표기, 발음, 해석 */}
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {currentVocab.word}
          </h3>
          <p className="text-sm font-mono text-slate-500 mt-1">
            {currentVocab.pronunciation}
          </p>
          <p className="text-lg font-bold text-slate-800 mt-2 bg-white/80 border border-slate-200/60 py-1.5 px-4 rounded-full inline-block">
            {currentVocab.meaning}
          </p>
        </div>

        {/* 구성 자형 부수 정보 및 한자 연상 기억 스토리 */}
        {currentVocab.kanjiBreakdown && currentVocab.kanjiBreakdown.length > 0 && (
          <div className="text-left bg-white p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1">🧩 한자 연상 기억 스토리</h4>
            {currentVocab.kanjiBreakdown.map((kb, kIdx) => (
              <div key={kIdx} className="text-xs space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <strong className="text-rose-500 font-mono text-sm bg-rose-50 border border-rose-100 w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                    {kb.kanji}
                  </strong>
                  <span className="font-semibold text-slate-800">({kb.meaning})</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed pl-6">
                  {kb.mnemonic}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 예문 및 해석 가이드 박스 */}
        {currentVocab.exampleSentence && (
          <div className="text-left bg-rose-50/20 p-4 rounded-2xl border border-rose-100/50 space-y-1">
            <h4 className="text-xs font-bold text-rose-600 mb-1">💬 뉴스 문맥 예문</h4>
            <p className="text-sm font-bold text-slate-800 leading-relaxed mb-1">
              {renderHighlightedSentence(currentVocab.exampleSentence.japanese, currentVocab.word)}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {currentVocab.exampleSentence.pronunciation}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {currentVocab.exampleSentence.meaning}
            </p>
          </div>
        )}
      </div>

      {/* 카드 내비게이션 컨트롤러 (이전/다음 카드 이동) */}
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={() => setVocabIndex((prev) => Math.max(0, prev - 1))}
          disabled={vocabIndex === 0}
          className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-mono font-bold text-slate-500">
          {vocabIndex + 1} / {vocabItems.length}
        </span>
        <button
          onClick={() => setVocabIndex((prev) => Math.min(vocabItems.length - 1, prev + 1))}
          disabled={vocabIndex === vocabItems.length - 1}
          className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
