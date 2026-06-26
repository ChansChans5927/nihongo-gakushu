import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { useConfirmStore } from '../stores/confirmStore';

export function ConfirmModal() {
  const { isOpen, isAlert, message, onConfirm, onCancel } = useConfirmStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={!isAlert ? onCancel : onConfirm}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden z-10 border border-white/50"
          >
            <div className="p-8 pb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-100 rounded-[22px] flex items-center justify-center mb-6 shadow-inner border border-amber-100/50">
                <AlertCircle className="w-8 h-8 text-orange-500 drop-shadow-sm" strokeWidth={2.5} />
              </div>
              <p className="text-slate-800 font-bold whitespace-pre-wrap leading-snug text-lg break-keep px-2">{message}</p>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              {!isAlert && (
                <button
                  onClick={onCancel}
                  className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold rounded-2xl transition-all duration-200"
                >
                  취소
                </button>
              )}
              <button
                onClick={onConfirm}
                className={`flex-1 py-3.5 px-4 font-bold rounded-2xl transition-all duration-200 active:scale-95 ${
                  isAlert 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30'
                }`}
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
