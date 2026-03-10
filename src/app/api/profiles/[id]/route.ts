import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

// GET /api/profiles/[id] — public profile view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      skills: true,
      services: true,
      user: { select: { name: true, id: true } },
    },
  });

  if (!profile || !profile.isPublic) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: profile.id,
    userId: profile.user.id,
    displayName: profile.displayName,
    type: profile.type,
    bio: profile.bio,
    location: profile.location,
    status: profile.status,
    avatarUrl: profile.avatarUrl,
    skills: profile.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
    })),
    services: profile.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.price,
    })),
    // Business/site fields
    ...((profile.type === "business" || profile.type === "site") && {
      phone: profile.phone,
      website: profile.website,
      address: profile.address,
      hours: profile.hours,
    }),
    // Campus person fields
    ...(profile.campusRole && { campus_role: profile.campusRole }),
    ...(profile.department && { department: profile.department }),
    ...(profile.title && { title: profile.title }),
    ...(profile.officeLocation && { office_location: profile.officeLocation }),
    ...(profile.officeHours && { office_hours: profile.officeHours }),
    ...(profile.tags && profile.tags.length > 0 && { tags: profile.tags }),
    // Opportunity fields
    ...(profile.type === "opportunity" && {
      opportunity_type: profile.opportunityType,
      deadline: profile.deadline,
      eligibility: profile.eligibility,
      apply_url: profile.applyUrl,
      compensation: profile.compensation,
    }),
    createdAt: profile.createdAt,
  });
}
