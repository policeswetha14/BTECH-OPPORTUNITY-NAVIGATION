"use client";

import React, { useState } from "react";

// Helper for Isometric Node Platform
function IsometricPlatform({
  cx,
  cy,
  rx = 52,
  ry = 26,
  height = 14,
  label,
  sublabel,
  isActive = false,
  badgeIcon,
  onClick,
}: {
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  height?: number;
  label?: string;
  sublabel?: string;
  isActive?: boolean;
  badgeIcon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <g
      className={`transition-all duration-300 ${onClick ? "cursor-pointer group" : ""}`}
      onClick={onClick}
    >
      {/* Ambient Floor Glow */}
      <ellipse
        cx={cx}
        cy={cy + height + 6}
        rx={rx * 1.25}
        ry={ry * 1.2}
        fill={isActive ? "url(#cyanGlow)" : "url(#blueGlow)"}
        opacity={isActive ? 0.45 : 0.25}
      />

      {/* Base Drop Shadow / Bottom Rim */}
      <path
        d={`M ${cx - rx} ${cy}
            C ${cx - rx} ${cy + ry}, ${cx + rx} ${cy + ry}, ${cx + rx} ${cy}
            v ${height}
            C ${cx + rx} ${cy + height + ry}, ${cx - rx} ${cy + height + ry}, ${cx - rx} ${cy + height}
            Z`}
        fill="#0b172a"
        stroke={isActive ? "#0284c7" : "#1e293b"}
        strokeWidth="1.2"
      />

      {/* 3D Platform Extrusion Front Face */}
      <path
        d={`M ${cx - rx} ${cy}
            C ${cx - rx} ${cy + ry}, ${cx + rx} ${cy + ry}, ${cx + rx} ${cy}
            L ${cx + rx} ${cy + height}
            C ${cx + rx} ${cy + height + ry}, ${cx - rx} ${cy + height + ry}, ${cx - rx} ${cy + height}
            Z`}
        fill="url(#platformSideGradient)"
      />

      {/* Platform Top Face (Isometric Cap) */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="url(#platformTopGradient)"
        stroke={isActive ? "#38bdf8" : "#3b82f6"}
        strokeWidth={isActive ? "2" : "1.2"}
        className="transition-colors duration-300"
      />

      {/* Inner Glowing Bevel */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx * 0.88}
        ry={ry * 0.85}
        fill="none"
        stroke={isActive ? "rgba(56, 189, 248, 0.6)" : "rgba(96, 165, 250, 0.3)"}
        strokeWidth="1"
      />

      {/* Badge / Avatar Icon if any */}
      {badgeIcon && (
        <g transform={`translate(${cx - 12}, ${cy - 12})`}>{badgeIcon}</g>
      )}

      {/* Labels */}
      {label && (
        <text
          x={cx}
          y={badgeIcon ? cy + 18 : sublabel ? cy - 2 : cy + 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="10.5"
          fontWeight="700"
          letterSpacing="0.03em"
          className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {label}
        </text>
      )}

      {sublabel && (
        <text
          x={cx}
          y={badgeIcon ? cy + 28 : cy + 10}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="8.5"
          fontWeight="600"
          letterSpacing="0.02em"
          className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

// Global SVG Defs for lighting & gradients
function SvgSharedDefs() {
  return (
    <defs>
      <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#0284c7" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
      </radialGradient>

      <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
        <stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="platformTopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>

      <linearGradient id="platformSideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      <linearGradient id="cyanTrace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>

      {/* Filter for glowing neon traces */}
      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// -------------------------------------------------------------
// 1. Landing Page Hero 3D Isometric Ecosystem (Image 1)
// -------------------------------------------------------------
export function HeroIsometricMap() {
  return (
    <div className="relative w-full aspect-[16/11] max-w-[620px] mx-auto flex items-center justify-center select-none">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-sky-500/15 via-blue-900/10 to-transparent blur-2xl pointer-events-none" />

      {/* Subtle Crosshairs and grid lines */}
      <div className="absolute top-4 left-4 text-sky-400/30 text-xs font-mono">+</div>
      <div className="absolute top-4 right-4 text-sky-400/30 text-xs font-mono">+</div>
      <div className="absolute bottom-4 left-4 text-sky-400/30 text-xs font-mono">+</div>
      <div className="absolute bottom-4 right-4 text-sky-400/30 text-xs font-mono">+</div>

      <svg
        viewBox="0 0 540 380"
        className="w-full h-full filter drop-shadow-[0_10px_35px_rgba(2,132,199,0.2)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SvgSharedDefs />

        {/* Cybernetic traces connecting nodes */}
        <g stroke="url(#cyanTrace)" strokeWidth="2" filter="url(#neonGlow)">
          {/* Center to Student Profile */}
          <path d="M 270 190 C 240 180, 200 150, 195 135" />
          {/* Center to Skills & Interests */}
          <path d="M 270 190 C 310 170, 360 135, 385 115" />
          {/* Center to Explore Opportunities */}
          <path d="M 270 190 C 330 200, 390 190, 425 180" />
          {/* Center to Preparation Resources Bottom Right */}
          <path d="M 270 190 C 310 240, 360 270, 395 285" />
          {/* Center to Preparation Resources Bottom Left */}
          <path d="M 270 190 C 230 230, 200 260, 185 270" />

          {/* Trace loops and circuit paths */}
          <path
            d="M 195 135 L 140 160 L 185 270 M 385 115 L 425 180 L 395 285"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
        </g>

        {/* Junction pulses */}
        <circle cx="230" cy="180" r="2.5" fill="#38bdf8" />
        <circle cx="330" cy="190" r="2.5" fill="#38bdf8" />
        <circle cx="215" cy="245" r="2" fill="#60a5fa" />
        <circle cx="340" cy="240" r="2" fill="#60a5fa" />

        {/* 1. Top Left: Student Profile */}
        <IsometricPlatform
          cx={195}
          cy={125}
          rx={44}
          ry={22}
          label="Student"
          sublabel="Profile"
        />

        {/* 2. Top Right: Skills & Interests */}
        <IsometricPlatform
          cx={385}
          cy={105}
          rx={46}
          ry={23}
          label="Skills &"
          sublabel="Interests"
        />

        {/* 3. Middle Right: Explore Opportunities */}
        <IsometricPlatform
          cx={425}
          cy={175}
          rx={48}
          ry={24}
          label="Explore"
          sublabel="Opportunities"
        />

        {/* 4. Bottom Right: Preparation Resources */}
        <IsometricPlatform
          cx={395}
          cy={275}
          rx={48}
          ry={24}
          label="Preparation"
          sublabel="Resources"
        />

        {/* 5. Bottom Left: Preparation Resources */}
        <IsometricPlatform
          cx={185}
          cy={260}
          rx={48}
          ry={24}
          label="Preparation"
          sublabel="Resources"
        />

        {/* Central Glowing Hero Node: Career Paths */}
        <IsometricPlatform
          cx={270}
          cy={185}
          rx={56}
          ry={28}
          height={18}
          isActive={true}
          label="Career"
          sublabel="Paths"
        />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Sign In Left 3D Stepped Pathway (Image 2)
// -------------------------------------------------------------
export function LoginIsometricPath() {
  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center p-6 select-none overflow-hidden">
      {/* Background glow and subtle cyber grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-slate-900/40 to-slate-950 pointer-events-none" />
      <div className="absolute top-8 left-8 text-sky-400/25 text-sm font-mono">+</div>
      <div className="absolute bottom-8 left-8 text-sky-400/25 text-sm font-mono">+</div>
      <div className="absolute top-8 right-8 text-sky-400/25 text-sm font-mono">+</div>

      <svg
        viewBox="0 0 380 480"
        className="w-full max-w-[360px] filter drop-shadow-[0_15px_30px_rgba(2,132,199,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SvgSharedDefs />

        {/* Stepped Conduit connecting nodes in order */}
        <g stroke="url(#cyanTrace)" strokeWidth="3" filter="url(#neonGlow)">
          {/* From STUDENT down-right to SKILLS */}
          <path d="M 140 120 L 190 150 L 240 170" />
          {/* From SKILLS down-left to OPPORTUNITIES */}
          <path d="M 240 190 L 190 230 L 150 260" />
          {/* From OPPORTUNITIES down-right to CAREER */}
          <path d="M 150 280 L 200 320 L 260 350" />
        </g>

        {/* Pulse nodes on conduit */}
        <circle cx="190" cy="150" r="3.5" fill="#38bdf8" />
        <circle cx="190" cy="230" r="3.5" fill="#38bdf8" />
        <circle cx="200" cy="320" r="3.5" fill="#38bdf8" />

        {/* Node 1: STUDENT */}
        <IsometricPlatform
          cx={140}
          cy={110}
          rx={48}
          ry={24}
          isActive={true}
          label="STUDENT"
        />

        {/* Node 2: SKILLS */}
        <IsometricPlatform
          cx={240}
          cy={180}
          rx={46}
          ry={23}
          label="SKILLS"
        />

        {/* Node 3: OPPORTUNITIES */}
        <IsometricPlatform
          cx={150}
          cy={270}
          rx={50}
          ry={25}
          label="OPPORTUNITIES"
        />

        {/* Node 4: CAREER */}
        <IsometricPlatform
          cx={260}
          cy={360}
          rx={46}
          ry={23}
          label="CAREER"
        />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Sign Up Left Radiating Neural Node Hub (Image 3)
// -------------------------------------------------------------
export function SignupIsometricHub() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center p-6 select-none overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-sky-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-6 left-6 text-sky-400/20 font-mono">+</div>
      <div className="absolute bottom-6 left-6 font-mono text-sky-400/20">+</div>

      <svg
        viewBox="0 0 500 480"
        className="w-full max-w-[480px] filter drop-shadow-[0_15px_35px_rgba(2,132,199,0.3)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SvgSharedDefs />

        {/* Radiating fine neural fibers */}
        <g stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" filter="url(#neonGlow)">
          {/* Top Left branches */}
          <path d="M 250 240 Q 180 200, 120 180" />
          <path d="M 250 240 Q 170 180, 110 160" />
          <path d="M 250 240 Q 160 160, 95 130" />
          <path d="M 250 240 Q 150 140, 80 110" />

          {/* Top Right branches */}
          <path d="M 250 240 Q 320 200, 390 170" />
          <path d="M 250 240 Q 340 180, 420 145" />
          <path d="M 250 240 Q 360 160, 440 120" />
          <path d="M 250 240 Q 370 140, 460 95" />

          {/* Bottom Left branches */}
          <path d="M 250 240 Q 180 280, 120 330" />
          <path d="M 250 240 Q 160 300, 95 360" />
          <path d="M 250 240 Q 140 330, 80 400" />

          {/* Bottom Right branches */}
          <path d="M 250 240 Q 320 280, 380 320" />
          <path d="M 250 240 Q 330 310, 390 370" />
          <path d="M 250 240 Q 350 330, 420 410" />
        </g>

        {/* Prominent main glowing conduits */}
        <g stroke="url(#cyanTrace)" strokeWidth="2.5" filter="url(#neonGlow)">
          <path d="M 250 240 C 180 220, 140 190, 120 170" />
          <path d="M 250 240 C 320 220, 360 190, 400 170" />
          <path d="M 250 240 C 180 270, 140 310, 120 340" />
          <path d="M 250 240 C 310 270, 360 290, 395 300" />
          <path d="M 250 240 C 310 300, 350 340, 390 370" />
        </g>

        {/* Surrounding Nodes */}
        <IsometricPlatform
          cx={115}
          cy={165}
          rx={48}
          ry={24}
          label="SKILLS &"
          sublabel="INTERESTS"
        />

        <IsometricPlatform
          cx={400}
          cy={165}
          rx={50}
          ry={24}
          label="ACADEMIC STAGE"
          sublabel="(YEAR/SEM)"
        />

        <IsometricPlatform
          cx={120}
          cy={340}
          rx={52}
          ry={26}
          label="OPPORTUNITY TYPES"
          sublabel="(INTERNSHIPS, RESEARCH)"
        />

        <IsometricPlatform
          cx={395}
          cy={295}
          rx={48}
          ry={24}
          label="CAREER"
          sublabel="INTERESTS"
        />

        <IsometricPlatform
          cx={390}
          cy={370}
          rx={46}
          ry={23}
          label="CAREER"
          sublabel="GOALS"
        />

        {/* Central Hub: STUDENT PROFILE */}
        <IsometricPlatform
          cx={250}
          cy={235}
          rx={58}
          ry={30}
          height={20}
          isActive={true}
          badgeIcon={
            <circle cx="12" cy="12" r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
          }
          label="STUDENT PROFILE"
        />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Forgot Password Recovery 3D Checkpoint (Image 4)
// -------------------------------------------------------------
export function RecoveryIsometricCube() {
  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center p-6 select-none overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-sky-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-6 left-6 font-mono text-sky-400/25">+</div>
      <div className="absolute bottom-6 left-6 font-mono text-sky-400/25">+</div>

      <svg
        viewBox="0 0 420 460"
        className="w-full max-w-[400px] filter drop-shadow-[0_15px_30px_rgba(2,132,199,0.3)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SvgSharedDefs />

        {/* Radiating dendrites left side */}
        <g stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" filter="url(#neonGlow)">
          <path d="M 120 240 Q 80 200, 50 160" />
          <path d="M 120 240 Q 70 230, 40 220" />
          <path d="M 120 240 Q 75 270, 45 320" />
          <path d="M 120 240 Q 85 300, 60 360" />
          <circle cx="65" cy="190" r="3" fill="#38bdf8" />
        </g>

        {/* Stepped conduit pathway */}
        <g stroke="url(#cyanTrace)" strokeWidth="3" filter="url(#neonGlow)">
          {/* From bottom node up to middle checkpoint */}
          <path d="M 230 350 L 190 320 L 160 270 L 130 250" />
          {/* From middle checkpoint up to security cube */}
          <path d="M 130 240 L 180 200 L 240 160" />
        </g>

        {/* Node 1: Bottom Pad */}
        <IsometricPlatform
          cx={230}
          cy={360}
          rx={44}
          ry={22}
          label=""
        />

        {/* Node 2: Checkpoint Pad */}
        <IsometricPlatform
          cx={130}
          cy={240}
          rx={42}
          ry={21}
          isActive={true}
          label="RECOVERY"
          sublabel="CHECKPOINT"
        />

        {/* 3D Security Vault / Checkpoint Cube at Top Right */}
        <g transform="translate(240, 100)" className="filter drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
          {/* Cube Top Face */}
          <polygon
            points="0,-25 35,-42 70,-25 35,-8"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="1.8"
          />
          {/* Cube Left Face */}
          <polygon
            points="0,-25 35,-8 35,32 0,15"
            fill="#0f172a"
            stroke="#0284c7"
            strokeWidth="1.5"
          />
          {/* Cube Right Face with Glowing Core */}
          <polygon
            points="35,-8 70,-25 70,15 35,32"
            fill="url(#cyanGlow)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Interior Lock Glyph */}
          <circle cx="35" cy="12" r="6" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Dashboard Center Career Opportunity Map (Image 5)
// -------------------------------------------------------------
export function DashboardOpportunityMap() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const nodes = [
    { id: "skills", label: "SKILLS", sublabel: "7 Matched", cx: 120, cy: 110, desc: "Python, SQL, DSA, ML" },
    { id: "interests", label: "CAREER INTERESTS", sublabel: "AI & Systems", cx: 370, cy: 110, desc: "Software Eng & ML" },
    { id: "roles", label: "TARGET ROLES", sublabel: "SDE / AI Fellow", cx: 400, cy: 200, desc: "Target: AI Software Engineer" },
    { id: "opps", label: "RECOMMENDED", sublabel: "OPPORTUNITIES", cx: 370, cy: 290, desc: "10 matching programs" },
    { id: "roadmap", label: "LEARNING", sublabel: "ROADMAP", cx: 130, cy: 290, desc: "3 Active preparation tracks" },
  ];

  return (
    <div className="relative w-full h-[320px] rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
      {/* Title */}
      <div className="flex items-center justify-between z-10">
        <h3 className="text-white font-semibold text-sm tracking-wide">
          Career Opportunity Map
        </h3>
        {activeTooltip && (
          <span className="text-xs text-sky-400 bg-sky-950/70 border border-sky-800/50 px-2 py-0.5 rounded-md animate-fade-in">
            {activeTooltip}
          </span>
        )}
      </div>

      {/* SVG Map Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        <svg
          viewBox="0 0 500 360"
          className="w-full h-full max-h-[280px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <SvgSharedDefs />

          {/* Glowing Neural Synaptic Fibers */}
          <g stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" filter="url(#neonGlow)">
            {/* Top Left filaments */}
            <path d="M 250 190 Q 180 150, 120 110" />
            <path d="M 250 190 Q 160 130, 90 90" />
            <path d="M 250 190 Q 190 120, 130 70" />

            {/* Top Right filaments */}
            <path d="M 250 190 Q 310 150, 370 110" />
            <path d="M 250 190 Q 330 130, 410 80" />
            <path d="M 250 190 Q 350 150, 420 120" />

            {/* Right filaments */}
            <path d="M 250 190 Q 330 190, 400 200" />

            {/* Bottom Right filaments */}
            <path d="M 250 190 Q 310 240, 370 290" />
            <path d="M 250 190 Q 340 260, 410 320" />

            {/* Bottom Left filaments */}
            <path d="M 250 190 Q 190 240, 130 290" />
            <path d="M 250 190 Q 160 260, 90 320" />
          </g>

          {/* Primary Conduits */}
          <g stroke="url(#cyanTrace)" strokeWidth="2.2" filter="url(#neonGlow)">
            <path d="M 250 190 C 200 160, 160 130, 120 110" />
            <path d="M 250 190 C 300 160, 340 130, 370 110" />
            <path d="M 250 190 C 310 190, 350 195, 400 200" />
            <path d="M 250 190 C 300 230, 340 260, 370 290" />
            <path d="M 250 190 C 200 230, 160 260, 130 290" />
          </g>

          {/* Surrounding Interactive Nodes */}
          {nodes.map((node) => (
            <IsometricPlatform
              key={node.id}
              cx={node.cx}
              cy={node.cy}
              rx={45}
              ry={22}
              label={node.label}
              sublabel={node.sublabel}
              isActive={activeTooltip === node.desc}
              onClick={() => setActiveTooltip(node.desc)}
            />
          ))}

          {/* Center Hub: MY CAREER PROFILE */}
          <IsometricPlatform
            cx={250}
            cy={185}
            rx={54}
            ry={28}
            height={16}
            isActive={true}
            badgeIcon={
              <circle cx="12" cy="12" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            }
            label="MY CAREER"
            sublabel="PROFILE"
            onClick={() => setActiveTooltip("Student Profile: Swetha - BTech 3rd Year CSE")}
          />
        </svg>
      </div>
    </div>
  );
}
