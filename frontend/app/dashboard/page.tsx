"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "../components/Logo";
import { DashboardOpportunityMap } from "../components/IsometricVisuals";
import { OpportunityModal, OpportunityDetail } from "../components/OpportunityModal";
import { ReviewSwitcher } from "../components/ReviewSwitcher";
import { ApiError, apiRequest } from "../lib/api";

const SETTINGS_KEY = "btech-opportunity-notifications";

interface Opportunity extends OpportunityDetail {
  required_skills?: string[];
  description: string;
  requirements: string;
  branch_requirements: string[];
  academic_year_requirements: string[];
  cgpa_requirement: number | null;
  application_url: string | null;
  application_link_status: "verified" | "unverified" | "unavailable";
  source_url: string | null;
  status: string;
  verification_status: string;
  stipend: string | null;
  salary: string | null;
}

interface OpportunitySearchResponse {
  opportunities: Opportunity[];
  total: number;
}

interface StudentProfile {
  name: string;
  branch: string;
  year: number;
  semester: number;
  cgpa: number;
  skills: string[];
  interests: string[];
  preferred_opportunity_types: string[];
  location: string;
  mode: string;
  career_goal: string;
}

interface Recommendation {
  opportunity_id: string;
  match_score: number;
  eligibility_status: string;
  reasons: string[];
  missing_skills: string[];
}

interface DashboardData {
  recommendations: Recommendation[];
  roadmap: { skill: string; priority: string; steps: string[] }[];
  application_status: { opportunity_id: string; title: string; status: string; updated_at: string }[];
  profile_completion: number;
}

type Section =
  | "Overview"
  | "Opportunities"
  | "My Matches"
  | "Profile"
  | "Skills"
  | "Career Paths"
  | "Learning Roadmap"
  | "Applications"
  | "Saved"
  | "Notifications"
  | "Settings";

const navigation: { label: Section; short: string }[] = [
  { label: "Overview", short: "OV" },
  { label: "Opportunities", short: "OP" },
  { label: "My Matches", short: "MM" },
  { label: "Profile", short: "PR" },
  { label: "Skills", short: "SK" },
  { label: "Career Paths", short: "CP" },
  { label: "Learning Roadmap", short: "LR" },
  { label: "Applications", short: "AP" },
  { label: "Saved", short: "SV" },
  { label: "Notifications", short: "NT" },
  { label: "Settings", short: "ST" },
];

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLocaleLowerCase().trim();
}

