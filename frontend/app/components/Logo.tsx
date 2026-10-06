import React from "react";
import Link from "next/link";

interface LogoProps {
  subtitle?: string;
  className?: string;
  lightText?: boolean;
}

export function Logo({ subtitle, className = "", lightText = true }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 text-decoration-none group ${className}`}>
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-sky-400/10 border border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
        <svg
          viewBox="0 0 32 32"
          className="w-5 h-5 text-sky-400 filter drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Constellation lines */}
          <path
            d="M6 10L14 6L24 10L26 20L18 26L10 24L6 10Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
          <path
            d="M14 6L16 16M24 10L16 16M26 20L16 16M18 26L16 16M10 24L16 16M6 10L16 16"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          {/* Nodes */}
          <circle cx="16" cy="16" r="3" fill="#38bdf8" />
          <circle cx="6" cy="10" r="2" fill="#60a5fa" />
          <circle cx="14" cy="6" r="2.2" fill="#38bdf8" />
          <circle cx="24" cy="10" r="2" fill="#818cf8" />
          <circle cx="26" cy="20" r="2.2" fill="#38bdf8" />
          <circle cx="18" cy="26" r="2" fill="#60a5fa" />
          <circle cx="10" cy="24" r="2" fill="#818cf8" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span
          className={`font-semibold tracking-tight text-[15px] leading-tight ${
            lightText ? "text-slate-100" : "text-slate-900"
          }`}
        >
          BTech Opportunity
          <br />
          <span className="font-bold text-sky-400">Navigation</span>
        </span>
        {subtitle && (
          <span className="text-[11px] text-slate-400 font-normal mt-0.5 tracking-wide">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
