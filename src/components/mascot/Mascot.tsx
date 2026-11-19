'use client';

import { useSettings } from '@/stores/settings';

/**
 * The app mascot: a friendly little circuit-hero robot.
 * Big eyes, gentle smile, glowing antenna — guides the child around the app.
 * `talking` makes the mouth open/close and the body bob gently (lesson robot).
 * Animations respect the user's "reduce motion" setting.
 */
export function Mascot({
  size = 84,
  className = '',
  talking = false,
}: {
  size?: number;
  className?: string;
  talking?: boolean;
}) {
  const motion = useSettings((s) => s.motion);
  const live = talking && motion;
  return (
    <svg
      viewBox="0 0 96 92"
      width={size}
      height={size * (92 / 96)}
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mq-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>

      <g>
        {live && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -1.6; 0 0"
            dur="0.55s"
            repeatCount="indefinite"
          />
        )}

      {/* antenna with glowing bulb */}
      <line x1="48" y1="20" x2="48" y2="10" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="7.5" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5">
        {motion && <animate attributeName="opacity" values="1;0.5;1" dur="1.8s" repeatCount="indefinite" />}
      </circle>

      {/* waving arm (back) */}
      <path d="M 22 54 Q 11 48 9 37" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* body */}
      <ellipse cx="48" cy="54" rx="30" ry="27" fill="url(#mq-body)" />
      <ellipse cx="48" cy="61" rx="17" ry="13" fill="#ccfbf1" opacity="0.85" />

      {/* feet */}
      <ellipse cx="38" cy="83" rx="8" ry="4.5" fill="#0f766e" />
      <ellipse cx="58" cy="83" rx="8" ry="4.5" fill="#0f766e" />

      {/* eyes */}
      <circle cx="38" cy="48" r="9.5" fill="#fff" />
      <circle cx="58" cy="48" r="9.5" fill="#fff" />
      <circle cx="39.5" cy="49" r="4.6" fill="#1e293b">
        {motion && (
          <animate attributeName="r" values="4.6;4.6;0.7;4.6" keyTimes="0;0.9;0.94;1" dur="4s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="56.5" cy="49" r="4.6" fill="#1e293b">
        {motion && (
          <animate attributeName="r" values="4.6;4.6;0.7;4.6" keyTimes="0;0.9;0.94;1" dur="4s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="41" cy="47" r="1.6" fill="#fff" />
      <circle cx="58" cy="47" r="1.6" fill="#fff" />

      {/* cheeks + smile — while talking, an open mouth animates instead */}
      <circle cx="27" cy="58" r="4" fill="#fda4af" opacity="0.7" />
      <circle cx="69" cy="58" r="4" fill="#fda4af" opacity="0.7" />
      {live ? (
        <ellipse cx="48" cy="63" rx="5.5" ry="3.6" fill="#134e4a">
          <animate attributeName="ry" values="1.1;3.9;1.1" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
      ) : (
        <path d="M 41 61 Q 48 68 55 61" stroke="#134e4a" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}

      {/* waving arm (front) */}
      <path d="M 74 52 Q 85 46 87 34" stroke="#14b8a6" strokeWidth="6" strokeLinecap="round" fill="none">
        {motion && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 74 52;-20 74 52;0 74 52"
            dur="1.9s"
            repeatCount="indefinite"
          />
        )}
      </path>
      </g>
    </svg>
  );
}
