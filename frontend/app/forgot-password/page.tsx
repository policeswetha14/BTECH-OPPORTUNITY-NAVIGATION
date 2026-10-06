"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "../components/Logo";
import { RecoveryIsometricCube } from "../components/IsometricVisuals";
import { ReviewSwitcher } from "../components/ReviewSwitcher";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Password reset email delivery is not configured for this project. Contact the administrator for account recovery.");
  };

  return (
    <div className="min-h-screen bg-[#070d19] flex flex-col relative overflow-hidden">
      {/* ---------------- TOP HEADER ---------------- */}
      <header className="w-full bg-[#070d19]/90 border-b border-sky-500/15 py-3.5 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline text-slate-500 font-mono">|</span>
          <span className="hidden sm:inline text-xs font-semibold text-slate-300 tracking-wide">
            Forgot Password / Account Recovery
          </span>
        </div>

      </header>

      {/* ---------------- MAIN SPLIT VIEW ---------------- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Isometric Recovery Checkpoint Visual */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-gradient-to-br from-[#070d19] via-[#091224] to-[#040813] border-r border-sky-500/15 relative">
          <div className="w-full max-w-lg">
            <RecoveryIsometricCube />
          </div>
          <div className="text-xs text-slate-400 font-mono tracking-wider">
            ACCOUNT RECOVERY: EMAIL DELIVERY NOT CONFIGURED
          </div>
        </div>

        {/* Right White Card */}
        <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-900/50 lg:bg-[#f1f5f9] relative">
          <div className="w-full max-w-[430px] white-auth-card p-8 sm:p-10 shadow-2xl animate-fade-in relative">
            {/* Stepper indicator on right margin */}
            <div className="hidden sm:flex flex-col items-center absolute -right-10 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <div className="w-0.5 h-16 bg-slate-200" />
              <span className="rotate-90 origin-center whitespace-nowrap mt-4 text-slate-500">
                Verification Link
              </span>
            </div>

            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 shadow-sm">
                <svg viewBox="0 0 32 32" className="w-7 h-7 text-blue-600" fill="none">
                  <path d="M6 10L14 6L24 10L26 20L18 26L10 24L6 10Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                  <path d="M14 6L16 16M24 10L16 16M26 20L16 16M18 26L16 16M10 24L16 16M6 10L16 16" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="16" cy="16" r="3" fill="#2563eb" />
                </svg>
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                BTech Opportunity Navigation
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reset Your Password
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                Enter your registered email and we&apos;ll help you get back to your opportunity journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="white-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
              >
                Send Reset Link
              </button>
              {message && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{message}</p>}
            </form>

            {/* Back to Sign In */}
            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-xs text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Back to Sign In
              </Link>
            </div>

            {/* Protected Account Trust Note */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span>🛡</span>
              <span>Your account information is protected.</span>
            </div>
          </div>
        </div>
      </div>

      <ReviewSwitcher />
    </div>
  );
}
