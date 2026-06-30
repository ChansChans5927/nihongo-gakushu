import React from "react";
import { SubtitleLine } from "../../types";

// 자막 탭 Props 인터페이스
interface NewsSubtitlesTabProps {
  subtitles: SubtitleLine[];                                // 자막 데이터 배열
  activeSubtitleIndex: number;                             // 현재 하이라이트 자막 인덱스
  handleSubtitleClick: (start: number, idx: number) => void; // 자막 클릭 함수
  subtitleContainerRef: React.RefObject<HTMLDivElement | null>; // 자막 자동 스크롤 컨테이너 Ref
}

// 탭 1: 전체 뉴스 대본 자막 및 실시간 시각 연동 스크롤 리스트
export function NewsSubtitlesTab({
  subtitles,
  activeSubtitleIndex,
  handleSubtitleClick,
  subtitleContainerRef
}: NewsSubtitlesTabProps) {
  return (
    <div className="space-y-4">
      {/* 학습 가이드 상자 */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
        <h3 className="text-sm font-bold text-slate-700 mb-2">📰 뉴스 요약 및 스크립트</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          영상을 시청하면서 자막 리스트의 구절을 클릭하면 해당 구간으로 바로 이동하여 집중 반복 학습을 할 수 있습니다. 
          하단의 중요 단어와 퀴즈 탭을 풀기 전에 먼저 뉴스의 호흡과 아나운서의 발음을 익혀 보세요!
        </p>
      </div>

      {/* 자막 리스트 박스 (최대 높이 초과 시 스크롤 생성) */}
      <div 
        ref={subtitleContainerRef} 
        className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto scrollbar-thin scroll-smooth"
      >
        {subtitles.map((sub, idx) => {
          const isActive = idx === activeSubtitleIndex;
          
          return (
            <div
              key={idx}
              data-index={idx}
              onClick={() => handleSubtitleClick(sub.start, idx)}
              className={`p-4 transition-all cursor-pointer flex flex-col gap-1 text-left ${
                isActive
                  ? "bg-rose-50/60"
                  : "hover:bg-slate-50/50"
              }`}
            >
              {/* 타임스탬프 태그 배지 */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 bg-slate-100'}`}>
                  {Math.floor(sub.start / 60)}:{Math.floor(sub.start % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* 원문 (일본어, 띄어쓰기 기준 조각 나눔) */}
              <p className={`text-sm font-bold mt-1.5 leading-relaxed ${isActive ? "text-rose-600" : "text-slate-800"}`}>
                {(sub.japanese || "").split(" / ").map((chunk, ci, arr) => (
                  <React.Fragment key={ci}>
                    {chunk}{ci < arr.length - 1 && <span className="text-slate-300 mx-1">/</span>}
                  </React.Fragment>
                ))}
              </p>

              {/* 히라가나 요미가나 및 한국어 발음 가이드 */}
              <p className="text-xs text-rose-400 font-mono mt-1 leading-relaxed">
                {((sub.pronunciation || sub.hiragana || "")).split(" / ").map((chunk, ci, arr) => (
                  <React.Fragment key={ci}>
                    {chunk}{ci < arr.length - 1 && <span className="text-slate-200 mx-1">/</span>}
                  </React.Fragment>
                ))}
              </p>

              {/* 한국어 대역 해석 */}
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {(sub.korean || "").split(" / ").map((chunk, ci, arr) => (
                  <React.Fragment key={ci}>
                    {chunk}{ci < arr.length - 1 && <span className="text-slate-300 mx-1">/</span>}
                  </React.Fragment>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
