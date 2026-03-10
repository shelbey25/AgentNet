// GET /api/v1/browse/[entityId]/[[...path]]
// Dynamic hierarchical browse endpoint — drill into any entity's structured data
// /browse/:id           → entity overview + navigable sections
// /browse/:id/menu      → section overview or data + sub-sections
// /browse/:id/menu/grill → leaf data
//
// Key design: every response includes navigation hints so the agent
// knows what it can drill into next, keeping context window targeted.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string; path?: string[] }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { entityId, path = [] } = await params;

  // Fetch the entity
  const profile = await prisma.profile.findUnique({
    where: { id: entityId },
    select: {
      id: true,
      displayName: true,
      type: true,
      bio: true,
      category: true,
      campusRole: true,
      department: true,
      title: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  // ── Level 0: Entity overview + available sections ──
  if (path.length === 0) {
    const sections = await prisma.infoSection.findMany({
      where: { profileId: entityId },
      select: { section: true, subsection: true, title: true },
      orderBy: [{ section: "asc" }, { subsection: "asc" }],
    });

    // Group into a tree: section → subsection[]
    const tree = new Map<string, { title: string | null; subsections: string[] }>();
    for (const s of sections) {
      if (!tree.has(s.section)) {
        tree.set(s.section, { title: null, subsections: [] });
      }
      const node = tree.get(s.section)!;
      if (s.subsection) {
        node.subsections.push(s.subsection);
      } else {
        node.title = s.title;
      }
    }

    return NextResponse.json({
      entity_id: profile.id,
      entity_name: profile.displayName,
      entity_type: profile.type,
      bio: profile.bio,
      current_path: `/api/v1/browse/${entityId}`,
      children: Array.from(tree.entries()).map(([section, info]) => ({
        name: section,
        ...(info.title && { title: info.title }),
        path: `/api/v1/browse/${entityId}/${section}`,
        has_children: info.subsections.length > 0,
        ...(info.subsections.length > 0 && {
          child_count: info.subsections.length,
          children_preview: info.subsections.slice(0, 5),
        }),
      })),
      hint: tree.size > 0
        ? `This entity has ${tree.size} browsable section(s). Use the path URLs to drill in.`
        : "This entity has no structured data sections.",
    });
  }

  // ── Level 1: Section view ──
  if (path.length === 1) {
    const section = path[0];

    // Get the root record for this section (subsection = null)
    const rootRecord = await prisma.infoSection.findFirst({
      where: { profileId: entityId, section, subsection: null },
    });

    // Get all subsections
    const subsections = await prisma.infoSection.findMany({
      where: { profileId: entityId, section, NOT: { subsection: null } },
      select: { subsection: true, title: true },
      orderBy: { subsection: "asc" },
    });

    if (!rootRecord && subsections.length === 0) {
      // Section doesn't exist — return available sections
      const available = await prisma.infoSection.findMany({
        where: { profileId: entityId },
        select: { section: true },
        distinct: ["section"],
      });
      return NextResponse.json(
        {
          error: `Section "${section}" not found`,
          available_sections: available.map((s) => ({
            name: s.section,
            path: `/api/v1/browse/${entityId}/${s.section}`,
          })),
        },
        { status: 404 }
      );
    }

    // Has subsections → return navigation + optional summary data
    if (subsections.length > 0) {
      return NextResponse.json({
        entity_id: profile.id,
        entity_name: profile.displayName,
        section,
        ...(rootRecord?.title && { title: rootRecord.title }),
        current_path: `/api/v1/browse/${entityId}/${section}`,
        parent_path: `/api/v1/browse/${entityId}`,
        // Include summary data if the root record has it
        ...(rootRecord?.data && { summary: rootRecord.data }),
        children: subsections.map((s) => ({
          name: s.subsection,
          ...(s.title && { title: s.title }),
          path: `/api/v1/browse/${entityId}/${section}/${s.subsection}`,
        })),
        hint: `"${section}" has ${subsections.length} sub-section(s). Pick one to see details.`,
      });
    }

    // No subsections → this is a leaf, return its data
    return NextResponse.json({
      entity_id: profile.id,
      entity_name: profile.displayName,
      section,
      title: rootRecord!.title,
      current_path: `/api/v1/browse/${entityId}/${section}`,
      parent_path: `/api/v1/browse/${entityId}`,
      data: rootRecord!.data,
      updated_at: rootRecord!.updatedAt.toISOString(),
    });
  }

  // ── Level 2+: Subsection view ──
  const section = path[0];
  const subsection = path.slice(1).join("/"); // support multi-level paths

  const record = await prisma.infoSection.findFirst({
    where: { profileId: entityId, section, subsection },
  });

  if (!record) {
    // Not found — show siblings
    const siblings = await prisma.infoSection.findMany({
      where: { profileId: entityId, section, NOT: { subsection: null } },
      select: { subsection: true, title: true },
    });
    return NextResponse.json(
      {
        error: `"${subsection}" not found under "${section}"`,
        available: siblings.map((s) => ({
          name: s.subsection,
          ...(s.title && { title: s.title }),
          path: `/api/v1/browse/${entityId}/${section}/${s.subsection}`,
        })),
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    entity_id: profile.id,
    entity_name: profile.displayName,
    section,
    subsection,
    title: record.title,
    current_path: `/api/v1/browse/${entityId}/${section}/${subsection}`,
    parent_path: `/api/v1/browse/${entityId}/${section}`,
    data: record.data,
    updated_at: record.updatedAt.toISOString(),
  });
}
