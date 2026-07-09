import React from "react";
import { CheckCircle2 } from "lucide-react";

// 보기 선택 Props 인터페이스
interface JlptChoicesProps {
  choices: string[];                                 // 보기 4개 배열
  selectedChoiceIdx?: number;                        // 현재 선택된 보기의 인덱스
  slashingChoice: number | null;                     // 검 이펙트 실행 중인 보기 인덱스
  onSelect: (choiceIdx: number) => void;             // 선택 이벤트 콜백 함수
  theme: any;                                        // 테마 스타일 객체
}

// 4지선다형 객관식 보기 리스트 컴포넌트 (테마별 마우스 이펙트 바인딩)
export function JlptChoices({
  choices,
  selectedChoiceIdx,
  slashingChoice,
  onSelect,
  theme
}: JlptChoicesProps) {
  
  // 보기 선택 시 테마별 클릭 이펙트 연출을 처리하는 위임 함수
  const handleChoiceClick = (e: React.MouseEvent<HTMLButtonElement>, choiceIdx: number) => {
    const buttonEl = e.currentTarget;

    if (theme.isYokai) {
      // 요괴 테마: 물결 원형 파동 이펙트
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
      // 젠 테마: 모래 파동 이펙트 2연속 방출
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
      // 칠판 테마: 분필 먼지 가루 방출 이펙트
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
        const velocity = 20 + Math.random() * 60;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        const size = 2.5 + Math.random() * 4;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        buttonEl.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 800);
      }
    } else if (theme.key === 'golden_sakura') {
      const rect = buttonEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Sakura Burst Particles
      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'sakura-burst-particle';
        particle.style.left = `${clickX}px`;
        particle.style.top = `${clickY}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = 30 + Math.random() * 80;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        const size = 6 + Math.random() * 8;
        const rot = (Math.random() - 0.5) * 360;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--rot', `${rot}deg`);

        buttonEl.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 800);
      }

      // Add pulse shadow class
      buttonEl.classList.add('sakura-select-pulse');
      setTimeout(() => buttonEl.classList.remove('sakura-select-pulse'), 800);
    } else if (theme.key === 'golden_aura') {
      const rect = buttonEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Aura Shockwave
      const shockwave = document.createElement('div');
      shockwave.className = 'aura-shockwave';
      shockwave.style.left = `${clickX}px`;
      shockwave.style.top = `${clickY}px`;
      shockwave.style.width = '20px';
      shockwave.style.height = '20px';
      
      buttonEl.appendChild(shockwave);
      setTimeout(() => shockwave.remove(), 700);

      // Add halo button flash class
      buttonEl.classList.add('aura-select-flash');
      setTimeout(() => buttonEl.classList.remove('aura-select-flash'), 800);
    }

    // 부모 컴포넌트의 선택 이벤트 전파
    onSelect(choiceIdx);
  };

  return (
    <div className="grid grid-cols-1 gap-3 relative z-10">
      {choices.map((choice, choiceIdx) => {
        const isSelected = selectedChoiceIdx === choiceIdx;
        const isSlashing = slashingChoice === choiceIdx;

        // 테마에 따른 스타일 클래스 바인딩
        const baseStyles = theme.choiceBtnBase;
        const selectedStyles = theme.choiceBtnSelectedJlpt;
        const indexStyles = theme.choiceIdxBase;
        const selectedIndexStyles = theme.choiceIdxSelectedJlpt;
        const checkIconColor = theme.checkIconColorJlpt;
        
        const customClasses = theme.isSamurai 
          ? "border-2 rounded-none sword-glint" 
          : theme.isDefault 
            ? "rounded-xl border" 
            : "rounded-xl border-transparent";

        return (
          <button
            key={choiceIdx}
            onClick={(e) => handleChoiceClick(e, choiceIdx)}
            className={`w-full text-left p-3.5 sm:p-4.5 font-bold transition-all duration-200 flex items-center justify-between cursor-pointer relative overflow-hidden ${customClasses} ${isSelected ? selectedStyles : baseStyles} ${isSlashing ? "samurai-slash-effect scale-[0.98]" : ""}`}
          >
            {/* 보기 번호 및 보기 내용 */}
            <div className="flex items-center gap-4 relative z-10">
              <span className={`w-7 h-7 flex items-center justify-center font-mono text-xs ${theme.isSamurai ? "rounded-none" : "rounded-full"} ${isSelected ? selectedIndexStyles : indexStyles}`}>
                {choiceIdx + 1}
              </span>
              <span lang="ja" className={`text-sm sm:text-base font-semibold ${isSelected ? theme.choiceTextSelectedJlpt : theme.choiceTextNormalJlpt}`}>
                {choice}
              </span>
            </div>
            
            {/* 선택 완료 체크 표시 아이콘 */}
            {isSelected && (
              <CheckCircle2 className={`w-5 h-5 shrink-0 select-none relative z-10 ${checkIconColor}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
