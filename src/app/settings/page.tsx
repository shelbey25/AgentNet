"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Portfolio {
  resumeSkills: string[];
  resumeExperience: { title: string; company: string; dates: string }[] | null;
  courseHistory: { code: string; name: string; grade: string }[] | null;
  cumulativeGPA: number | null;
  creditsCompleted: number | null;
  careerGoals: string[];
  interests: string[];
  strengths: string[];
  matchTags: string[];
  updatedAt: string;
}

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Text input state for each document type
  const [resumeText, setResumeText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [essayText, setEssayText] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/v1/portfolio")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data) setPortfolio(data.portfolio); })
        .finally(() => setLoading(false));
    }
  }, [session]);

  const uploadDocument = async (type: "resume" | "transcript" | "essay") => {
    const textMap = { resume: resumeText, transcript: transcriptText, essay: essayText };
    const text = textMap[type].trim();
    if (!text) {
      setMessage({ type: "error", text: "Please paste your document content first." });
      return;
    }

    setUploading(type);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/upload/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setMessage({ type: "success", text: data.message || `${type} uploaded and processed!` });

      // Refresh portfolio
      const portfolioRes = await fetch("/api/v1/portfolio");
      if (portfolioRes.ok) {
        const pData = await portfolioRes.json();
        setPortfolio(pData.portfolio);
      }

      // Clear the text input
      if (type === "resume") setResumeText("");
      if (type === "transcript") setTranscriptText("");
      if (type === "essay") setEssayText("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(null);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Student Settings</h1>
      <p className="text-gray-500 mb-6">
        Upload documents to build your personality portfolio. BamaAdvisor uses this to give you personalized guidance.
      </p>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Portfolio Summary */}
      {portfolio && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📊</span> Your Portfolio Summary
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {portfolio.cumulativeGPA && (
              <div><span className="text-gray-500">GPA:</span> <span className="font-medium">{portfolio.cumulativeGPA}</span></div>
            )}
            {portfolio.creditsCompleted && (
              <div><span className="text-gray-500">Credits:</span> <span className="font-medium">{portfolio.creditsCompleted}</span></div>
            )}
            {portfolio.resumeSkills.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Skills:</span>{" "}
                <span className="font-medium">{portfolio.resumeSkills.join(", ")}</span>
              </div>
            )}
            {portfolio.careerGoals.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Career Goals:</span>{" "}
                <span className="font-medium">{portfolio.careerGoals.join(", ")}</span>
              </div>
            )}
            {portfolio.interests.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Interests:</span>{" "}
                <span className="font-medium">{portfolio.interests.join(", ")}</span>
              </div>
            )}
            {portfolio.matchTags.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Match Tags:</span>{" "}
                <div className="flex flex-wrap gap-1 mt-1">
                  {portfolio.matchTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-red-50 text-[var(--crimson)] rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {portfolio.courseHistory && Array.isArray(portfolio.courseHistory) && portfolio.courseHistory.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Courses on file:</span>{" "}
                <span className="font-medium">{portfolio.courseHistory.length} courses</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Sections */}
      <div className="space-y-6">
        {/* Resume */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>📄</span> Resume
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Paste your resume text. We&apos;ll extract skills, experience, education, and projects.
          </p>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent resize-y"
          />
          <button
            onClick={() => uploadDocument("resume")}
            disabled={uploading === "resume" || !resumeText.trim()}
            className="mt-3 btn-crimson px-6 py-2 rounded-lg text-sm font-medium"
          >
            {uploading === "resume" ? "Processing..." : "Upload Resume"}
          </button>
        </div>

        {/* Transcript */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>📋</span> Transcript
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Paste your transcript or course history. We&apos;ll extract courses, grades, and GPA.
          </p>
          <textarea
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Paste your transcript content here (courses, grades, GPA)..."
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent resize-y"
          />
          <button
            onClick={() => uploadDocument("transcript")}
            disabled={uploading === "transcript" || !transcriptText.trim()}
            className="mt-3 btn-crimson px-6 py-2 rounded-lg text-sm font-medium"
          >
            {uploading === "transcript" ? "Processing..." : "Upload Transcript"}
          </button>
        </div>

        {/* Essay */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <span>✏️</span> Personal Essay
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Share your goals, interests, and aspirations. This helps us understand what drives you.
          </p>
          <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Write about your career goals, interests, what you want to get out of your time at UA..."
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent resize-y"
          />
          <button
            onClick={() => uploadDocument("essay")}
            disabled={uploading === "essay" || !essayText.trim()}
            className="mt-3 btn-crimson px-6 py-2 rounded-lg text-sm font-medium"
          >
            {uploading === "essay" ? "Processing..." : "Upload Essay"}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        All documents are optional. Upload whatever you&apos;re comfortable sharing.
      </p>
    </div>
  );
}
