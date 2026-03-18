"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "admin";

  return (
    <nav className="bg-[var(--crimson)] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight flex items-center gap-2">
          <span className="text-2xl">🐘</span>
          <span>BamaAdvisor</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/chat" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            Chat
          </Link>
          <Link href="/opportunities" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            Opportunities
          </Link>
          <Link href="/initiatives" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            Initiatives
          </Link>
          <Link href="/search" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
            Browse
          </Link>

          {status === "loading" ? (
            <div className="w-20 h-8 bg-white/10 rounded animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin" className="text-amber-200 hover:text-amber-100 text-sm font-medium transition-colors">
                  Admin
                </Link>
              )}
              <Link href="/settings" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                Settings
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-white/80 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/auth/register" className="text-sm bg-white text-[var(--crimson)] px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white text-2xl">
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--crimson-dark)] border-t border-white/10 px-4 py-3 space-y-2">
          <Link href="/chat" onClick={() => setMobileOpen(false)} className="block text-sm text-white/90 py-1">Chat</Link>
          <Link href="/opportunities" onClick={() => setMobileOpen(false)} className="block text-sm text-white/90 py-1">Opportunities</Link>
          <Link href="/initiatives" onClick={() => setMobileOpen(false)} className="block text-sm text-white/90 py-1">Initiatives</Link>
          <Link href="/search" onClick={() => setMobileOpen(false)} className="block text-sm text-white/90 py-1">Browse</Link>
          {session?.user ? (
            <>
              {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="block text-sm text-amber-200 py-1">Admin</Link>}
              <Link href="/settings" onClick={() => setMobileOpen(false)} className="block text-sm text-white/90 py-1">Settings</Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="block text-sm text-white/70 py-1">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block text-sm text-white/80 py-1">Sign in</Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block text-sm text-white/80 py-1">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