function formatDeadline(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "Not specified";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getVerifiedApplicationUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const isExampleDomain = url.hostname === "example.com" || url.hostname.endsWith(".example.com");
    if (!["http:", "https:"].includes(url.protocol) || isExampleDomain) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function isGovernment(opportunity: Opportunity): boolean {
  return /\b(government|govt|public sector|psu|ministry|municipal)\b/i.test(
    `${opportunity.organization} ${opportunity.title} ${opportunity.category} ${opportunity.description}`,
  );
}

function isBank(opportunity: Opportunity): boolean {
  return /\b(bank|banking|ibps|sbi|rbi)\b/i.test(
    `${opportunity.organization} ${opportunity.title} ${opportunity.category} ${opportunity.description}`,
  );
}

function isSoftware(opportunity: Opportunity): boolean {
  return /\b(software|technology|developer|programming|coding|information technology|it)\b/i.test(
    `${opportunity.organization} ${opportunity.title} ${opportunity.category} ${opportunity.description}`,
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [eligibilityFilter, setEligibilityFilter] = useState("all");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchResults, setSearchResults] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileEmail, setProfileEmail] = useState("");
  const [profileDraft, setProfileDraft] = useState<StudentProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loadError, setLoadError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [opportunitiesData, profileData, dashboardData, savedData] = await Promise.all([
        apiRequest<OpportunitySearchResponse>("/api/opportunities"),
        apiRequest<{ student?: StudentProfile; email?: string }>("/api/profile"),
        apiRequest<DashboardData>("/api/dashboard"),
        apiRequest<OpportunitySearchResponse>("/api/saved"),
      ]);
      if (!Array.isArray(opportunitiesData.opportunities) || !profileData.student) {
        throw new Error("The opportunity service returned incomplete dashboard data.");
      }
      const recommendations = new Map(
        (dashboardData.recommendations ?? []).map((item) => [item.opportunity_id, item]),
      );
      setOpportunities(
        opportunitiesData.opportunities.map((opportunity) => {
          const recommendation = recommendations.get(opportunity.id);
          return {
            ...opportunity,
            skills: opportunity.required_skills ?? opportunity.skills ?? [],
            match_score: recommendation?.match_score ?? 0,
            missing_skills: recommendation?.missing_skills ?? opportunity.missing_skills ?? [],
          };
        }),
      );
      setProfile(profileData.student);
      setProfileEmail(profileData.email ?? "");
      setDashboard(dashboardData);
      setSavedIds(savedData.opportunities.map((opportunity) => opportunity.id));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login?next=/dashboard");
      } else {
        setLoadError(error instanceof Error ? error.message : "Unable to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedNotifications = window.localStorage.getItem(SETTINGS_KEY);
      if (storedNotifications !== null) setNotificationsEnabled(storedNotifications === "true");
      setPreferencesReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    window.localStorage.setItem(SETTINGS_KEY, String(notificationsEnabled));
  }, [notificationsEnabled, preferencesReady]);

  const recommendationById = useMemo(
    () => new Map((dashboard?.recommendations ?? []).map((item) => [item.opportunity_id, item])),
    [dashboard],
  );

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchError("");
      const query = new URLSearchParams({ q: searchQuery });
      void apiRequest<OpportunitySearchResponse>(`/api/opportunities?${query.toString()}`, {
        signal: controller.signal,
      })
        .then((response) => {
          setSearchResults(
            response.opportunities.map((opportunity) => {
              const recommendation = recommendationById.get(opportunity.id);
              return {
                ...opportunity,
                skills: opportunity.required_skills ?? opportunity.skills ?? [],
                match_score: recommendation?.match_score ?? 0,
                missing_skills: recommendation?.missing_skills ?? opportunity.missing_skills ?? [],
              };
            }),
          );
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          if (error instanceof ApiError && error.status === 401) {
            router.push("/login?next=/dashboard");
            return;
          }
          setSearchError(error instanceof Error ? error.message : "Opportunity search failed.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [opportunities, recommendationById, router, searchQuery]);
  const allLocations = useMemo(
    () => Array.from(new Set(opportunities.map((item) => item.location).filter(Boolean))).sort(),
    [opportunities],
  );
  const allSkills = useMemo(
    () =>
      Array.from(
        new Set(opportunities.flatMap((item) => [...item.skills, ...(item.missing_skills ?? [])]).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [opportunities],
  );

  const displayedOpportunities = searchQuery.trim() ? searchResults : opportunities;
  const filteredOpportunities = useMemo(() => {
    return displayedOpportunities.filter((opportunity) => {
      const recommendation = recommendationById.get(opportunity.id);
      const matchesSector =
        sectorFilter === "all" ||
        (sectorFilter === "government" && isGovernment(opportunity)) ||
        (sectorFilter === "private" && !isGovernment(opportunity) && !isBank(opportunity)) ||
        (sectorFilter === "bank" && isBank(opportunity));
      const haystack = normalize(`${opportunity.title} ${opportunity.category}`);
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "internship" && haystack.includes("intern")) ||
        (typeFilter === "jobs" && /\b(job|full time|full-time|position|graduate role)\b/.test(haystack)) ||
        (typeFilter === "software" && isSoftware(opportunity));
      const matchesLocation = locationFilter === "all" || opportunity.location === locationFilter;
      const matchesSkill =
        skillFilter === "all" || opportunity.skills.some((skill) => normalize(skill) === normalize(skillFilter));
      const matchesEligibility =
        eligibilityFilter === "all" || (recommendation?.eligibility_status ?? "unknown") === eligibilityFilter;
      const matchesSection =
        activeSection !== "Saved" || savedIds.includes(opportunity.id);
      const matchesRecommended =
        activeSection !== "My Matches" || (recommendation?.match_score ?? 0) >= 65;
      return (
        matchesSector &&
        matchesType &&
        matchesLocation &&
        matchesSkill &&
        matchesEligibility &&
        matchesSection &&
        matchesRecommended
      );
    });
  }, [
    activeSection,
    eligibilityFilter,
    locationFilter,
    displayedOpportunities,
    recommendationById,
    savedIds,
    sectorFilter,
    skillFilter,
    typeFilter,
  ]);

  const toggleSaved = async (id: string) => {
    const wasSaved = savedIds.includes(id);
    setActionError("");
    try {
      await apiRequest(`/api/saved/${encodeURIComponent(id)}`, {
        method: wasSaved ? "DELETE" : "POST",
      });
      setSavedIds((current) =>
        wasSaved ? current.filter((savedId) => savedId !== id) : [...current, id],
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login?next=/dashboard");
        return;
      }
      setActionError(error instanceof Error ? error.message : "Could not update saved opportunities.");
    }
  };

  const updateApplicationStatus = async (opportunityId: string, status: string) => {
    setActionError("");
    try {
      const response = await apiRequest<{
        application: DashboardData["application_status"][number] | null;
      }>(`/api/applications/${encodeURIComponent(opportunityId)}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setDashboard((current) => {
        if (!current) return current;
        const remaining = current.application_status.filter(
          (application) => application.opportunity_id !== opportunityId,
        );
        return {
          ...current,
          application_status: response.application
            ? [response.application, ...remaining]
            : remaining,
        };
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login?next=/dashboard");
        return;
      }
      setActionError(error instanceof Error ? error.message : "Could not update application status.");
    }
  };

  const updateProfileDraft = (changes: Partial<StudentProfile>) => {
    setProfileDraft((current) => current ? { ...current, ...changes } : current);
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileDraft) return;
    setProfileError("");
    setProfileMessage("");
    try {
      const response = await apiRequest<{ student: StudentProfile }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(profileDraft),
      });
      setProfile(response.student);
      setProfileDraft(response.student);
      setIsEditingProfile(false);
      setProfileMessage("Your profile changes have been saved.");
      try {
        setDashboard(await apiRequest<DashboardData>("/api/dashboard"));
      } catch (error) {
        setActionError(error instanceof Error ? `Profile saved, but recommendations could not refresh: ${error.message}` : "Profile saved, but recommendations could not refresh.");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login?next=/dashboard");
        return;
      }
      setProfileError(error instanceof Error ? error.message : "Your profile could not be saved.");
    }
  };

  const logout = async () => {
    setActionError("");
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Sign out failed. Please retry.");
    }
  };

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    setSearchError("");
  };

  const clearFilters = () => {
    updateSearchQuery("");
    setSectorFilter("all");
    setTypeFilter("all");
    setLocationFilter("all");
    setSkillFilter("all");
    setEligibilityFilter("all");
  };

  const openOpportunities = () => setActiveSection("Opportunities");
  const profileName = profile?.name ?? "Student";
  const currentNav = navigation.find((item) => item.label === activeSection);
  const upcomingDeadlines = opportunities
    .filter((opportunity) => opportunity.status.toLowerCase() === "open")
    .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime())
    .slice(0, 4);

  const renderOpportunityCards = (items: Opportunity[]) => (
    <>
      {items.length === 0 ? (
        <div className="col-span-full rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-14 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-300">⌕</div>
          <h3 className="text-base font-semibold text-white">No opportunities found</h3>
          <p className="mt-1 text-sm text-slate-400">Try changing your search or filters.</p>
          <button onClick={clearFilters} className="mt-4 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-white">
            Clear search and filters
          </button>
        </div>
      ) : (
        items.map((opportunity) => {
          const recommendation = recommendationById.get(opportunity.id);
          const isSaved = savedIds.includes(opportunity.id);
          return (
            <article key={opportunity.id} className="flex min-h-[280px] flex-col rounded-2xl border border-slate-800 bg-slate-900/65 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.16)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-700/70 hover:bg-slate-900/90">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="max-w-[70%] truncate rounded-full border border-sky-900/70 bg-sky-950/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                  {opportunity.category}
                </span>
                <button
                  type="button"
                  aria-label={isSaved ? `Remove ${opportunity.title} from saved` : `Save ${opportunity.title}`}
                  onClick={() => toggleSaved(opportunity.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${isSaved ? "border-sky-700 bg-sky-950/60 text-sky-300" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"}`}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
              <h3 className="line-clamp-2 min-h-12 text-lg font-semibold leading-6 text-white">{opportunity.title}</h3>
              <p className="mt-1 truncate text-sm font-medium text-sky-200">{opportunity.organization}</p>
              <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-300">
                <p><span className="text-slate-500">Location</span><span className="ml-2">{opportunity.location || "Not specified"}</span></p>
                <p className="line-clamp-2"><span className="text-slate-500">Eligibility</span><span className="ml-2">{opportunity.eligibility}</span></p>
                <p><span className="text-slate-500">Deadline</span><span className="ml-2 text-amber-200">{formatDeadline(opportunity.deadline)}</span></p>
              </div>
              <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
                {opportunity.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-300">{skill}</span>
                ))}
                {opportunity.skills.length > 4 && <span className="px-1 py-1 text-[11px] text-slate-500">+{opportunity.skills.length - 4}</span>}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400">
                  {recommendation ? `${recommendation.match_score}% match` : opportunity.verification_status}
                  <span className={`mt-1 block ${opportunity.application_link_status === "verified" ? "text-emerald-300" : "text-slate-500"}`}>
                    {opportunity.application_link_status === "verified" ? "Official link verified" : opportunity.application_link_status === "unverified" ? "Link not verified" : "No verified apply link"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedOpportunity(opportunity)}
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  View Details
                </button>
              </div>
            </article>
          );
        })
      )}
    </>
  );

  const renderFilters = () => (
    <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/55 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Find the right opportunity</h2>
          <p className="mt-0.5 text-xs text-slate-400">Search updates as you type and works with every filter.</p>
        </div>
        <p role="status" className="text-xs text-slate-400">{searching ? "Searching…" : `${filteredOpportunities.length} of ${opportunities.length} opportunities`}</p>
      </div>
      {searchError && <p role="alert" className="mb-3 text-xs text-rose-300">Search failed: {searchError}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
        <label className="relative sm:col-span-2 xl:col-span-2">
          <span className="sr-only">Search opportunities</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => updateSearchQuery(event.target.value)}
            placeholder="Name, organization, skill, location..."
            className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/75 px-3 pr-16 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          {searchQuery && (
            <button type="button" onClick={() => updateSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-sky-300 hover:bg-slate-800">
              Clear
            </button>
          )}
        </label>
        <select aria-label="Sector" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)} className="filter-select">
          <option value="all">All sectors</option><option value="government">Government</option><option value="private">Private</option><option value="bank">Bank</option>
        </select>
        <select aria-label="Opportunity type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="filter-select">
          <option value="all">All types</option><option value="internship">Internship</option><option value="jobs">Jobs</option><option value="software">Software / IT</option>
        </select>
        <select aria-label="Location" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} className="filter-select">
          <option value="all">All locations</option>{allLocations.map((location) => <option key={location} value={location}>{location}</option>)}
        </select>
        <select aria-label="Required skill" value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} className="filter-select">
          <option value="all">All skills</option>{allSkills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
        </select>
        <select aria-label="Eligibility" value={eligibilityFilter} onChange={(event) => setEligibilityFilter(event.target.value)} className="filter-select sm:col-span-2 xl:col-span-2">
          <option value="all">Any eligibility</option><option value="eligible">Eligible</option><option value="partially_eligible">Partially eligible</option><option value="not_eligible">Not eligible</option>
        </select>
      </div>
    </div>
  );

  const sectionTitle: Record<Section, string> = {
    Overview: "Your opportunity dashboard",
    Opportunities: "Explore opportunities",
    "My Matches": "Your strongest matches",
    Profile: "Student profile",
    Skills: "Skills & development",
    "Career Paths": "Career paths",
    "Learning Roadmap": "Learning roadmap",
    Applications: "Application tracker",
    Saved: "Saved opportunities",
    Notifications: "Deadline notifications",
    Settings: "Dashboard settings",
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,116,144,0.13),transparent_40%),linear-gradient(145deg,#070d19,#0a1324_58%,#070d19)]" />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/45 px-4 py-5 lg:flex">
          <div className="mb-7 px-2"><Logo /></div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <nav aria-label="Dashboard navigation" className="space-y-1">
            {navigation.map((item) => (
              <button key={item.label} type="button" onClick={() => setActiveSection(item.label)} aria-current={activeSection === item.label ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${activeSection === item.label ? "border border-sky-800/70 bg-sky-950/60 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-bold ${activeSection === item.label ? "bg-sky-900/80 text-sky-200" : "bg-slate-900 text-slate-500"}`}>{item.short}</span>
                <span>{item.label}</span>
                {item.label === "Saved" && savedIds.length > 0 && <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{savedIds.length}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-800 pt-4">
            <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition hover:bg-rose-950/30 hover:text-rose-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[10px]">↗</span>Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#080f1e]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="lg:hidden"><Logo /></div>
              <div className="relative min-w-[210px] flex-1 lg:max-w-xl">
                <label className="sr-only" htmlFor="dashboard-search">Search opportunities</label>
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
                <input
                  id="dashboard-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => { updateSearchQuery(event.target.value); if (event.target.value) setActiveSection("Opportunities"); }}
                  placeholder="Search opportunities, skills, locations..."
                  className="h-10 w-full rounded-xl border border-slate-700/90 bg-slate-900/80 pl-9 pr-16 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                {searchQuery && <button type="button" onClick={() => updateSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-sky-300 hover:bg-slate-800">Clear</button>}
              </div>
              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <button type="button" onClick={() => setActiveSection("Notifications")} aria-label="Open notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-300 transition hover:border-slate-500 hover:text-white">
                  <span aria-hidden="true">♧</span>
                  {notificationsEnabled && upcomingDeadlines.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </button>
                <button type="button" onClick={() => setActiveSection("Profile")} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-left transition hover:border-slate-500">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-700 to-indigo-700 text-xs font-bold text-white">{profileName.charAt(0).toUpperCase()}</span>
                  <span className="hidden text-sm font-medium text-slate-200 sm:inline">{profileName}</span>
                </button>
              </div>
            </div>
            <nav aria-label="Mobile dashboard navigation" className="mt-3 flex gap-1 overflow-x-auto pb-0.5 lg:hidden">
              {navigation.map((item) => <button key={item.label} type="button" onClick={() => setActiveSection(item.label)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${activeSection === item.label ? "bg-sky-900/70 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>{item.label}</button>)}
              <button type="button" onClick={() => void logout()} className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/50">Logout</button>
            </nav>
          </header>

          <main className="mx-auto w-full max-w-[1500px] min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">{currentNav?.label ?? "Dashboard"}</p>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{sectionTitle[activeSection]}</h1>
                <p className="mt-1 text-sm text-slate-400">
                  {profile ? `Welcome back, ${profile.name}. Find the next opportunity that fits your goals.` : "Your opportunities, profile, and next steps in one place."}
                </p>
              </div>
              {activeSection === "Overview" && (
                <button type="button" onClick={openOpportunities} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-[#070d19]">
                  Explore opportunities
                </button>
              )}
            </div>

            {actionError && <p role="alert" className="mb-4 rounded-xl border border-rose-900/70 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{actionError}</p>}

            {loading ? (
              <div role="status" className="rounded-2xl border border-slate-800 bg-slate-900/55 p-10 text-center text-sm text-slate-400">Loading your dashboard data…</div>
            ) : loadError ? (
              <section role="alert" className="mx-auto max-w-2xl rounded-2xl border border-amber-900/60 bg-slate-900/80 p-6 shadow-xl sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-800/60 bg-amber-950/50 text-lg text-amber-200" aria-hidden="true">!</div>
                <h2 className="mt-5 text-xl font-semibold text-white">Dashboard service unavailable</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{loadError}</p>
                <p className="mt-4 text-xs text-slate-400">From the project folder, start the backend with:</p>
                <code className="mt-2 block overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-sky-200">cd backend; py -3.12 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload</code>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => void loadDashboard()} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500">Retry connection</button>
                  <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">Back to home</Link>
                </div>
              </section>
            ) : (
              <>
                {activeSection === "Overview" && (
                  <div className="space-y-6">
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { title: "Opportunities", value: opportunities.length, hint: "Available in the current feed" },
                        { title: "Strong matches", value: (dashboard?.recommendations ?? []).filter((item) => item.match_score >= 65).length, hint: "Based on your profile" },
                        { title: "Skills listed", value: profile?.skills.length ?? 0, hint: "From your student profile" },
                        { title: "Profile complete", value: `${dashboard?.profile_completion ?? 0}%`, hint: "Profile readiness" },
                      ].map((metric) => (
                        <article key={metric.title} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
                          <p className="text-sm text-slate-400">{metric.title}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-white">{metric.value}</p><p className="mt-1 text-xs text-slate-500">{metric.hint}</p>
                        </article>
                      ))}
                    </section>

                    <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5 xl:col-span-2">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div><h2 className="font-semibold text-white">Your career map</h2><p className="mt-1 text-sm text-slate-400">A visual overview of your skills and career interests.</p></div>
                          <button type="button" onClick={() => setActiveSection("Career Paths")} className="text-xs font-semibold text-sky-300 hover:text-white">Career paths →</button>
                        </div>
                        <div className="mx-auto w-full max-w-2xl overflow-hidden"><DashboardOpportunityMap /></div>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
                        <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-white">Profile snapshot</h2><p className="mt-1 text-xs text-slate-400">Your current academic profile</p></div><button type="button" onClick={() => setActiveSection("Profile")} className="text-xs font-semibold text-sky-300 hover:text-white">View →</button></div>
                        <dl className="space-y-3 text-sm">
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Branch</dt><dd className="text-right text-slate-200">{profile?.branch}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Academic year</dt><dd className="text-right text-slate-200">{profile?.year ? `${profile.year}${profile.year === 1 ? "st" : profile.year === 2 ? "nd" : profile.year === 3 ? "rd" : "th"} year` : "—"}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">CGPA</dt><dd className="text-right text-slate-200">{profile?.cgpa ?? "—"}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-500">Career goal</dt><dd className="text-right text-slate-200">{profile?.career_goal ?? "—"}</dd></div>
                        </dl>
                        <div className="mt-5 border-t border-slate-800 pt-4"><p className="mb-2 text-xs font-medium text-slate-400">Your skills</p><div className="flex flex-wrap gap-1.5">{profile?.skills.slice(0, 5).map((skill) => <span key={skill} className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-300">{skill}</span>)}</div></div>
                      </div>
                    </section>

                    <section>
                      <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Recommended for you</h2><p className="mt-1 text-sm text-slate-400">Current opportunities ranked against your profile.</p></div><button type="button" onClick={openOpportunities} className="text-sm font-medium text-sky-300 hover:text-white">View all →</button></div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{renderOpportunityCards([...opportunities].sort((left, right) => (recommendationById.get(right.id)?.match_score ?? 0) - (recommendationById.get(left.id)?.match_score ?? 0)).slice(0, 3))}</div>
                    </section>

                    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
                        <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-white">Upcoming deadlines</h2><p className="mt-1 text-xs text-slate-400">Dates from the current opportunity feed</p></div><button type="button" onClick={() => setActiveSection("Notifications")} className="text-xs font-semibold text-sky-300">View all →</button></div>
                        <ul className="divide-y divide-slate-800">{upcomingDeadlines.slice(0, 3).map((item) => <li key={item.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{item.title}</p><p className="truncate text-xs text-slate-500">{item.organization}</p></div><time className="shrink-0 text-xs text-amber-200">{formatDeadline(item.deadline)}</time></li>)}</ul>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
                        <h2 className="font-semibold text-white">Quick actions</h2><p className="mt-1 text-xs text-slate-400">Pick up where you left off.</p>
                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {[["Browse opportunities", "Opportunities"], ["Review your skills", "Skills"], ["Open career roadmap", "Learning Roadmap"], ["Manage saved roles", "Saved"]].map(([label, section]) => <button key={section} type="button" onClick={() => setActiveSection(section as Section)} className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-sky-700 hover:bg-slate-800">{label}<span className="float-right text-sky-300">→</span></button>)}
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {["Opportunities", "My Matches", "Saved"].includes(activeSection) && (
                  <section>
                    {renderFilters()}
                    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {activeSection === "Saved" && savedIds.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-14 text-center">
                          <h3 className="text-base font-semibold text-white">No saved opportunities yet</h3><p className="mt-1 text-sm text-slate-400">Use Save on any opportunity to keep it here.</p><button type="button" onClick={openOpportunities} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Browse opportunities</button>
                        </div>
                      ) : renderOpportunityCards(filteredOpportunities)}
                    </div>
                  </section>
                )}

                {activeSection === "Profile" && (
                  <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <article className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6 lg:col-span-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><h2 className="font-semibold text-white">Academic and career profile</h2><p className="mt-1 text-sm text-slate-400">{profileEmail || "Account profile"} · Used for opportunity matching.</p></div>
                        {!isEditingProfile && <button type="button" onClick={() => { setProfileDraft(profile ? { ...profile, skills: [...profile.skills], interests: [...profile.interests], preferred_opportunity_types: [...profile.preferred_opportunity_types] } : null); setProfileError(""); setProfileMessage(""); setIsEditingProfile(true); }} className="rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-600 hover:text-white">Edit Profile</button>}
                      </div>
                      {profileMessage && <p role="status" className="mt-4 rounded-lg border border-emerald-900/70 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">{profileMessage}</p>}
                      {profileError && <p role="alert" className="mt-4 rounded-lg border border-rose-900/70 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{profileError}</p>}
                      {isEditingProfile && profileDraft ? (
                        <form onSubmit={saveProfile} className="mt-5 space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="text-xs font-medium text-slate-400">Full name<input required minLength={2} maxLength={100} value={profileDraft.name} onChange={(event) => updateProfileDraft({ name: event.target.value })} className="profile-input" /></label>
                            <label className="text-xs font-medium text-slate-400">Branch<input required maxLength={100} value={profileDraft.branch} onChange={(event) => updateProfileDraft({ branch: event.target.value })} className="profile-input" /></label>
                            <label className="text-xs font-medium text-slate-400">Year<select value={profileDraft.year} onChange={(event) => updateProfileDraft({ year: Number(event.target.value) })} className="profile-input">{[1, 2, 3, 4].map((year) => <option key={year} value={year}>{year}{year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} year</option>)}</select></label>
                            <label className="text-xs font-medium text-slate-400">Semester<input required type="number" min={1} max={8} value={profileDraft.semester} onChange={(event) => updateProfileDraft({ semester: Number(event.target.value) })} className="profile-input" /></label>
                            <label className="text-xs font-medium text-slate-400">CGPA<input required type="number" min={0} max={10} step={0.01} value={profileDraft.cgpa} onChange={(event) => updateProfileDraft({ cgpa: Number(event.target.value) })} className="profile-input" /></label>
                            <label className="text-xs font-medium text-slate-400">Preferred location<input required maxLength={100} value={profileDraft.location} onChange={(event) => updateProfileDraft({ location: event.target.value })} className="profile-input" /></label>
                            <label className="text-xs font-medium text-slate-400">Preferred work mode<select value={profileDraft.mode} onChange={(event) => updateProfileDraft({ mode: event.target.value })} className="profile-input"><option>Remote</option><option>Hybrid</option><option>Onsite</option></select></label>
                            <label className="text-xs font-medium text-slate-400">Career goal<input required maxLength={120} value={profileDraft.career_goal} onChange={(event) => updateProfileDraft({ career_goal: event.target.value })} className="profile-input" /></label>
                            <label className="text-xs font-medium text-slate-400 sm:col-span-2">Skills, comma separated<textarea rows={2} value={profileDraft.skills.join(", ")} onChange={(event) => updateProfileDraft({ skills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) })} className="profile-input resize-y" /></label>
                            <label className="text-xs font-medium text-slate-400 sm:col-span-2">Interests, comma separated<textarea rows={2} value={profileDraft.interests.join(", ")} onChange={(event) => updateProfileDraft({ interests: event.target.value.split(",").map((interest) => interest.trim()).filter(Boolean) })} className="profile-input resize-y" /></label>
                            <label className="text-xs font-medium text-slate-400 sm:col-span-2">Preferred opportunity types, comma separated<textarea rows={2} value={profileDraft.preferred_opportunity_types.join(", ")} onChange={(event) => updateProfileDraft({ preferred_opportunity_types: event.target.value.split(",").map((type) => type.trim()).filter(Boolean) })} className="profile-input resize-y" /></label>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-1">
                            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Save changes</button>
                            <button type="button" onClick={() => { setProfileDraft(null); setIsEditingProfile(false); setProfileError(""); }} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">{[
                            ["Name", profile?.name], ["Branch", profile?.branch], ["Year", profile?.year], ["Semester", profile?.semester], ["CGPA", profile?.cgpa], ["Location", profile?.location], ["Preferred mode", profile?.mode], ["Career goal", profile?.career_goal],
                          ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-100">{value ?? "—"}</dd></div>)}</dl>
                          <div className="mt-5"><h3 className="mb-2 text-sm font-medium text-slate-300">Skills</h3><div className="flex flex-wrap gap-2">{profile?.skills.map((skill) => <span key={skill} className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300">{skill}</span>)}</div></div>
                          <div className="mt-5"><h3 className="mb-2 text-sm font-medium text-slate-300">Interests</h3><div className="flex flex-wrap gap-2">{profile?.interests.map((interest) => <span key={interest} className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300">{interest}</span>)}</div></div>
                          <div className="mt-5"><h3 className="mb-2 text-sm font-medium text-slate-300">Preferred opportunity types</h3><div className="flex flex-wrap gap-2">{profile?.preferred_opportunity_types.map((type) => <span key={type} className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300">{type}</span>)}</div></div>
                        </>
                      )}
                    </article>
                    <aside className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6"><p className="text-sm text-slate-400">Profile completion</p><p className="mt-2 text-4xl font-semibold text-white">{dashboard?.profile_completion ?? 0}%</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-sky-500" style={{ width: `${dashboard?.profile_completion ?? 0}%` }} /></div><p className="mt-3 text-xs leading-5 text-slate-400">Profile information is sourced from the existing student profile endpoint.</p><button type="button" onClick={() => setActiveSection("Settings")} className="mt-5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-sky-700">Dashboard settings</button></aside>
                  </section>
                )}

                {activeSection === "Skills" && (
                  <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <article className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6"><h2 className="font-semibold text-white">Skills in your profile</h2><p className="mt-1 text-sm text-slate-400">Skills currently considered by the matching engine.</p><div className="mt-5 flex flex-wrap gap-2">{profile?.skills.map((skill) => <span key={skill} className="rounded-lg border border-sky-900/60 bg-sky-950/40 px-3 py-2 text-sm text-sky-200">{skill}</span>)}</div></article>
                    <article className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6"><h2 className="font-semibold text-white">Skills to strengthen</h2><p className="mt-1 text-sm text-slate-400">Skill gaps are drawn from the current opportunity recommendations.</p><div className="mt-5 space-y-3">{(dashboard?.roadmap ?? []).length === 0 ? <p className="text-sm text-slate-400">No skill gaps were returned by the recommendation service.</p> : dashboard?.roadmap.map((item) => <div key={item.skill} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-3"><span className="text-sm font-medium text-slate-200">{item.skill}</span><span className="text-xs text-amber-200">{item.priority} priority</span></div>)}</div><button type="button" onClick={() => setActiveSection("Learning Roadmap")} className="mt-5 text-sm font-medium text-sky-300 hover:text-white">Open learning roadmap →</button></article>
                  </section>
                )}

                {activeSection === "Learning Roadmap" && (
                  <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">{(dashboard?.roadmap ?? []).length === 0 ? <p className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6 text-sm text-slate-400">The recommendation service has no learning roadmap items at this time.</p> : dashboard?.roadmap.map((item) => <article key={item.skill} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-white">{item.skill}</h2><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-sky-200">{item.priority} priority</span></div><ol className="mt-4 space-y-2">{item.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm text-slate-300"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] text-sky-200">{index + 1}</span><span className="pt-0.5">{step}</span></li>)}</ol></article>)}</section>
                )}

                {activeSection === "Career Paths" && (
                  <section className="space-y-5">
                    <article className="rounded-2xl border border-slate-800 bg-gradient-to-r from-sky-950/45 to-slate-900/65 p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Current career goal</p><h2 className="mt-2 text-2xl font-semibold text-white">{profile?.career_goal ?? "Career goal not set"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Explore available opportunities related to your goal, using current recommendations and profile data.</p><button type="button" onClick={() => { updateSearchQuery(profile?.career_goal ?? ""); setActiveSection("Opportunities"); }} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Find related opportunities</button></article>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{renderOpportunityCards([...opportunities].sort((a, b) => (recommendationById.get(b.id)?.match_score ?? 0) - (recommendationById.get(a.id)?.match_score ?? 0)).slice(0, 3))}</div>
                  </section>
                )}

                {activeSection === "Applications" && (
                  <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/65">
                    <div className="border-b border-slate-800 px-5 py-4"><h2 className="font-semibold text-white">Application activity</h2><p className="mt-1 text-sm text-slate-400">Update an opportunity&apos;s status from its details to keep your personal tracker current.</p></div>
                    {(dashboard?.application_status ?? []).length === 0 ? <p className="p-6 text-sm text-slate-400">No applications are being tracked yet. Open an opportunity and choose a status to add it here.</p> : <ul className="divide-y divide-slate-800">{dashboard?.application_status.map((application) => <li key={application.opportunity_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-medium text-slate-200">{application.title}</p><p className="mt-1 text-xs text-slate-500">Updated {formatDeadline(application.updated_at)}</p></div><span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs capitalize text-sky-200">{application.status.replaceAll("_", " ")}</span></li>)}</ul>}
                  </section>
                )}

                {activeSection === "Notifications" && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5 sm:p-6"><div className="mb-4"><h2 className="font-semibold text-white">Open opportunity deadlines</h2><p className="mt-1 text-sm text-slate-400">{notificationsEnabled ? "Sorted by deadline using live opportunity data." : "Deadline reminders are paused in Settings."}</p></div>{upcomingDeadlines.length === 0 ? <p className="text-sm text-slate-400">No upcoming open deadlines are available.</p> : <ul className="divide-y divide-slate-800">{upcomingDeadlines.map((opportunity) => <li key={opportunity.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{opportunity.title}</p><p className="mt-1 text-xs text-slate-400">{opportunity.organization} · {opportunity.location}</p></div><div className="flex items-center gap-3"><time className="text-sm text-amber-200">{formatDeadline(opportunity.deadline)}</time><button type="button" onClick={() => setSelectedOpportunity(opportunity)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:border-sky-600">View</button></div></li>)}</ul>}</section>
                )}

                {activeSection === "Settings" && (
                  <section className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/65 p-6"><h2 className="font-semibold text-white">Preferences</h2><p className="mt-1 text-sm text-slate-400">These preferences are stored in this browser.</p><label className="mt-6 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/45 p-4"><span><span className="block text-sm font-medium text-slate-200">Deadline reminders</span><span className="mt-1 block text-xs text-slate-500">Show deadline indicators in your dashboard.</span></span><input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} className="mt-1 h-4 w-4 accent-sky-500" /></label><button type="button" onClick={() => void logout()} className="mt-5 rounded-lg border border-rose-900/70 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-950/50">Logout</button></section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <OpportunityModal
        opportunity={selectedOpportunity ? {
          ...selectedOpportunity,
          match_score: recommendationById.get(selectedOpportunity.id)?.match_score ?? 0,
          applicationUrl: selectedOpportunity.application_link_status === "verified"
            ? getVerifiedApplicationUrl(selectedOpportunity.application_url)
            : undefined,
          reportedApplicationUrl: selectedOpportunity.application_url ?? undefined,
          applicationLinkStatus: selectedOpportunity.application_link_status,
          sourceUrl: selectedOpportunity.source_url,
          eligibilityStatus: recommendationById.get(selectedOpportunity.id)?.eligibility_status,
          applicationStatus: dashboard?.application_status.find(
            (application) => application.opportunity_id === selectedOpportunity.id,
          )?.status ?? "not_tracked",
          isSaved: savedIds.includes(selectedOpportunity.id),
        } : null}
        onClose={() => setSelectedOpportunity(null)}
        onSave={() => selectedOpportunity && toggleSaved(selectedOpportunity.id)}
        onApplicationStatusChange={(status) => {
          if (selectedOpportunity) void updateApplicationStatus(selectedOpportunity.id, status);
        }}
      />
      <ReviewSwitcher />
    </div>
  );
}
