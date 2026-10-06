"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "../components/Logo";
import { LoginIsometricPath } from "../components/IsometricVisuals";
import { ReviewSwitcher } from "../components/ReviewSwitcher";
import { apiRequest } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
      {/* ---------------- LEFT PANEL: 3D CYBERNETIC PATHWAY ---------------- */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#070d19] via-[#091224] to-[#050914] border-r border-sky-500/15 relative">
        <div className="z-10">
          <Logo />
        </div>

        <div className="my-auto w-full flex items-center justify-center">
          <LoginIsometricPath />
        </div>

        <div className="z-10 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>PATHWAY: CONNECTED</span>
          <span>STAGE: ACADEMIC_NAVIGATION</span>
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: CRISP WHITE AUTH CARD ---------------- */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-slate-900/40 lg:bg-[#f1f5f9] relative">
        {/* Mobile Header */}
        <div className="lg:hidden mb-8">
          <Logo lightText={false} />
        </div>

        <div className="w-full max-w-[430px] white-auth-card p-8 sm:p-10 shadow-2xl animate-fade-in">
          {/* Card Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 shadow-sm">
              <svg viewBox="0 0 32 32" className="w-7 h-7 text-blue-600" fill="none">
                <path d="M6 10L14 6L24 10L26 20L18 26L10 24L6 10Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                <path d="M14 6L16 16M24 10L16 16M26 20L16 16M18 26L16 16M10 24L16 16M6 10L16 16" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="3" fill="#2563eb" />
                <circle cx="14" cy="6" r="2.2" fill="#3b82f6" />
                <circle cx="26" cy="20" r="2.2" fill="#3b82f6" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              BTech Opportunity Navigation
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
              Continue navigating opportunities built around your BTech journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email / Student Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="white-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="white-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
            {errorMessage && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {errorMessage}
              </p>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
              <span className="bg-white px-3 text-slate-400">OR</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            disabled
            title="OAuth provider configuration is not available."
            className="w-full cursor-not-allowed rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-400 flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google sign-in not configured
          </button>

          {/* Footer link */}
          <p className="text-center text-xs text-slate-600 mt-6">
            New to BTech Opportunity Navigation?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Create Account
            </Link>
          </p>
        </div>
      </div>

      <ReviewSwitcher />
    </div>
  );
}
