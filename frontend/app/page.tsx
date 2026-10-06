"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "./components/Logo";
import { HeroIsometricMap } from "./components/IsometricVisuals";
import { OpportunityModal, OpportunityDetail } from "./components/OpportunityModal";
import { ReviewSwitcher } from "./components/ReviewSwitcher";

export default function LandingPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityDetail | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const featuredOpportunities: OpportunityDetail[] = [
    {
      id: "innovatetech-sde-intern",
      title: "Software Engineering Intern",
      organization: "InnovateTech Dynamics",
      category: "INTERNSHIP",
      deadline: "25 Oct 2023",
      eligibility: "Final Year (CSE/IT)",
      skills: ["Python", "Django", "Cloud"],
      match_score: 92,
      tag: "Matches backend skills",
      missing_skills: ["Cloud"],
      reasons: ["Target branch CSE/IT aligns", "Strong Python proficiency verified"],
    },
    {
      id: "future-mobility-challenge",
      title: "Future Mobility Challenge",
      organization: "Global Auto Corp",
      category: "HACKATHON",
      deadline: "12 Nov 2023",
      eligibility: "Open to all Engineering Branches",
      skills: ["IoT", "Embedded Systems"],
      match_score: 88,
      tag: "Team interest aligned",
      missing_skills: ["Embedded Systems"],
      reasons: ["Open to 3rd year engineering students", "Interdisciplinary prototype challenge"],
    },
    {
      id: "cair-research-fellow",
      title: "Undergraduate Research Fellow",
      organization: "Center for AI Research (CAIR)",
      category: "RESEARCH",
      deadline: "20 Oct 2023",
      eligibility: "Pre-Final Year",
      skills: ["Machine Learning", "Data Structures"],
      match_score: 95,
      tag: "Academic profile match",
      missing_skills: [],
      reasons: ["3rd year student eligibility satisfied", "Data structures & ML overlap 100%"],
    },
  ];

  const capabilities = [
    {
      title: "Personalized Opportunity Matching",
      desc: "Personalized opportunity matching engine calibrated to real-world eligibility, CGPA thresholds, and student academic stage.",
      icon: (
        <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Skill-Gap Analysis",
      desc: "Pinpoint exact tools, frameworks, and core conceptual competencies separating your current profile from your targeted positions.",
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Application Deadline Intelligence",
      desc: "Predictive urgency indicators identifying tight submission windows, priority alerts, and scheduled recruitment seasons.",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Goal-Oriented Preparation",
      desc: "Actionable roadmap steps, customized guidance, and structured micro-milestones to bridge prerequisites proactively.",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const steps = [
    { num: "01", title: "Profile Completion", desc: "Input branch, semester, CGPA, and technical skills." },
    { num: "02", title: "Intelligent Matching", desc: "Engine verifies requirements against verified live programs." },
    { num: "03", title: "Skill Gap Analysis", desc: "Reveals exact delta separating your profile from selection." },
    { num: "04", title: "Preparation Guidance", desc: "Targeted milestones and learning roadmaps to bridge gaps." },
    { num: "05", title: "Seamless Application", desc: "Direct submission tracking, reminder alerts, and milestones." },
  ];

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 tech-grid-bg relative overflow-x-hidden">
      {/* Top ambient lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ---------------- NAVIGATION BAR ---------------- */}
      <header className="sticky top-0 z-40 w-full bg-[#070d19]/80 backdrop-blur-md border-b border-sky-500/15">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link href="/dashboard" className="text-white hover:text-sky-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard?tab=opportunities" className="hover:text-sky-400 transition-colors">
              Opportunities
            </Link>
            <Link href="/dashboard?tab=skills" className="hover:text-sky-400 transition-colors">
              Skill Assessments
            </Link>
            <Link href="/dashboard?tab=roadmap" className="hover:text-sky-400 transition-colors">
              Prep Resources
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-700/60 transition-colors"
            >
              <span>My Profile</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 text-xs font-semibold tracking-wide transition-all shadow-[0_0_12px_rgba(56,189,248,0.15)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text Column */}
          <div className="flex flex-col items-start max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.12] mb-5">
              Navigate Your BTech Career With System Path Intelligence.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
              Find internships, jobs, hackathons, research programs, scholarships and
              competitions matched to your skills, eligibility and academic stage.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-102 flex items-center gap-2"
              >
                Explore Opportunities
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <a
                href="#how-it-works"
                className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium border border-slate-700/80 transition-all"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Right 3D Isometric Ecosystem Visual */}
          <div className="w-full flex justify-center">
            <HeroIsometricMap />
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS PIPELINE RIBBON ---------------- */}
      <div className="border-y border-sky-500/15 bg-slate-950/60 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm font-semibold tracking-wide text-slate-200">
            <span className="text-sky-400">Discover</span>
            <span className="text-sky-500/50">→</span>
            <span className="text-blue-400">Match</span>
            <span className="text-sky-500/50">→</span>
            <span className="text-indigo-400">Prepare</span>
            <span className="text-sky-500/50">→</span>
            <span className="text-sky-300">Apply</span>
            <span className="text-sky-500/50">→</span>
            <span className="text-emerald-400">Grow</span>
          </div>
        </div>
      </div>

      {/* ---------------- PLATFORM CAPABILITIES OVERVIEW ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10 text-left">
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-1">
            Overview of Platform Capabilities
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed specifically for engineering students
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4">
                {cap.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{cap.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED OPPORTUNITIES ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Opportunities</h2>
            <p className="text-xs text-slate-400 mt-1">
              Top curated tracks evaluated against current academic requirements
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCarouselIndex((prev) => (prev > 0 ? prev - 1 : 0))}
              className="w-8 h-8 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() =>
                setActiveCarouselIndex((prev) =>
                  prev < featuredOpportunities.length - 1 ? prev + 1 : prev
                )
              }
              className="w-8 h-8 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ...featuredOpportunities.slice(activeCarouselIndex),
            ...featuredOpportunities.slice(0, activeCarouselIndex),
          ].map((opp) => {
            const isInternship = opp.category === "INTERNSHIP";
            const isHackathon = opp.category === "HACKATHON";

            return (
              <div
                key={opp.id}
                className="bg-slate-900/70 border border-slate-800/90 hover:border-sky-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl relative overflow-hidden group"
              >
                {/* Subtle Glow Header */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isInternship ? "bg-blue-500" : isHackathon ? "bg-purple-500" : "bg-teal-400"
                  }`}
                />

                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase ${
                        isInternship
                          ? "bg-blue-950 text-blue-400 border border-blue-800/50"
                          : isHackathon
                          ? "bg-purple-950 text-purple-300 border border-purple-800/50"
                          : "bg-teal-950 text-teal-300 border border-teal-800/50"
                      }`}
                    >
                      {opp.category}
                    </span>

                    {/* Circular Match Score Ring */}
                    <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700/60">
                      <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      <span className="text-xs font-bold text-sky-400">{opp.match_score}%</span>
                      <span className="text-[10px] text-slate-400">Match</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-sky-400 mb-4">{opp.organization}</p>

                  <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/60 pt-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="font-medium text-slate-200">{opp.deadline}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Eligibility:</span>
                      <span className="font-medium text-slate-200">{opp.eligibility}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Skills:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[170px]">
                        {opp.skills.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOpportunity(opp)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
                >
                  View Opportunity
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How It Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Journey to career progression & opportunity unlocking
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-extrabold text-sky-400 font-mono opacity-90">
                  {step.num}
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500/50" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2024 BTech Opportunity Navigation. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-sky-400 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-sky-400 transition-colors">
              Create Account
            </Link>
            <Link href="/forgot-password" className="hover:text-sky-400 transition-colors">
              Recovery
            </Link>
            <Link href="/dashboard" className="text-sky-400 hover:underline">
              Student Dashboard →
            </Link>
          </div>
        </div>
      </footer>

      {/* Opportunity Detail Modal */}
      <OpportunityModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />

      {/* Screen Switcher for reviewer */}
      <ReviewSwitcher />
    </div>
  );
}
