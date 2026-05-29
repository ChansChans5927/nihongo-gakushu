import { motion } from "motion/react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { RadicalPart } from "../types";

interface RadicalModalProps {
  activeRadical: RadicalPart | null;
  onClose: () => void;
}

export function RadicalModal({ activeRadical, onClose }: RadicalModalProps) {
  if (!activeRadical) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />
      
      {/* Modal Body Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
        className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full overflow-hidden text-center space-y-5 z-10"
      >
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="모달 닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Decorative background circle */}
        <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center text-5xl font-serif font-black text-amber-600 shadow-sm">
          {activeRadical.component}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-amber-700 tracking-wider bg-amber-100/60 px-2.5 py-0.5 rounded-full border border-amber-200">
            부수/자형 파해
          </span>
          <h3 className="text-xl font-bold font-sans text-slate-800">
            {activeRadical.meaning}
          </h3>
        </div>

        {/* Mnemonic description section */}
        {activeRadical.mnemonic && (
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 text-justify space-y-1.5">
            <span className="text-[10px] font-extrabold text-amber-800 block tracking-wide text-center">
              💡 초보자를 위한 쉽게 외우는 비법
            </span>
            <p className="text-sm leading-relaxed text-slate-800 font-medium text-center">
              {activeRadical.mnemonic}
            </p>
          </div>
        )}

        {/* Sub Readings (optional, if generated) */}
        {(activeRadical.onyomi || activeRadical.hunyomi) && (
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/55 space-y-2">
            <span className="text-[9px] font-bold text-slate-400 block tracking-wide uppercase">
              참고 단독 독음
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs divide-x divide-slate-200/50 text-slate-600">
              {activeRadical.onyomi && (
                <div className="flex flex-col items-center justify-center gap-0.5 px-2">
                  <span className="text-[10px] text-slate-400 font-sans">음독</span>
                  <div className="flex items-center gap-1">
                    <strong className="text-slate-700 font-bold">{activeRadical.onyomi}</strong>
                    {activeRadical.onyomiKorean && (
                      <span className="text-amber-800 bg-amber-50 px-1 py-0.2 rounded font-black text-[9px]">
                        {activeRadical.onyomiKorean}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {activeRadical.hunyomi ? (
                <div className="flex flex-col items-center justify-center gap-0.5 px-2">
                  <span className="text-[10px] text-slate-400 font-sans">훈독</span>
                  <div className="flex items-center gap-1">
                    <strong className="text-slate-700 font-bold">{activeRadical.hunyomi?.replace(/\./g, "")}</strong>
                    {activeRadical.hunyomiKorean && (
                      <span className="text-amber-800 bg-amber-50 px-1 py-0.2 rounded font-black text-[9px]">
                        {activeRadical.hunyomiKorean}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                activeRadical.onyomi && <div className="text-[10px] text-slate-400 flex items-center justify-center">훈독 없음</div>
              )}
            </div>
          </div>
        )}

        {/* Close CTAs */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>네, 이해했습니다!</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
