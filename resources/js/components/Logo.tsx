import { SVGAttributes } from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon';
  className?: string;
}

/**
 * Themed Logo for DTC Platform.
 * Uses the amber → orange gradient that matches the rest of the UI theme.
 */
export default function Logo({ variant = 'horizontal', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return <LogoMark className={className} />;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <LogoMark className="w-9 h-9" />
        <div className="text-center leading-tight">
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-gray-900">
            DTC
          </p>
          <p className="text-[9px] font-semibold tracking-[0.18em] text-amber-600">
            PLATFORM
          </p>
        </div>
      </div>
    );
  }

  // horizontal (default)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="w-8 h-8" />
      <div className="leading-tight">
        <p className="text-base font-extrabold tracking-tight text-gray-900">
          DTC <span className="text-amber-600">Platform</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Logo Mark (icon only) ─────────────────────────────── */
function LogoMark(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="dtcAmber" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="55%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="dtcAmberLight" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#dtcAmber)" />

      {/* Subtle shine */}
      <path
        d="M4 8 C4 5 6 4 9 4 H31 C34 4 36 6 36 9 V18 C28 12 14 12 4 18 Z"
        fill="url(#dtcAmberLight)"
        opacity="0.35"
      />

      {/* Star (achievement) */}
      <path
        d="M20 11.5 L22.45 17.05 L28.5 17.6 L23.95 21.55 L25.4 27.5 L20 24.3 L14.6 27.5 L16.05 21.55 L11.5 17.6 L17.55 17.05 Z"
        fill="white"
        stroke="white"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
