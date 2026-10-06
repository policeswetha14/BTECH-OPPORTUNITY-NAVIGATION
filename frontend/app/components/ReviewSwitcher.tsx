"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ReviewSwitcher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const screens = [
    { name: "1. Landing Page", path: "/" },
    { name: "2. Sign In", path: "/login" },
    { name: "3. Sign Up Profile", path: "/signup" },
    { name: "4. Account Recovery", path: "/forgot-password" },
    { name: "5. Student Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-slate-900/95 border border-sky-500/40 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md text-white animate-fade-in w-72">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                UI / UX Review Navigator
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            {screens.map((screen) => {
              const isActive = pathname === screen.path;
              return (
                <Link
                  key={screen.path}
                  href={screen.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                      : "text-slate-300 hover:bg-slate-800 hover:text-sky-300"
                  }`}
                >
                  <span>{screen.name}</span>
                  {isActive && <span className="text-[10px] bg-blue-500 px-1.5 py-0.2 rounded">Active</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-sky-400/40 shadow-[0_4px_20px_rgba(2,132,199,0.3)] backdrop-blur-md text-xs font-semibold tracking-wide transition-all hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Switch UI Screen</span>
          <span className="text-slate-400 text-[10px]">({screens.find((s) => s.path === pathname)?.name.slice(0, 1) || "1"}/5)</span>
        </button>
      )}
    </div>
  );
}
