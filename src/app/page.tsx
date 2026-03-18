"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const features = [
    {
      icon: "🎓",
      title: "Degree Planning",
      description: "Get personalized course sequences based on your major, interests, and graduation timeline.",
    },
    {
      icon: "🔬",
      title: "Research Matching",
      description: "Find professors and labs aligned with your interests. Get intro emails drafted for you.",
    },
    {
      icon: "💰",
      title: "Scholarship Finder",
      description: "Discover scholarships you qualify for based on your GPA, major, and background.",
    },
    {
      icon: "📄",
      title: "Resume & Career",
      description: "Upload your resume for personalized advice. Match with internships and career paths.",
    },
    {
      icon: "☀️",
      title: "Summer Planning",
      description: "Plan your summers strategically — internships, research, study abroad, or courses.",
    },
    {
      icon: "🤝",
      title: "Student Initiatives",
      description: "Find or start clubs, projects, and startups. Connect with peers who share your vision.",
    },
  ];

  const demoPrompts = [
    "What scholarships am I eligible for based on my GPA and major?",
    "Which professors do AI research and are looking for undergrad assistants?",
    "Review my resume and suggest improvements for software engineering internships",
    "Plan my next three semesters to graduate on time with a CS degree",
    "What should I do this summer to strengthen my grad school application?",
    "Find student initiatives I can join that involve machine learning",
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="bg-[var(--crimson)] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🐘</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            BamaAdvisor
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-3 font-light">
            Your AI Academic Advisor at The University of Alabama
          </p>
          <p className="text-base text-white/70 mb-10 max-w-2xl mx-auto">
            From your first semester to graduation — personalized guidance on courses, research,
            scholarships, career paths, and everything in between.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="bg-white text-[var(--crimson)] px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start a Conversation
            </Link>
            {!session?.user && (
              <Link
                href="/auth/register"
                className="border-2 border-white/50 text-white px-8 py-3 rounded-xl font-medium text-lg hover:bg-white/10 transition-colors"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            How BamaAdvisor Helps You Succeed
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Powered by AI with deep knowledge of UA&apos;s programs, faculty, and opportunities
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try it section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Try Asking...
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Click any prompt to start chatting with your advisor
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {demoPrompts.map((prompt) => (
              <Link
                key={prompt}
                href={`/chat?prompt=${encodeURIComponent(prompt)}`}
                className="text-left text-sm px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-[var(--crimson)] hover:shadow-sm transition-all text-gray-700 hover:text-[var(--crimson)]"
              >
                &ldquo;{prompt}&rdquo;
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upload CTA */}
      <section className="py-16 px-4 bg-[var(--cream-light)]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Build Your Student Portfolio
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Upload your resume, transcript, or personal essay. BamaAdvisor uses them to give
            you hyper-personalized advice and match you with the right opportunities.
          </p>
          <Link
            href={session?.user ? "/settings" : "/auth/register"}
            className="inline-block btn-crimson px-8 py-3 rounded-xl font-semibold text-lg shadow-md"
          >
            {session?.user ? "Upload Documents" : "Get Started"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐘</span>
            <span className="text-white font-semibold">BamaAdvisor</span>
          </div>
          <p className="text-sm">
            Built for UA students. Roll Tide!
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/chat" className="hover:text-white transition-colors">Chat</Link>
            <Link href="/opportunities" className="hover:text-white transition-colors">Opportunities</Link>
            <Link href="/search" className="hover:text-white transition-colors">Browse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
