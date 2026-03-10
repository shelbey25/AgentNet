"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function KeysPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read:search", "read:profiles"]);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/auth/login");
  }, [sessionStatus, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/keys")
        .then((res) => res.json())
        .then(setKeys)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const createKey = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    setNewKey("");

    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, scopes }),
    });

    const data = await res.json();
    setCreating(false);

    if (res.ok) {
      setNewKey(data.key);
      setKeys((prev) => [{ id: data.id, name: data.name, keyPrefix: data.keyPrefix, scopes: data.scopes, rateLimit: data.rateLimit, isActive: true, lastUsedAt: null, createdAt: data.createdAt }, ...prev]);
      setName("");
    } else {
      setError(data.error || "Failed to create key");
    }
  };

  const revokeKey = async (keyId: string) => {
    await fetch(`/api/keys/${keyId}`, { method: "DELETE" });
    setKeys((prev) => prev.map((k) => k.id === keyId ? { ...k, isActive: false } : k));
  };

  const toggleScope = (scope: string) => {
    setScopes((prev) => prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]);
  };

  if (sessionStatus === "loading" || loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <Link href="/dashboard" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          Dashboard
        </Link>
      </div>

      {/* Create Key */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Create New API Key</h2>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-4">{error}</div>
        )}
        {newKey && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <p className="text-sm font-medium text-green-800 mb-2">🔑 Your new API key (save it now — you won&apos;t see it again):</p>
            <code className="text-xs bg-green-100 p-2 rounded block break-all select-all">{newKey}</code>
          </div>
        )}
        <div className="space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name (e.g. My AI Agent)"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
            <div className="flex flex-wrap gap-2">
              {["read:search", "read:profiles", "write:messages.draft"].map((scope) => (
                <button key={scope} type="button" onClick={() => toggleScope(scope)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    scopes.includes(scope)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>
          <button onClick={createKey} disabled={creating || !name.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {creating ? "Creating..." : "Create Key"}
          </button>
        </div>
      </div>

      {/* Existing Keys */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="font-semibold text-lg p-6 pb-4">Your Keys</h2>
        {keys.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No API keys yet</div>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{key.name}</span>
                  <code className="text-xs text-gray-400">{key.keyPrefix}...</code>
                  {!key.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Revoked</span>
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  {key.scopes.map((s) => (
                    <span key={s} className="text-xs text-gray-400">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              {key.isActive && (
                <button onClick={() => revokeKey(key.id)} className="text-sm text-red-500 hover:text-red-700">Revoke</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
