"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").trim().replace(/\/+$/, "");

type OpportunityRecord = {
  id: string;
  title: string;
  organization: string;
  category: string;
  deadline: string;
  status: string;
  verification_status: string;
};

export default function AdminPage() {
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);

  useEffect(() => {
    const loadAdminData = async () => {
      const response = await fetch(`${API_BASE_URL}/api/opportunities`);
      const payload = await response.json();
      setOpportunities(payload.opportunities ?? []);
    };

    loadAdminData();
  }, []);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Opportunity verification and quality</h1>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total opportunities</span>
          <strong>{opportunities.length}</strong>
        </div>
        <div className="stat-card">
          <span>Verified</span>
          <strong>{opportunities.filter((item) => item.verification_status === "VERIFIED").length}</strong>
        </div>
        <div className="stat-card">
          <span>Partially verified</span>
          <strong>{opportunities.filter((item) => item.verification_status === "PARTIALLY_VERIFIED").length}</strong>
        </div>
        <div className="stat-card">
          <span>Open opportunities</span>
          <strong>{opportunities.filter((item) => item.status === "open").length}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h3>Source and verification overview</h3>
        </div>
        <div className="opportunity-list">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="opportunity-card selected">
              <div className="card-topline">
                <span className="tag">{opportunity.category}</span>
                <span className="tag muted">{opportunity.verification_status}</span>
              </div>
              <h4>{opportunity.title}</h4>
              <p>{opportunity.organization}</p>
              <div className="match-row">
                <span>{opportunity.deadline}</span>
                <strong>{opportunity.status}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
