// Original vector illustration (no external image, no network, scales to any size).
export function HeroArt() {
  return (
    <svg viewBox="0 0 480 400" role="img" aria-label="Illustration of a dairy farm with a barn, a cow, green hills and a milk bottle" className="h-auto w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d1fae5" />
          <stop offset="1" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="480" height="400" rx="28" fill="url(#sky)" />
      <circle cx="390" cy="82" r="38" fill="#fde68a" opacity="0.9" />
      <path d="M0 250 Q110 190 220 235 T480 215 V400 H0Z" fill="#a7f3d0" />
      <path d="M0 290 Q130 235 260 280 T480 265 V400 H0Z" fill="url(#hill)" />
      <path d="M0 345 Q150 305 290 340 T480 330 V400 H0Z" fill="#047857" />

      {/* barn */}
      <g transform="translate(40 168)">
        <rect x="0" y="40" width="120" height="88" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M-10 44 L60 0 L130 44Z" fill="#047857" />
        <rect x="42" y="72" width="36" height="56" rx="3" fill="#10b981" />
        <path d="M42 72 L78 128 M78 72 L42 128" stroke="#f8fafc" strokeWidth="3" />
        <circle cx="60" cy="26" r="7" fill="#f8fafc" />
      </g>

      {/* cow */}
      <g transform="translate(190 255)">
        <rect x="14" y="62" width="9" height="34" rx="3" fill="#475569" />
        <rect x="34" y="62" width="9" height="34" rx="3" fill="#475569" />
        <rect x="90" y="62" width="9" height="34" rx="3" fill="#475569" />
        <rect x="110" y="62" width="9" height="34" rx="3" fill="#475569" />
        <rect x="6" y="20" width="118" height="60" rx="28" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        <ellipse cx="42" cy="42" rx="14" ry="10" fill="#475569" />
        <ellipse cx="96" cy="58" rx="12" ry="9" fill="#475569" />
        <rect x="-26" y="14" width="46" height="38" rx="16" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        <ellipse cx="-12" cy="46" rx="14" ry="9" fill="#fecdd3" />
        <circle cx="-8" cy="30" r="3" fill="#0f172a" />
        <path d="M-20 14 L-26 2 M8 14 L16 2" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <path d="M124 38 Q142 44 140 66" stroke="#475569" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* milk bottle */}
      <g transform="translate(372 232)">
        <rect x="14" y="0" width="34" height="14" rx="4" fill="#10b981" />
        <path d="M18 14 H44 L56 44 V128 a10 10 0 0 1 -10 10 H16 a10 10 0 0 1 -10 -10 V44Z" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="6" y="66" width="50" height="40" fill="#d1fae5" />
        <path d="M31 76 c8 9 11 14 11 19 a11 11 0 0 1 -22 0 c0 -5 3 -10 11 -19Z" fill="#10b981" />
      </g>
    </svg>
  );
}
