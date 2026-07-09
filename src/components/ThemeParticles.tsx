import { getTheme } from "../theme";

interface ThemeParticlesProps {
  theme?: string;
}

export function ThemeParticles({ theme: themeKey = "default" }: ThemeParticlesProps) {
  const theme = getTheme(themeKey);

  if (theme.isSamurai) {
    return <div className="samurai-embers"></div>;
  }

  if (theme.isYokai) {
    return (
      <div className="yokai-wisps-container">
        <div className="yokai-wisp yokai-wisp-1"></div>
        <div className="yokai-wisp yokai-wisp-2"></div>
        <div className="yokai-wisp yokai-wisp-3"></div>
        <div className="yokai-wisp yokai-wisp-4"></div>
      </div>
    );
  }

  if (theme.isZen) {
    return (
      <div className="zen-leaves">
        <div className="leaf-1"></div>
        <div className="leaf-2"></div>
        <div className="leaf-3"></div>
        <div className="leaf-4"></div>
        <div className="leaf-5"></div>
      </div>
    );
  }

  if (theme.isChalkboard) {
    return (
      <div className="chalkboard-dust-particles">
        <div className="chalk-dust" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="chalk-dust" style={{ left: '30%', animationDelay: '-3s' }}></div>
        <div className="chalk-dust" style={{ left: '50%', animationDelay: '-6s' }}></div>
        <div className="chalk-dust" style={{ left: '70%', animationDelay: '-9s' }}></div>
        <div className="chalk-dust" style={{ left: '90%', animationDelay: '-12s' }}></div>
      </div>
    );
  }

  if (themeKey === 'golden_sakura') {
    // Generate 15 sakura petals with different properties
    const petals = Array.from({ length: 15 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = -(Math.random() * 15);
      const duration = 8 + Math.random() * 8;
      const scale = 0.5 + Math.random() * 0.7;
      
      return (
        <div 
          key={`sakura-${i}`}
          className="golden-sakura-petal" 
          style={{ 
            left: `${left}%`, 
            animationDelay: `${delay}s`, 
            animationDuration: `${duration}s`,
            transform: `scale(${scale})`
          }}
        />
      );
    });

    return (
      <div className="golden-sakura-particles overflow-hidden absolute inset-0 pointer-events-none z-0">
        {petals}
      </div>
    );
  }

  if (themeKey === 'golden_aura') {
    // Generate 20 aura particles with different properties
    const particles = Array.from({ length: 20 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = -(Math.random() * 10);
      const drift = (Math.random() - 0.5) * 60; // -30px to 30px
      const duration = 5 + Math.random() * 7;
      
      return (
        <div 
          key={`aura-${i}`}
          className="golden-aura-particle" 
          style={{ 
            left: `${left}%`, 
            animationDelay: `${delay}s`, 
            animationDuration: `${duration}s`,
            '--drift': `${drift}px` 
          } as any}
        />
      );
    });

    return (
      <div className="golden-aura-particles overflow-hidden absolute inset-0 pointer-events-none z-0">
        {particles}
      </div>
    );
  }

  return null;
}
