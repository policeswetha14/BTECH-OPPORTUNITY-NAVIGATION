"use client";

import React from "react";

export interface OpportunityDetail {
  id: string;
  title: string;
  organization: string;
  category: string;
  deadline: string;
  eligibility: string;
  skills: string[];
  match_score: number;
  stipend?: string | null;
  location?: string;
  mode?: string;
  tag?: string;
  missing_skills?: string[];
  reasons?: string[];
  breakdown?: Record<string, number>;
  applicationUrl?: string;
  reportedApplicationUrl?: string;
  isSaved?: boolean;
  description?: string;
  requirements?: string;
  applicationLinkStatus?: "verified" | "unverified" | "unavailable";
  sourceUrl?: string | null;
  applicationStatus?: string;
  eligibilityStatus?: string;
}

interface ModalProps {
  opportunity: OpportunityDetail | null;
  onClose: () => void;
  onSave?: () => void;
  onApplicationStatusChange?: (status: string) => void;
}

export function OpportunityModal({ opportunity, onClose, onSave, onApplicationStatusChange }: ModalProps) {
  if (!opportunity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-title"
        className="relative my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/95 p-5 text-slate-200 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/60">
                {opportunity.category}
              </span>
              {opportunity.tag && (
                <span className="text-[11px] font-medium text-slate-400">
                  • {opportunity.tag}
                </span>
              )}
            </div>
            <h2 id="opportunity-title" className="text-xl font-bold text-white tracking-tight">
              {opportunity.title}
            </h2>
            <p className="text-sm text-sky-400/90 font-medium">
              {opportunity.organization}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close opportunity details"
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">Match Score</span>
            <span className="text-2xl font-bold text-sky-400">
              {opportunity.match_score}%
            </span>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">Deadline</span>
            <span className="text-xs font-semibold text-amber-400">
              {opportunity.deadline}
            </span>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">Eligibility</span>
            <span className="text-xs font-semibold text-emerald-400 capitalize">
              {(opportunity.eligibilityStatus ?? "Not evaluated").replaceAll("_", " ")}
            </span>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">Application status</span>
            <span className="text-xs font-semibold capitalize text-slate-200">
              {(opportunity.applicationStatus ?? "not_tracked").replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <label className="mb-5 block text-xs font-medium text-slate-400">
          Track application
          <select
            aria-label="Track application status"
            value={opportunity.applicationStatus ?? "not_tracked"}
            onChange={(event) => onApplicationStatusChange?.(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="not_tracked">Not tracked</option>
            <option value="applied">Applied</option>
            <option value="assessment">Assessment</option>
            <option value="interview">Interview</option>
            <option value="offered">Offer received</option>
            <option value="rejected">Not selected</option>
          </select>
        </label>

        {/* Eligibility Details */}
        <div className="space-y-3 mb-5 text-sm">
          {opportunity.location && (
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Location</span>
              <p className="mt-1 rounded-lg border border-slate-800/60 bg-slate-950/60 p-2.5 text-slate-200">
                {opportunity.location}{opportunity.mode ? ` · ${opportunity.mode}` : ""}
              </p>
            </div>
          )}
          {opportunity.description && (
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Description</span>
              <p className="mt-1 rounded-lg border border-slate-800/60 bg-slate-950/60 p-2.5 leading-6 text-slate-200">
                {opportunity.description}
              </p>
            </div>
          )}
          {opportunity.requirements && (
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Requirements</span>
              <p className="mt-1 rounded-lg border border-slate-800/60 bg-slate-950/60 p-2.5 leading-6 text-slate-200">
                {opportunity.requirements}
              </p>
            </div>
          )}
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Application link</span>
            <p className="mt-1 break-all rounded-lg border border-slate-800/60 bg-slate-950/60 p-2.5 text-slate-200">
              {opportunity.applicationLinkStatus === "verified"
                ? "Official link verified"
                : opportunity.applicationLinkStatus === "unverified"
                  ? `Not verified: ${opportunity.reportedApplicationUrl ?? "URL unavailable"}`
                  : "Application link unavailable"}
            </p>
            {opportunity.sourceUrl && (
              <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-medium text-sky-300 hover:text-sky-200">
                View source listing ↗
              </a>
            )}
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              Eligibility Criteria
            </span>
            <p className="text-slate-200 mt-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              {opportunity.eligibility}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              Required Skills
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {opportunity.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2.5 py-1 rounded-md bg-blue-950/60 text-sky-300 border border-blue-800/50 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {opportunity.missing_skills && opportunity.missing_skills.length > 0 && (
            <div>
              <span className="text-xs text-amber-400 uppercase font-semibold tracking-wider">
                Skill Gaps to Bridge
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {opportunity.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/50 font-medium"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          {opportunity.applicationUrl && opportunity.applicationLinkStatus === "verified" ? (
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Apply Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          ) : (
            <span className="flex flex-1 items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-500">
              {opportunity.applicationLinkStatus === "unverified" ? "Application link not verified" : "Application link unavailable"}
            </span>
          )}
          <button
            type="button"
            onClick={onSave}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors"
          >
            {opportunity.isSaved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
