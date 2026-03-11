import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkPublicRateLimit,
  rateLimited,
} from "@/lib/api-auth";

// GET /api/v1/profile/[id] — full profile with capabilities
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
      capabilities: { where: { isActive: true } },
      infoSections: { select: { section: true, subsection: true, title: true } },
    },
  });

  if (!profile || !profile.isPublic) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Group info sections
  const infoIndex: Record<string, string[]> = {};
  for (const s of profile.infoSections) {
    if (!infoIndex[s.section]) infoIndex[s.section] = [];
    if (s.subsection) infoIndex[s.section].push(s.subsection);
  }

  // Build required_fields from webhookSchema per capability
  const webhookSchema = profile.webhookSchema as Record<string, unknown> | null;
  const requiredFields: Record<string, unknown> = {};
  if (webhookSchema && typeof webhookSchema === "object") {
    for (const [eventType, schema] of Object.entries(webhookSchema)) {
      requiredFields[eventType] = schema;
    }
  }

  return NextResponse.json({
    id: profile.id,
    type: profile.type,
    name: profile.displayName,
    bio: profile.bio,
    location: profile.location,
    category: profile.category,
    status: profile.status,
    integration_type: profile.integrationType,
    payment_mode: profile.paymentMode,
    // Campus fields
    ...(profile.campusRole && { campus_role: profile.campusRole }),
    ...(profile.department && { department: profile.department }),
    ...(profile.title && { title: profile.title }),
    ...(profile.tags && profile.tags.length > 0 && { tags: profile.tags }),
    ...(profile.officeLocation && { office_location: profile.officeLocation }),
    ...(profile.officeHours && { office_hours: profile.officeHours }),
    // Opportunity fields
    ...(profile.type === "opportunity" && {
      opportunity_type: profile.opportunityType,
      deadline: profile.deadline?.toISOString(),
      eligibility: profile.eligibility,
      apply_url: profile.applyUrl,
      compensation: profile.compensation,
    }),
    // Claim status
    ...(profile.isClaimable && { is_claimable: true }),
    capabilities: profile.capabilities.map((c) => c.type),
    skills: profile.skills.map((s) => ({
      name: s.name,
      category: s.category,
    })),
    services: profile.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.price,
      duration: s.duration,
      bookable: s.isBookable,
    })),
    ...(["business", "site"].includes(profile.type) && {
      phone: profile.phone,
      website: profile.website,
      address: profile.address,
      hours: profile.hours,
    }),
    available_sections: Object.entries(infoIndex).map(([section, subs]) => ({
      section,
      path: `/api/v1/info/${profile.id}/${section}`,
      subsections: subs,
    })),
    actions: {
      order: profile.capabilities.some((c) => c.type === "ordering")
        ? `/api/v1/order` : null,
      book: profile.capabilities.some((c) => c.type === "booking")
        ? `/api/v1/book` : null,
      availability: profile.capabilities.some((c) => c.type === "availability")
        ? `/api/v1/availability?business_id=${profile.id}` : null,
      quote: profile.capabilities.some((c) => c.type === "quotes")
        ? `/api/v1/get_quote` : null,
      request_service: profile.capabilities.some((c) => c.type === "service_requests")
        ? `/api/v1/request_service` : null,
      message: `/api/v1/message`,
    },
    ...(Object.keys(requiredFields).length > 0 && { required_fields: requiredFields }),
  });
}
