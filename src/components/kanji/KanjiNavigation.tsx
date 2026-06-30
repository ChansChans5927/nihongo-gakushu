import React from "react";
import { ArrowRight } from "lucide-react";

// 내비게이션 Props 인터페이스 정의
interface KanjiNavigationProps {
  currentIndex: number;          // 현재 한자 인덱스 (0-based)
  totalCount: number;            // 전체 한자 개수
  handlePrevStudy: () => void;   // '이전 한자' 클릭 핸들러
  handleNextStudy: () => void;   // '다음 한자' 클릭 핸들러
  theme: any;                    // 적용된 테마 객체
}

// 하단 푸터 내비게이션 컨트롤러 컴포넌트 (테마별 마우스 클릭 이펙트 연동)
export function KanjiNavigation({
  currentIndex,
  totalCount,
  handlePrevStudy,
  handleNextStudy,
  theme
}: KanjiNavigationProps) {
  
  // 테마 특수 시각 이펙트를 실행한 후 다음 한자로 넘겨주는 위임 핸들러
  const handleNextWithEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonEl = e.currentTarget;

    if (theme.isYokai) {
      // 요괴 테마: 잔잔한 물결 원형 리플
      const rect = buttonEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'yokai-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
      ripple.style.transform = `translate(-50%, -50%) scale(0)`;

      buttonEl.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 500);
    } else if (theme.isZen) {
      // 젠 테마: 모래 물결 이펙트 2단계 방출
      const ripple1 = document.createElement('div');
      ripple1.className = 'zen-ripple';
      buttonEl.appendChild(ripple1);
      setTimeout(() => {
        ripple1.remove();
      }, 900);

      setTimeout(() => {
        if (buttonEl) {
          const ripple2 = document.createElement('div');
          ripple2.className = 'zen-ripple';
          buttonEl.appendChild(ripple2);
          setTimeout(() => {
            ripple2.remove();
          }, 900);
        }
      }, 150);
    } else if (theme.isChalkboard) {
      // 칠판 테마: 분필 입자 가루 스프레이 효과
      const rect = buttonEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const particleCount = 15;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'chalk-click-particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = 20 + Math.random() * 60; // 흩어지는 거리
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        const size = 2.5 + Math.random() * 4; // 입자 반경

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        buttonEl.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 800);
      }
    }

    // 다음 한자 공부 페이지 전환
    handleNextStudy();
  };

  return (
    <div className={`px-5 py-4 flex items-center justify-between z-10 relative ${theme.footerBg}`}>
      {/* 이전 한자 버튼 */}
      <button
        onClick={handlePrevStudy}
        disabled={currentIndex === 0}
        className={`py-3 px-5 text-sm font-bold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${theme.btnSecondary}`}
      >
        이전 한자
      </button>

      {/* 현재 전체 한자 진도 진행률 표시 (모바일 미표시) */}
      <div className={`text-xs font-mono hidden sm:block ${theme.cardIndexText}`}>
        {currentIndex + 1} / {totalCount} 완독 진행
      </div>

      {/* 이해했음 (다음) 전환 버튼 */}
      <button
        onClick={handleNextWithEffect}
        className={`py-3 px-6 text-sm font-bold shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 overflow-hidden relative ${theme.btnPrimaryKanji}`}
      >
        <span className="z-10 relative">이해했음 (다음)</span>
        <ArrowRight className="w-4 h-4 z-10 relative" />
      </button>
    </div>
  );
}
