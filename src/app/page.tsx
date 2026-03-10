"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <div className="text-center mt-12 mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Discover Tuscaloosa
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find people, businesses, and services in your community.
          <br />
          <span className="text-indigo-600 font-medium">AI-agent ready.</span>
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl mb-16">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "math tutor", "barber near campus", "looking for work"...'
            className="flex-1 px-5 py-4 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-medium hover:bg-indigo-700 shadow-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-3 mb-16 justify-center">
        {[
          { label: "People looking for work", q: "", type: "person", status: "looking_for_work" },
          { label: "Businesses hiring", q: "", type: "business", status: "hiring" },
          { label: "Tutors", q: "tutor", type: "", status: "" },
          { label: "Barbers", q: "barber", type: "", status: "" },
          { label: "Lawn care", q: "lawn care", type: "", status: "" },
        ].map((filter) => (
          <Link
            key={filter.label}
            href={`/search?q=${filter.q}${filter.type ? `&type=${filter.type}` : ""}${filter.status ? `&status=${filter.status}` : ""}`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors shadow-sm"
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-20">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-3xl mb-3">👤</div>
          <h3 className="font-semibold text-lg mb-2">People Profiles</h3>
          <p className="text-gray-600 text-sm">
            Create a profile, list your skills, and mark your availability.
            Get found by people and businesses who need you.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-3xl mb-3">🏪</div>
          <h3 className="font-semibold text-lg mb-2">Business Listings</h3>
          <p className="text-gray-600 text-sm">
            Register your business, list services and hours. Let customers and
            AI agents discover what you offer.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-semibold text-lg mb-2">AI-Agent API</h3>
          <p className="text-gray-600 text-sm">
            Build apps and AI agents that search for people and services. Scoped
            API keys with safe, rate-limited access.
          </p>
        </div>
      </div>
    </div>
  );
}
