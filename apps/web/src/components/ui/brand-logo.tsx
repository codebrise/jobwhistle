import * as React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'full' | 'symbol' | 'stacked';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function BrandLogo({
  variant = 'full',
  className = '',
  size = 'md',
  href = '/',
}: BrandLogoProps) {
  const symbolScale = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Whistle + Telemetry Arcs */}
      <svg
        viewBox="0 0 100 100"
        width={symbolScale}
        height={symbolScale}
        className="shrink-0 transition-transform hover:scale-105"
      >
        <path
          d="M 52 30 A 28 28 0 0 1 76 54"
          fill="none"
          stroke="#C8F169"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M 57 23 A 38 38 0 0 1 88 54"
          fill="none"
          stroke="#C8F169"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 62 16 A 48 48 0 0 1 97 51"
          fill="none"
          stroke="#C8F169"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="1"
        />
        <path
          d="M 12 50 L 36 50 L 36 68 L 12 68 C 9.5 68 8 66 8 63.5 L 8 54.5 C 8 52 9.5 50 12 50 Z"
          fill="#C8F169"
        />
        <circle cx="48" cy="59" r="19" fill="#C8F169" />
        <path d="M 36 50 L 44 38 L 52 38 L 48 50 Z" fill="#C8F169" />
        <polygon points="40,49 46,39 48,49" fill="#142522" opacity="0.9" />
        <circle cx="48" cy="59" r="7.5" fill="#142522" />
        <circle cx="48" cy="38" r="2.5" fill="#C8F169" />
      </svg>

      {variant !== 'symbol' && (
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span
              className={`font-extrabold tracking-tight text-white ${
                size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
              }`}
            >
              Job
              <span className="font-normal text-white">whistle</span>
            </span>
          </div>
          <span className="text-[9px] font-bold text-[#A9C5B1] tracking-[0.24em] uppercase -mt-0.5">
            by CodeBrise
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
