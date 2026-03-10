"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Profile {
  id: string;
  displayName: string;
  type: string;
  bio: string | null;
  location: string;
  status: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  hours: string | null;
  skills: { id: string; name: string; category: string | null }[];
  services: { id: string; name: string; description: string | null; category: string | null; price: string | null }[];
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  profile: Profile | null;
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");

  // Skills
  const [newSkill, setNewSkill] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");

  // Services
  const [newService, setNewService] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/me")
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          if (data.profile) {
            setDisplayName(data.profile.displayName || "");
            setBio(data.profile.bio || "");
            setLocation(data.profile.location || "");
            setProfileStatus(data.profile.status || "available");
            setPhone(data.profile.phone || "");
            setWebsite(data.profile.website || "");
            setAddress(data.profile.address || "");
            setHours(data.profile.hours || "");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName, bio, location, status: profileStatus,
          phone, website, address, hours,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser((prev) => prev ? { ...prev, profile: updated } : prev);
        setMessage("Profile saved!");
      }
    } catch {
      setMessage("Error saving profile");
    }
    setSaving(false);
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    const res = await fetch("/api/me/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSkill, category: newSkillCategory || null }),
    });
    if (res.ok) {
      const skill = await res.json();
      setUser((prev) => {
        if (!prev?.profile) return prev;
        return { ...prev, profile: { ...prev.profile, skills: [...prev.profile.skills, skill] } };
      });
      setNewSkill("");
      setNewSkillCategory("");
    }
  };

  const removeSkill = async (skillId: string) => {
    await fetch(`/api/me/skills/${skillId}`, { method: "DELETE" });
    setUser((prev) => {
      if (!prev?.profile) return prev;
      return { ...prev, profile: { ...prev.profile, skills: prev.profile.skills.filter((s) => s.id !== skillId) } };
    });
  };

  const addService = async () => {
    if (!newService.trim()) return;
    const res = await fetch("/api/me/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newService,
        description: newServiceDesc || null,
        price: newServicePrice || null,
        category: newServiceCategory || null,
      }),
    });
    if (res.ok) {
      const svc = await res.json();
      setUser((prev) => {
        if (!prev?.profile) return prev;
        return { ...prev, profile: { ...prev.profile, services: [...prev.profile.services, svc] } };
      });
      setNewService("");
      setNewServiceDesc("");
      setNewServicePrice("");
      setNewServiceCategory("");
    }
  };

  const removeService = async (svcId: string) => {
    await fetch(`/api/me/services/${svcId}`, { method: "DELETE" });
    setUser((prev) => {
      if (!prev?.profile) return prev;
      return { ...prev, profile: { ...prev.profile, services: prev.profile.services.filter((s) => s.id !== svcId) } };
    });
  };

  if (sessionStatus === "loading" || loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/dashboard/messages" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            Messages
          </Link>
          <Link href="/dashboard/keys" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            API Keys
          </Link>
          {user.profile && (
            <Link href={`/profile/${user.profile.id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              View Public Profile
            </Link>
          )}
        </div>
      </div>

      {/* Profile Edit */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Edit Profile</h2>
        {message && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 mb-4">
            {message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={profileStatus} onChange={(e) => setProfileStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300">
              <option value="available">Available</option>
              <option value="looking_for_work">Looking for work</option>
              <option value="hiring">Hiring</option>
              <option value="busy">Busy</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell people about yourself..." />
          </div>

          {/* Business fields */}
          {user.role === "business" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input type="text" value={hours} onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mon-Fri 9am-5pm" />
              </div>
            </>
          )}
        </div>
        <button onClick={saveProfile} disabled={saving}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Skills</h2>
        {user.profile?.skills && user.profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {user.profile.skills.map((skill) => (
              <span key={skill.id} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                {skill.name}
                <button onClick={() => removeSkill(skill.id)} className="ml-1 text-indigo-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skill name"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)} placeholder="Category (optional)"
            className="w-40 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={addSkill} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Add</button>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Services</h2>
        {user.profile?.services && user.profile.services.length > 0 && (
          <div className="space-y-3 mb-4">
            {user.profile.services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">{svc.name}</span>
                  {svc.price && <span className="text-emerald-600 ml-2">{svc.price}</span>}
                  {svc.description && <p className="text-gray-500 mt-1">{svc.description}</p>}
                </div>
                <button onClick={() => removeService(svc.id)} className="text-gray-400 hover:text-red-500 text-sm">Remove</button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Service name"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} placeholder="Price (e.g. $20/hr)"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" value={newServiceDesc} onChange={(e) => setNewServiceDesc(e.target.value)} placeholder="Description (optional)"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" value={newServiceCategory} onChange={(e) => setNewServiceCategory(e.target.value)} placeholder="Category (optional)"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={addService} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Add Service</button>
      </div>
    </div>
  );
}
