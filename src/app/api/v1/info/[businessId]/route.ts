// GET /api/v1/info/[businessId]
// Returns index of all info sections for a business

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { businessId } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id: businessId },
    select: { displayName: true, type: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const sections = await prisma.infoSection.findMany({
    where: { profileId: businessId },
    select: { section: true, subsection: true, title: true, updatedAt: true },
    orderBy: { section: "asc" },
  });

  const index: Record<string, string[]> = {};
  for (const s of sections) {
    if (!index[s.section]) index[s.section] = [];
    if (s.subsection) index[s.section].push(s.subsection);
  }

  return NextResponse.json({
    business_id: businessId,
    name: profile.displayName,
    sections: Object.entries(index).map(([name, subsections]) => ({
      section: name,
      path: `/api/v1/info/${businessId}/${name}`,
      subsections: subsections.map((sub) => ({
        name: sub,
        path: `/api/v1/info/${businessId}/${name}/${sub}`,
      })),
    })),
  });
}
