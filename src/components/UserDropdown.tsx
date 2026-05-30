import React, { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserDropdownProps {
  username: string;
  onNavigateSettings: () => void;
  onLogout: () => void;
}

export function UserDropdown({ username, onNavigateSettings, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors focus:outline-none"
      >
        <User className="w-4 h-4 text-slate-600" />
        <span className="hidden sm:inline-flex text-xs font-semibold text-slate-800">
          <strong>{username}</strong>님
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">로그인된 계정</p>
              <p className="text-sm font-bold text-slate-800 truncate">{username}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateSettings();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                설정
              </button>
            </div>
            
            <div className="py-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                로그아웃
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
