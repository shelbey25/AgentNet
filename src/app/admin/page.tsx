"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Stats {
  totalStudents: number;
  totalProfiles: number;
  totalOpportunities: number;
  totalInitiatives: number;
  totalMatches: number;
  recentSessions: number;
}

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [promptText, setPromptText] = useState("");
  const [promptResponse, setPromptResponse] = useState("");
  const [prompting, setPrompting] = useState(false);
  const [pushMsg, setPushMsg] = useState("");

  // Push opportunity form
  const [pushOpportunityId, setPushOpportunityId] = useState("");
  const [pushTargetMajor, setPushTargetMajor] = useState("");
  const [pushTargetMinGPA, setPushTargetMinGPA] = useState("");
  const [pushing, setPushing] = useState(false);

  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "admin";

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
    } else if (sessionStatus === "authenticated" && !isAdmin) {
      router.push("/");
    }
  }, [sessionStatus, isAdmin, router]);

  useEffect(() => {
    if (session?.user && isAdmin) {
      fetch("/api/v1/admin/stats")
        .then((r) => r.json())
        .then((d) => setStats(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session, isAdmin]);

  const handlePromptUpdate = async () => {
    if (!promptText.trim()) return;
    setPrompting(true);
    setPromptResponse("");

    try {
      const res = await fetch("/api/v1/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText.trim() }),
      });
      const data = await res.json();
      setPromptResponse(data.message || data.error || "Done");
      if (res.ok) setPromptText("");
    } catch {
      setPromptResponse("Failed to process update.");
    } finally {
      setPrompting(false);
    }
  };

  const handlePushOpportunity = async () => {
    if (!pushOpportunityId.trim()) return;
    setPushing(true);
    setPushMsg("");

    try {
      const res = await fetch("/api/v1/admin/push-opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: pushOpportunityId.trim(),
          targetMajor: pushTargetMajor.trim() || undefined,
          targetMinGPA: pushTargetMinGPA ? parseFloat(pushTargetMinGPA) : undefined,
        }),
      });
      const data = await res.json();
      setPushMsg(data.message || data.error || "Done");
      if (res.ok) { setPushOpportunityId(""); setPushTargetMajor(""); setPushTargetMinGPA(""); }
    } catch {
      setPushMsg("Failed to push opportunity.");
    } finally {
      setPushing(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage UA data, push opportunities, and monitor the platform</p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Students", value: stats.totalStudents, icon: "🎓" },
            { label: "Profiles", value: stats.totalProfiles, icon: "👤" },
            { label: "Opportunities", value: stats.totalOpportunities, icon: "⭐" },
            { label: "Initiatives", value: stats.totalInitiatives, icon: "🚀" },
            { label: "Matches Sent", value: stats.totalMatches, icon: "🎯" },
            { label: "Chat Sessions", value: stats.recentSessions, icon: "💬" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Prompt-based update */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>💬</span> Update Data via Prompt
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Describe what you want to update in natural language. The system will determine the correct entity and fields to update.
          </p>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={'e.g., "Add a new research opportunity in the CS department for Spring 2027"'}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] mb-3"
          />
          <button
            onClick={handlePromptUpdate}
            disabled={prompting || !promptText.trim()}
            className="btn-crimson px-4 py-2 rounded-lg text-sm font-medium"
          >
            {prompting ? "Processing..." : "Submit Update"}
          </button>
          {promptResponse && (
            <div className="mt-3 text-sm p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">{promptResponse}</div>
          )}
        </div>

        {/* Push opportunity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>🎯</span> Push Opportunity to Students
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Match an opportunity to students based on their profile. Filters are optional — leave blank to match all.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Profile ID *</label>
              <input
                value={pushOpportunityId}
                onChange={(e) => setPushOpportunityId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                placeholder="Profile ID"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Major</label>
                <input
                  value={pushTargetMajor}
                  onChange={(e) => setPushTargetMajor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min GPA</label>
                <input
                  value={pushTargetMinGPA}
                  onChange={(e) => setPushTargetMinGPA(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                  placeholder="e.g., 3.0"
                  type="number"
                  step="0.1"
                />
              </div>
            </div>
            <button
              onClick={handlePushOpportunity}
              disabled={pushing || !pushOpportunityId.trim()}
              className="btn-crimson px-4 py-2 rounded-lg text-sm font-medium"
            >
              {pushing ? "Pushing..." : "Push to Matching Students"}
            </button>
            {pushMsg && (
              <div className="text-sm p-3 bg-gray-50 rounded-lg text-gray-700">{pushMsg}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
