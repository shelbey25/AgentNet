"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Opportunity {
  id: string;
  matchScore: number | null;
  reason: string | null;
  status: string;
  createdAt: string;
  profile: {
    id: string;
    displayName: string;
    bio: string | null;
    opportunityType: string | null;
    department: string | null;
    deadline: string | null;
    compensation: string | null;
    eligibility: string | null;
    applyUrl: string | null;
    tags: string[];
  };
}

interface BrowseOpportunity {
  id: string;
  displayName: string;
  bio?: string;
  abstract?: string;
  opportunityType?: string;
  department?: string;
  deadline?: string;
  compensation?: string;
  [key: string]: unknown;
}

export default function OpportunitiesPage() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<BrowseOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Load matched opportunities for logged-in users, or browse all
    if (session?.user) {
      fetch("/api/v1/opportunities/matched")
        .then((r) => r.json())
        .then((d) => setOpportunities(d.matches || []))
        .catch(() => {});
    }
    // Always load all opportunities
    fetch("/api/v1/search?type=opportunity&limit=50")
      .then((r) => r.json())
      .then((d) => setAllOpportunities(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const typeColors: Record<string, string> = {
    research: "bg-purple-100 text-purple-800",
    internship: "bg-blue-100 text-blue-800",
    scholarship: "bg-green-100 text-green-800",
    job: "bg-amber-100 text-amber-800",
    volunteer: "bg-pink-100 text-pink-800",
    club: "bg-teal-100 text-teal-800",
  };

  const filteredAll = filter === "all"
    ? allOpportunities
    : allOpportunities.filter((o) => o.opportunityType === filter);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Opportunities</h1>
      <p className="text-gray-500 mb-6">
        Research positions, internships, scholarships, and more at UA
      </p>

      {/* Matched opportunities for logged-in users */}
      {session?.user && opportunities.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>⭐</span> Matched For You
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/profile/${opp.profile.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{opp.profile.displayName}</h3>
                  {opp.matchScore && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      {Math.round(opp.matchScore)}% match
                    </span>
                  )}
                </div>
                {opp.profile.opportunityType && (
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${typeColors[opp.profile.opportunityType] || "bg-gray-100 text-gray-600"}`}>
                    {opp.profile.opportunityType}
                  </span>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{opp.profile.bio}</p>
                {opp.reason && <p className="text-xs text-gray-400 italic">{opp.reason}</p>}
                {opp.profile.deadline && (
                  <p className="text-xs text-amber-600 mt-2">
                    Deadline: {new Date(opp.profile.deadline).toLocaleDateString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "research", "internship", "scholarship", "job", "volunteer", "club"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t
                ? "bg-[var(--crimson)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* All opportunities */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredAll.length > 0 ? (
          filteredAll.map((opp) => (
            <Link
              key={opp.id}
              href={`/profile/${opp.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow block"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{opp.displayName}</h3>
              {opp.opportunityType && (
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${typeColors[opp.opportunityType] || "bg-gray-100 text-gray-600"}`}>
                  {opp.opportunityType}
                </span>
              )}
              {opp.department && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2 ml-1 bg-gray-100 text-gray-600">
                  {opp.department}
                </span>
              )}
              <p className="text-sm text-gray-600 line-clamp-2">{opp.bio || opp.abstract}</p>
              {opp.compensation && (
                <p className="text-xs text-green-600 mt-2">{opp.compensation}</p>
              )}
              {opp.deadline && (
                <p className="text-xs text-amber-600 mt-1">
                  Deadline: {new Date(opp.deadline).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))
        ) : (
          <p className="text-gray-400 text-sm col-span-2">No opportunities found for this filter.</p>
        )}
      </div>
    </div>
  );
}
