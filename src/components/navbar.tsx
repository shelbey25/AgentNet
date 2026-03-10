"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          🐘 BamaAgent
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/search"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Browse
          </Link>
          <Link
            href="/docs"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            API
          </Link>

          {status === "loading" ? (
            <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/messages"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Messages
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
