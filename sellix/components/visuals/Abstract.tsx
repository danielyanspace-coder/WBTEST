/**
 * Абстрактные SVG-визуалы вместо растровых картинок: лёгкие, чёткие на любом
 * экране, в фирменной неоновой палитре. Используются в hero и плитках.
 */

export function CrystalBlob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a3a3f" />
          <stop offset="100%" stopColor="#0d0d0e" />
        </linearGradient>
        <linearGradient id="cg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4ff1a" />
          <stop offset="100%" stopColor="#aee000" />
        </linearGradient>
      </defs>
      <g className="animate-float">
        <polygon points="200,40 330,130 300,300 110,320 70,140" fill="url(#cg)" stroke="#2a2a2e" />
        <polygon points="200,40 300,300 200,210" fill="#1a1a1d" opacity="0.8" />
        <polygon points="200,210 110,320 70,140" fill="#161618" />
        <polygon points="200,40 70,140 200,210" fill="#202023" />
        <circle cx="285" cy="120" r="14" fill="url(#cg2)" />
      </g>
    </svg>
  );
}

export function WaveLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 120" className={className} aria-hidden>
      <path
        d="M0,80 C40,20 70,20 100,60 C130,100 160,100 190,50 C220,10 250,30 300,70"
        fill="none"
        stroke="#0b0b0c"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="190" cy="50" r="6" fill="#0b0b0c" />
    </svg>
  );
}

export function MiniBars({ className }: { className?: string }) {
  const bars = [30, 55, 40, 70, 50, 90, 65];
  return (
    <svg viewBox="0 0 160 90" className={className} aria-hidden>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 22 + 6}
          y={90 - h}
          width="14"
          height={h}
          rx="4"
          fill={i === 5 ? "#c7f503" : "#34343a"}
        />
      ))}
    </svg>
  );
}
