// GET /api/v1/info/[businessId]/[...path]
// Indexable info system — businesses expose structured sections
// /info/:id/menu, /info/:id/services, /info/:id/hours, etc.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; path: string[] }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { businessId, path } = await params;
  const section = path?.[0];
  const subsection = path?.[1] || null;

  // If no section specified, return index of available sections
  if (!section) {
    const sections = await prisma.infoSection.findMany({
      where: { profileId: businessId },
      select: { section: true, subsection: true, title: true, updatedAt: true },
      orderBy: { section: "asc" },
    });

    const profile = await prisma.profile.findUnique({
      where: { id: businessId },
      select: { displayName: true, type: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Group sections
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

  // Find the specific section
  const info = await prisma.infoSection.findFirst({
    where: {
      profileId: businessId,
      section,
      subsection: subsection,
    },
  });

  if (!info) {
    // Try without subsection filter, to give helpful "available subsections" response
    if (subsection) {
      const available = await prisma.infoSection.findMany({
        where: { profileId: businessId, section },
        select: { subsection: true },
      });

      return NextResponse.json(
        {
          error: `Subsection "${subsection}" not found under "${section}"`,
          available_subsections: available
            .filter((a) => a.subsection)
            .map((a) => a.subsection),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: `Section "${section}" not found for this business` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    business_id: businessId,
    section: info.section,
    subsection: info.subsection,
    title: info.title,
    updated_at: info.updatedAt.toISOString(),
    ...(info.data as Record<string, unknown>),
  });
}
