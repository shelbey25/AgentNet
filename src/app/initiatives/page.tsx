"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Initiative {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  lookingFor: string[];
  contactEmail: string | null;
  website: string | null;
  isActive: boolean;
  user: { name: string };
  createdAt: string;
}

export default function InitiativesPage() {
  const { data: session } = useSession();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("project");
  const [tags, setTags] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/v1/initiatives")
      .then((r) => r.json())
      .then((d) => setInitiatives(d.initiatives || []))
      .finally(() => setLoading(false));
  }, []);

  const createInitiative = async () => {
    if (!title.trim() || !description.trim()) {
      setMessage({ type: "error", text: "Title and description are required." });
      return;
    }
    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          lookingFor: lookingFor.split(",").map((t) => t.trim()).filter(Boolean),
          contactEmail: contactEmail.trim() || undefined,
          website: website.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create initiative");

      const data = await res.json();
      setInitiatives([data.initiative, ...initiatives]);
      setMessage({ type: "success", text: "Initiative created!" });
      setShowCreate(false);
      setTitle(""); setDescription(""); setTags(""); setLookingFor("");
      setContactEmail(""); setWebsite("");
    } catch {
      setMessage({ type: "error", text: "Failed to create initiative." });
    } finally {
      setCreating(false);
    }
  };

  const categoryColors: Record<string, string> = {
    club: "bg-teal-100 text-teal-800",
    startup: "bg-purple-100 text-purple-800",
    project: "bg-blue-100 text-blue-800",
    research: "bg-amber-100 text-amber-800",
    volunteer: "bg-pink-100 text-pink-800",
  };

  const filtered = filter === "all" ? initiatives : initiatives.filter((i) => i.category === filter);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Student Initiatives</h1>
          <p className="text-gray-500">Projects, clubs, startups, and organizations led by UA students</p>
        </div>
        {session?.user && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-crimson px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showCreate ? "Cancel" : "+ New Initiative"}
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>{message.text}</div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Start a New Initiative</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                placeholder="e.g., AI Research Club"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                placeholder="What is this initiative about? What are you trying to accomplish?"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                >
                  <option value="club">Club</option>
                  <option value="startup">Startup</option>
                  <option value="project">Project</option>
                  <option value="research">Research</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Looking For (comma-separated)</label>
                <input
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                  placeholder="developers, designers, marketing"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                placeholder="ai, machine-learning, python"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                  placeholder="your-email@ua.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)]"
                  placeholder="https://..."
                />
              </div>
            </div>
            <button
              onClick={createInitiative}
              disabled={creating}
              className="btn-crimson px-6 py-2 rounded-lg text-sm font-medium"
            >
              {creating ? "Creating..." : "Create Initiative"}
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "club", "startup", "project", "research", "volunteer"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t ? "bg-[var(--crimson)] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Initiatives list */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((init) => (
            <div key={init.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{init.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[init.category] || "bg-gray-100 text-gray-600"}`}>
                  {init.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{init.description}</p>
              {init.lookingFor.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Looking for: </span>
                  {init.lookingFor.map((role) => (
                    <span key={role} className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mr-1">{role}</span>
                  ))}
                </div>
              )}
              {init.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {init.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                <span>by {init.user.name}</span>
                <div className="flex gap-3">
                  {init.contactEmail && <a href={`mailto:${init.contactEmail}`} className="text-[var(--crimson)] hover:underline">Email</a>}
                  {init.website && <a href={init.website} target="_blank" rel="noopener noreferrer" className="text-[var(--crimson)] hover:underline">Website</a>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">
            No initiatives found. {session?.user ? "Be the first to start one!" : "Sign in to create one."}
          </p>
        )}
      </div>
    </div>
  );
}
