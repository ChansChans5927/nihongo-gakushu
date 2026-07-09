import React from "react";
import { ArrowRight } from "lucide-react";

// 푸터 내비게이션Props 인터페이스 정의
interface VocabNavigationProps {
  currentIndex: number;          // 현재 단어의 인덱스 (0-based)
  totalCount: number;            // 전체 단어 수
  handlePrevStudy: () => void;   // '이전 단어' 클릭 이벤트 핸들러
  handleNextStudy: () => void;   // '다음 단어' 클릭 이벤트 핸들러
  theme: any;                    // 적용된 디자인 테마 객체
}

// 단어 카드 하단 내비게이션 버튼 바 컴포넌트 (테마별 이펙트 이벤트 바인딩 포함)
export function VocabNavigation({
  currentIndex,
  totalCount,
  handlePrevStudy,
  handleNextStudy,
  theme
}: VocabNavigationProps) {
  
  // 테마별 클릭 이펙트 처리 및 다음 단어 이벤트 위임 핸들러
  const handleNextWithEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    const buttonEl = e.currentTarget;
    
    if (theme.isYokai) {
      // 요괴 테마: 요괴 혼령 회오리 (Yokai Spirit Swirl)
      const rect = buttonEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const clickWrapper = document.createElement('div');
      clickWrapper.className = 'yokai-spirit-click';
      clickWrapper.style.left = `${clickX}px`;
      clickWrapper.style.top = `${clickY}px`;

      const flame = document.createElement('div');
      flame.className = 'yokai-spirit-flame';
      
      const ring = document.createElement('div');
      ring.className = 'yokai-spirit-ring';

      clickWrapper.appendChild(flame);
      clickWrapper.appendChild(ring);
      buttonEl.appendChild(clickWrapper);

      setTimeout(() => {
        clickWrapper.remove();
      }, 850);

      buttonEl.classList.add('yokai-select-pulse');
      setTimeout(() => buttonEl.classList.remove('yokai-select-pulse'), 800);
    } else if (theme.isZen) {
      // 젠 테마: 잔잔한 모래 파동 이펙트 2회 연속 재생
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
      // 칠판 테마: 분필 가루(입자) 방출 이펙트
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
        const size = 2.5 + Math.random() * 4; // 입자 크기

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

    // 다음 학습 단어로 상태 업데이트
    handleNextStudy();
  };

  return (
    <div className={`px-5 py-4 flex items-center justify-between z-10 relative ${theme.footerBg}`}>
      {/* 이전 단어 버튼 (첫 단어일 경우 비활성화) */}
      <button
        onClick={handlePrevStudy}
        disabled={currentIndex === 0}
        className={`py-3 px-5 text-sm font-bold transition-colors disabled:cursor-not-allowed cursor-pointer disabled:opacity-35 ${theme.btnSecondary}`}
      >
        이전 단어
      </button>

      {/* 모바일 화면에서는 가려지는 현재 진도율 요약 정보 */}
      <div className={`text-xs font-mono hidden sm:block ${theme.cardIndexText}`}>
        {currentIndex + 1} / {totalCount} 완독 진행
      </div>

      {/* 이해했음 (다음) 버튼 및 테마 애니메이션 효과 매핑 */}
      <button
        onClick={handleNextWithEffect}
        className={`py-3 px-6 text-sm font-bold shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 overflow-hidden relative ${theme.btnPrimary}`}
      >
        <span className="z-10 relative">이해했음 (다음)</span>
        <ArrowRight className="w-4 h-4 z-10 relative" />
      </button>
    </div>
  );
}
