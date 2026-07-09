import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStudyStore } from "../stores/studyStore";
import { Gift, Zap, Check, Award, Lock } from "lucide-react";
import { getTheme } from "../theme";

export function StudyGrass() {
  const {
    studyLogs = {},
    claimedWeeklyRewards = [],
    claimedMilestones = [],
    claimWeeklyReward,
    claimMilestoneReward,
    currentTheme
  } = useStudyStore();

  const theme = getTheme(currentTheme);
  const [claimMsg, setClaimMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the far right (most recent dates) on mount or logs update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [studyLogs]);

  // 1. Calculate dates for 24 weeks of grass (168 days, ending on the Sunday of the current week)
  const getGrassDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    // Find the Sunday of the current week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDay = today.getDay();
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() + daysUntilSunday);

    // Go back 167 days from this Sunday to start on a Monday 23 weeks ago
    const startDate = new Date(currentSunday);
    startDate.setDate(currentSunday.getDate() - 167);

    for (let i = 0; i < 168; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const grassDates = getGrassDates();

  // Helper to format date to local YYYY-MM-DD string
  const formatDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 2. Count total study days
  const activeDays = Object.keys(studyLogs).filter(d => studyLogs[d] > 0);
  const totalStudyDays = activeDays.length;

  // 3. Compute current week info (Mon-Sun of this week)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Mon...
    const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1; // Mon is 0, Tue is 1... Sun is 6
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToSubtract);

    const weekDays: { dateStr: string, dayName: string, active: boolean }[] = [];
    const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatDateStr(d);
      weekDays.push({
        dateStr,
        dayName: dayNames[i],
        active: (studyLogs[dateStr] || 0) > 0
      });
    }
    return {
      weekStartStr: formatDateStr(monday),
      days: weekDays
    };
  };

  const currentWeek = getCurrentWeekDays();
  const currentWeekPerfect = currentWeek.days.every(d => d.active);
  const weeklyClaimed = claimedWeeklyRewards.includes(currentWeek.weekStartStr);

  // 4. Calculate Density Booster status (last 30 days)
  const getDensityBoosterStatus = () => {
    const todayStr = formatDateStr(new Date());
    const baseDate = new Date(todayStr);
    let studiedCount = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = formatDateStr(d);
      if (studyLogs[dateStr] && studyLogs[dateStr] > 0) {
        studiedCount++;
      }
    }
    return {
      activeCount: studiedCount,
      isActive: studiedCount >= 24
    };
  };

  const densityBooster = getDensityBoosterStatus();

  // 5. Reward handlers
  const handleWeeklyClaim = async () => {
    setClaimMsg(null);
    const success = await claimWeeklyReward(currentWeek.weekStartStr);
    if (success) {
      setClaimMsg({ type: 'success', text: "주간 완주 보상 300P 적립 완료!" });
      setTimeout(() => setClaimMsg(null), 4000);
    } else {
      setClaimMsg({ type: 'error', text: "보상 수령 조건을 확인해 주세요." });
    }
  };

  const handleMilestoneClaim = async (milestone: string, label: string) => {
    setClaimMsg(null);
    const success = await claimMilestoneReward(milestone);
    if (success) {
      const bonusText = milestone === "30" 
        ? " 골든 사쿠라 테마 획득!"
        : milestone === "100"
          ? " 황금빛 오라 테마 획득!"
          : ` ${milestone === '15' ? '500' : '0'}P 적립 완료!`;
      setClaimMsg({ type: 'success', text: `${label} 달성! ${bonusText}` });
      setTimeout(() => setClaimMsg(null), 5000);
    } else {
      setClaimMsg({ type: 'error', text: "아직 해금 조건 일수를 달성하지 못했습니다." });
    }
  };

  // 6. Grass Color Map according to theme
  const getGrassColor = (count: number) => {
    if (!count || count <= 0) {
      // Empty slot styling
      if (currentTheme === 'yokai' || currentTheme === 'golden_aura') return 'bg-stone-900 border border-stone-850';
      if (currentTheme === 'samurai' || currentTheme === 'chalkboard') return 'bg-black/10 border border-black/5';
      return 'bg-slate-100 border border-slate-200/50';
    }

    // Color maps (level 1-4)
    const colorMaps: Record<string, string[]> = {
      default: [
        'bg-emerald-200 border border-emerald-300/40',
        'bg-emerald-450 border border-emerald-500/40',
        'bg-emerald-600 border border-emerald-700/40',
        'bg-emerald-800 border border-emerald-900/40'
      ],
      zen: [
        'bg-emerald-100 border border-emerald-200',
        'bg-emerald-300 border border-emerald-400',
        'bg-emerald-500 border border-emerald-600',
        'bg-emerald-750 border border-emerald-900'
      ],
      samurai: [
        'bg-amber-800/30 border border-amber-800/40',
        'bg-amber-700/60 border border-amber-800/50',
        'bg-[#8b4513] border border-amber-900/40',
        'bg-red-800 border border-red-950/40'
      ],
      yokai: [
        'bg-violet-950/60 border border-violet-900/20',
        'bg-violet-800/40 border border-violet-700/30',
        'bg-violet-600/60 border border-violet-500/40 shadow-[0_0_6px_rgba(139,92,246,0.2)]',
        'bg-violet-400 border border-violet-200/60 shadow-[0_0_10px_rgba(167,139,250,0.5)]'
      ],
      chalkboard: [
        'bg-yellow-500/15 border border-yellow-500/20',
        'bg-yellow-400/40 border border-yellow-400/50',
        'bg-yellow-300/70 border border-yellow-400/70',
        'bg-yellow-200 border border-white/80'
      ],
      golden_sakura: [
        'bg-rose-200 border border-rose-300/30',
        'bg-rose-400 border border-rose-500/30',
        'bg-pink-500 border border-rose-600/40 shadow-[0_0_6px_rgba(244,63,94,0.2)]',
        'bg-amber-400 border border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
      ],
      golden_aura: [
        'bg-amber-950/30 border border-amber-900/20',
        'bg-amber-800/60 border border-amber-900/40',
        'bg-amber-500 border border-yellow-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
        'bg-yellow-400 border border-white shadow-[0_0_14px_rgba(250,204,21,0.7)]'
      ]
    };

    const map = colorMaps[currentTheme] || colorMaps.default;
    if (count <= 2) return map[0];
    if (count <= 5) return map[1];
    if (count <= 9) return map[2];
    return map[3];
  };

  return (
    <div className={`p-5 rounded-3xl border transition-colors duration-300 ${theme.cardContainer}`}>
      {/* Top row: Summary stats and point density booster */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-dashed border-slate-200/50">
        <div className="space-y-1">
          <h4 className={`text-base font-bold flex items-center gap-1.5 ${theme.breakdownKanjiMeaning}`}>
            <Award className="w-5 h-5 text-amber-500" />
            <span>내 학습 성장판</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${theme.badgeBg}`}>
              누적 잔디: {totalStudyDays}일
            </span>
          </h4>
          <p className={`text-xs ${theme.wordSubText}`}>
            매일 공부를 마쳐 격자를 색칠하고 특별한 혜택 상자를 받으세요!
          </p>
        </div>

        {/* 1.5x Point booster details */}
        <div>
          {densityBooster.isActive ? (
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 px-3 py-1.5 rounded-2xl text-[11px] font-bold shadow-2xs animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>밀도 버프 활성 (포인트 1.5배!)</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-semibold border ${theme.wordPanelBg} ${theme.tableBorder} ${theme.wordSubText}`}>
              <Zap className="w-3.5 h-3.5" />
              <span>밀도 버프 대기 (최근 30일 중 {densityBooster.activeCount}/24일 학습)</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column: 24-week study grass grid */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.wordSubText}`}>최근 24주 학습 잔디</span>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
              <span>Less</span>
              <div className={`w-2.5 h-2.5 rounded-[2px] ${getGrassColor(0)}`}></div>
              <div className={`w-2.5 h-2.5 rounded-[2px] ${getGrassColor(2)}`}></div>
              <div className={`w-2.5 h-2.5 rounded-[2px] ${getGrassColor(5)}`}></div>
              <div className={`w-2.5 h-2.5 rounded-[2px] ${getGrassColor(9)}`}></div>
              <div className={`w-2.5 h-2.5 rounded-[2px] ${getGrassColor(10)}`}></div>
              <span>More</span>
            </div>
          </div>

          {/* Grass grid body */}
          <div ref={scrollRef} className={`pt-9 pb-5 px-4 rounded-2xl border flex flex-col justify-center items-center flex-1 overflow-x-auto ${theme.wordPanelBg} ${theme.tableBorder}`}>
            <div className="grid grid-flow-col grid-rows-7 gap-[4px] min-w-[420px] my-auto">
              {grassDates.map((date, idx) => {
                const dateStr = formatDateStr(date);
                const count = studyLogs[dateStr] || 0;
                return (
                  <div
                    key={dateStr}
                    className={`w-[15px] h-[15px] rounded-[3px] transition-all hover:scale-120 hover:z-50 duration-150 relative group cursor-pointer ${getGrassColor(count)}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 bg-slate-900 text-white text-[9px] rounded py-1 px-2 whitespace-nowrap shadow-md pointer-events-none font-mono">
                      {dateStr} : {count > 0 ? `${count}개 완료` : '기록 없음'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Perfect & Milestones */}
        <div className="flex flex-col gap-4 justify-stretch">
          {/* 1. Weekly Perfect box */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between flex-1 min-h-[110px] ${theme.wordPanelBg} ${theme.tableBorder}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.wordSubText}`}>주간 완주 보상 (월-일)</span>
              {weeklyClaimed ? (
                <span className="text-[10px] bg-slate-500/10 text-slate-500 font-bold px-2 py-0.5 rounded">수령 완료</span>
              ) : currentWeekPerfect ? (
                <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded shadow-xs animate-bounce">수령 대기</span>
              ) : (
                <span className="text-[10px] bg-slate-500/10 text-slate-400 font-semibold px-2 py-0.5 rounded">진행 중</span>
              )}
            </div>

            {/* Mon-Sun tracker */}
            <div className="flex items-center justify-between gap-1.5 my-2">
              {currentWeek.days.map((d) => (
                <div key={d.dateStr} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-3xs transition-all duration-300 ${
                    d.active
                      ? 'bg-emerald-500 text-white scale-105'
                      : 'bg-slate-200/40 border border-slate-300/30 text-slate-400'
                  }`}>
                    {d.active ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : d.dayName}
                  </div>
                </div>
              ))}
            </div>

            {/* Claim weekly box button */}
            <button
              onClick={handleWeeklyClaim}
              disabled={weeklyClaimed || !currentWeekPerfect}
              className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                weeklyClaimed
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-350/20'
                  : currentWeekPerfect
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md cursor-pointer scale-102 active:scale-98'
                    : 'bg-slate-200/50 text-slate-400 border border-slate-300/20 cursor-not-allowed'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>주간 상자 열기 (+300P)</span>
            </button>
          </div>

          {/* 2. Cumulative Milestones */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-center gap-3 flex-1 min-h-[110px] ${theme.wordPanelBg} ${theme.tableBorder}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme.wordSubText}`}>누적 잔디 마일스톤</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: "15", label: "15일", points: "500P" },
                { count: "30", label: "30일", points: "골든 사쿠라 테마" },
                { count: "100", label: "100일", points: "황금빛 오라 테마" }
              ].map((ms) => {
                const claimed = claimedMilestones.includes(ms.count);
                const claimable = totalStudyDays >= parseInt(ms.count);
                return (
                  <button
                    key={ms.count}
                    onClick={() => handleMilestoneClaim(ms.count, ms.label)}
                    disabled={claimed || !claimable}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center border transition-all ${
                      claimed
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300/10'
                        : claimable
                          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-md cursor-pointer hover:scale-105 active:scale-95 animate-pulse'
                          : 'bg-slate-200/40 text-slate-450 border-slate-200/10 cursor-not-allowed flex items-center justify-center'
                    }`}
                  >
                    <span className="text-[10px] font-black flex items-center gap-0.5">
                      {!claimed && !claimable && <Lock className="w-2.5 h-2.5 opacity-60" />}
                      {ms.label}
                    </span>
                    <span className="text-[9px] font-medium leading-none">{claimed ? '수령됨' : ms.points}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating success / error alerts inside card */}
      <AnimatePresence>
        {claimMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 p-3 rounded-xl text-xs font-semibold text-center ${
              claimMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {claimMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
