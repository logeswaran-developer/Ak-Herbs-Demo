// Small inline SVG icon set matching the original AK Herbs design (leaf / nut / soap / bottle)
export function Icon({ type, size = 30, color = 'currentColor' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.4 };
  switch (type) {
    case 'nut':
      return (
        <svg {...common}>
          <path d="M12 2c3 0 5 2.5 5 6 0 5-2 12-5 12S7 13 7 8c0-3.5 2-6 5-6Z" />
          <path d="M9 8c1 1 5 1 6 0" />
        </svg>
      );
    case 'soap':
      return (
        <svg {...common}>
          <rect x="4" y="9" width="16" height="10" rx="3" />
          <path d="M8 9c0-2.5 1.8-4 4-4s4 1.5 4 4" />
        </svg>
      );
    case 'bottle':
      return (
        <svg {...common}>
          <path d="M10 2h4v3.5l2 2V21a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7.5l2-2V2Z" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'leaf':
    default:
      return (
        <svg {...common}>
          <path d="M4 20c8 0 15-6 16-16C11 5 5 12 5 20" />
          <path d="M5 20c0-4 2-8 7-11" />
        </svg>
      );
  }
}
