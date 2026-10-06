"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "../components/Logo";
import { SignupIsometricHub } from "../components/IsometricVisuals";
import { ReviewSwitcher } from "../components/ReviewSwitcher";
import { apiRequest } from "../lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [cgpa, setCgpa] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("Remote");
  const [careerGoal, setCareerGoal] = useState("");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const interestOptions = [
    "Software Dev.",
    "AI & ML",
    "Data",
    "Cloud",
    "Cybersecurity",
    "Core Engineering",
    "Research",
    "Entrepreneurship",
    "VLSI Design",
    "Embedded Systems",
  ];
  const opportunityTypeOptions = ["Internship", "Job", "Research Program", "Hackathon", "Scholarship", "Exam"];

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, item]);
      } else {
        setSelectedInterests([...selectedInterests.slice(1), item]);
      }
    }
  };

  const toggleOpportunityType = (item: string) => {
    setSelectedTypes((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }
    if (password.length < 10) {
      setErrorMessage("Use a password with at least 10 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          branch,
          year: Number(year),
          semester: Number(semester),
          cgpa: Number(cgpa),
          skills: skillsText.split(",").map((skill) => skill.trim()).filter(Boolean),
          interests: selectedInterests,
          preferred_opportunity_types: selectedTypes,
          location,
          mode,
          career_goal: careerGoal,
        }),
      });
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] flex flex-col relative overflow-hidden">
      {/* ---------------- TOP HEADER ---------------- */}
      <header className="w-full bg-[#070d19]/90 border-b border-sky-500/15 py-3.5 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline text-slate-500 font-mono">|</span>
          <span className="hidden sm:inline text-xs font-semibold text-slate-300 tracking-wide">
            Sign Up / Create Student Profile
          </span>
        </div>

        <Link
          href="/login"
          className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          Sign In instead →
        </Link>
      </header>

      {/* ---------------- MAIN SPLIT VIEW ---------------- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Cybernetic Hub */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-gradient-to-br from-[#070d19] via-[#091224] to-[#040813] border-r border-sky-500/15 relative">
          <div className="w-full max-w-xl">
            <SignupIsometricHub />
          </div>
          <div className="text-center mt-2 text-xs text-slate-400 font-medium">
            360° Academic & Career Skill Calibration Engine
          </div>
        </div>

        {/* Right White Profile Onboarding Card */}
        <div className="flex items-center justify-center p-6 sm:p-10 bg-slate-900/50 lg:bg-[#f1f5f9] overflow-y-auto">
          <div className="w-full max-w-[510px] white-auth-card p-6 sm:p-8 shadow-2xl animate-fade-in my-auto">
            {/* Stepper Ribbon */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-100 pb-3 mb-5">
              <span className="text-blue-600 font-bold">Account</span>
              <span>→</span>
              <span className="text-blue-600 font-bold">Academic Profile</span>
              <span>→</span>
              <span className="text-blue-600 font-bold">Skills</span>
              <span>→</span>
              <span className="text-slate-400">Interests</span>
            </div>

            {/* Heading */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Start Your Opportunity Journey
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Build your profile and discover opportunities that actually fit your BTech journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="white-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="white-input"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={10}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="white-input !pl-3.5 !pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={10}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="white-input !pl-3.5 !pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Personalize Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mt-3">
                <div className="mb-3">
                  <span className="text-xs font-bold text-slate-800">
                    Personalize Your Experience
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">
                    (This step is key to matching)
                  </span>
                </div>

                {/* 3 Dropdowns */}
                <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      BTech Branch
                    </label>
                    <select
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
                    >
                      <option value="" disabled>Select branch</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Current Year
                    </label>
                    <select
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Current Semester
                    </label>
                    <select
                      required
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-[10px] font-semibold text-slate-600">
                    CGPA (0-10)
                    <input
                      type="number"
                      required
                      min="0"
                      max="10"
                      step="0.01"
                      value={cgpa}
                      onChange={(event) => setCgpa(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-800"
                    />
                  </label>
                  <label className="text-[10px] font-semibold text-slate-600">
                    Preferred location
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="City or Remote"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-800"
                    />
                  </label>
                  <label className="text-[10px] font-semibold text-slate-600">
                    Preferred work mode
                    <select
                      value={mode}
                      onChange={(event) => setMode(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-800"
                    >
                      <option>Remote</option><option>Hybrid</option><option>Onsite</option>
                    </select>
                  </label>
                  <label className="text-[10px] font-semibold text-slate-600">
                    Career goal
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={careerGoal}
                      onChange={(event) => setCareerGoal(event.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-800"
                    />
                  </label>
                  <label className="text-[10px] font-semibold text-slate-600 sm:col-span-2">
                    Skills (comma separated)
                    <input
                      type="text"
                      value={skillsText}
                      onChange={(event) => setSkillsText(event.target.value)}
                      placeholder="Python, SQL, Data Structures"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-800"
                    />
                  </label>
                </div>

                {/* Primary Interests Pill Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-700">
                      Primary Interest (Select up to 3)
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {selectedInterests.length}/3 selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {interestOptions.map((item) => {
                      const isSelected = selectedInterests.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleInterest(item)}
                          className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-[11px] font-semibold text-slate-700">Preferred opportunity types</div>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunityTypeOptions.map((item) => {
                      const selected = selectedTypes.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleOpportunityType(item)}
                          aria-pressed={selected}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${selected ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit */}
              {errorMessage && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {errorMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  "Create My Profile"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-600 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ReviewSwitcher />
    </div>
  );
}
