"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface SearchResult {
  id: string;
  displayName: string;
  type: string;
  bio: string | null;
  location: string;
  status: string;
  avatarUrl: string | null;
  skills: { name: string; category: string | null }[];
  services: { name: string; category: string | null; price: string | null }[];
}

interface SearchResponse {
  results: SearchResult[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(q);
  const [filterType, setFilterType] = useState(type);
  const [filterStatus, setFilterStatus] = useState(status);

  const fetchResults = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filterType) params.set("type", filterType);
    if (filterStatus) params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data: SearchResponse = await res.json();
      setResults(data.results || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const statusLabels: Record<string, string> = {
    available: "Available",
    looking_for_work: "Looking for work",
    hiring: "Hiring",
    busy: "Busy",
    inactive: "Inactive",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search professors, dining, tutors, opportunities..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="">All types</option>
            <option value="person">People</option>
            <option value="business">Businesses</option>
            <option value="site">Campus Sites</option>
            <option value="opportunity">Opportunities</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="looking_for_work">Looking for work</option>
            <option value="hiring">Hiring</option>
          </select>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Searching...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No results found</p>
          <p className="text-gray-400 text-sm mt-2">Try different search terms or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} result{total !== 1 ? "s" : ""}</p>
          <div className="space-y-4">
            {results.map((profile) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.id}`}
                className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {profile.type === "business" ? "🏪" : profile.type === "site" ? "🏢" : profile.type === "opportunity" ? "🎯" : "👤"}
                      </span>
                      <h3 className="font-semibold text-lg">{profile.displayName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        profile.status === "looking_for_work"
                          ? "bg-green-100 text-green-700"
                          : profile.status === "hiring"
                          ? "bg-blue-100 text-blue-700"
                          : profile.status === "available"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {statusLabels[profile.status] || profile.status}
                      </span>
                    </div>
                    {profile.bio && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{profile.bio}</p>
                    )}
                    <p className="text-gray-400 text-xs">{profile.location}</p>
                  </div>
                </div>
                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
                {profile.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.services.map((svc, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                        {svc.name} {svc.price ? `· ${svc.price}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
