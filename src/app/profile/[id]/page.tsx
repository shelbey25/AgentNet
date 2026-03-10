"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  type: string;
  bio: string | null;
  location: string;
  status: string;
  avatarUrl: string | null;
  phone?: string;
  website?: string;
  address?: string;
  hours?: string;
  campus_role?: string;
  department?: string;
  title?: string;
  office_location?: string;
  office_hours?: string;
  tags?: string[];
  opportunity_type?: string;
  deadline?: string;
  eligibility?: string;
  apply_url?: string;
  compensation?: string;
  skills: { id: string; name: string; category: string | null }[];
  services: { id: string; name: string; description: string | null; category: string | null; price: string | null }[];
}

export default function ProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setProfile)
      .catch(() => setError("Profile not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const statusLabels: Record<string, string> = {
    available: "Available",
    looking_for_work: "Looking for work",
    hiring: "Hiring",
    busy: "Busy",
    inactive: "Inactive",
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Profile not found</p>
        <Link href="/search" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{profile.type === "business" ? "🏪" : profile.type === "site" ? "🏢" : profile.type === "opportunity" ? "🎯" : "👤"}</span>
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
            </div>
            <span className={`inline-block text-xs px-3 py-1 rounded-full ${
              profile.status === "looking_for_work"
                ? "bg-green-100 text-green-700"
                : profile.status === "hiring"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {statusLabels[profile.status] || profile.status}
            </span>
          </div>
          {session?.user && session.user.id !== profile.userId && (
            <Link
              href={`/dashboard/messages?compose=${profile.userId}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Send Message
            </Link>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-4">📍 {profile.location}</p>

        {profile.bio && (
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        )}

        {/* Business/Site info */}
        {(profile.type === "business" || profile.type === "site") && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {profile.phone && (
              <div><span className="text-gray-400">Phone:</span> {profile.phone}</div>
            )}
            {profile.website && (
              <div><span className="text-gray-400">Website:</span> <a href={profile.website} className="text-indigo-600 hover:underline">{profile.website}</a></div>
            )}
            {profile.address && (
              <div><span className="text-gray-400">Address:</span> {profile.address}</div>
            )}
            {profile.hours && (
              <div><span className="text-gray-400">Hours:</span> {profile.hours}</div>
            )}
          </div>
        )}

        {/* Campus person info */}
        {profile.type === "person" && (profile.department || profile.title || profile.campus_role) && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {profile.title && (
              <div><span className="text-gray-400">Title:</span> {profile.title}</div>
            )}
            {profile.department && (
              <div><span className="text-gray-400">Department:</span> {profile.department}</div>
            )}
            {profile.campus_role && (
              <div><span className="text-gray-400">Role:</span> {profile.campus_role}</div>
            )}
            {profile.office_location && (
              <div><span className="text-gray-400">Office:</span> {profile.office_location}</div>
            )}
            {profile.office_hours && (
              <div className="col-span-2"><span className="text-gray-400">Office Hours:</span> {profile.office_hours}</div>
            )}
          </div>
        )}

        {/* Opportunity info */}
        {profile.type === "opportunity" && (
          <div className="mt-6 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {profile.opportunity_type && (
                <div><span className="text-gray-400">Type:</span> <span className="capitalize">{profile.opportunity_type}</span></div>
              )}
              {profile.department && (
                <div><span className="text-gray-400">Department:</span> {profile.department}</div>
              )}
              {profile.compensation && (
                <div><span className="text-gray-400">Compensation:</span> {profile.compensation}</div>
              )}
              {profile.deadline && (
                <div><span className="text-gray-400">Deadline:</span> {new Date(profile.deadline).toLocaleDateString()}</div>
              )}
            </div>
            {profile.eligibility && (
              <div><span className="text-gray-400">Eligibility:</span> {profile.eligibility}</div>
            )}
            {profile.apply_url && (
              <div>
                <a href={profile.apply_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Apply Now →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {profile.tags && profile.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.tags.map((tag, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span key={skill.id} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                {skill.name}
                {skill.category && <span className="text-indigo-400 ml-1">· {skill.category}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {profile.services.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Services</h2>
          <div className="space-y-3">
            {profile.services.map((svc) => (
              <div key={svc.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{svc.name}</h3>
                  {svc.description && <p className="text-gray-600 text-sm mt-1">{svc.description}</p>}
                  {svc.category && <span className="text-xs text-gray-400">{svc.category}</span>}
                </div>
                {svc.price && <span className="text-sm font-medium text-emerald-600">{svc.price}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/search" className="text-indigo-600 hover:underline text-sm">
        ← Back to search
      </Link>
    </div>
  );
}
