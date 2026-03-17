// GET /api/v1/browse/[entityId]/[[...path]]
// Dynamic hierarchical browse endpoint — drill into any entity's structured data
// /browse/:id           → entity overview + navigable sections
// /browse/:id/menu      → section overview or data + sub-sections
// /browse/:id/menu/grill → leaf data
//
// TIERED DEPTH (L0 / L1 / L2):
//   ?depth=L0  — Section names + one-line abstracts only (~100 tokens). Cheapest.
//   ?depth=L1  — Full section with ALL subsection data merged into one response.
//                Use this to get an entire menu/service list/schedule in ONE call.
//   ?depth=L2  — Individual subsection leaf data (default for subsection paths).
//
// The AI should default to L1 for section-level browsing to avoid
// sequential drilling, and only use L2 for targeted detail.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string; path?: string[] }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { entityId, path = [] } = await params;
  const { searchParams } = new URL(request.url);
  const depth = (searchParams.get("depth") || "").toUpperCase(); // L0, L1, L2

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
      select: { section: true, subsection: true, title: true, data: true },
      orderBy: [{ section: "asc" }, { subsection: "asc" }],
    });

    // Group into a tree: section → { title, subsections[], rootData }
    const tree = new Map<string, { title: string | null; subsections: string[]; rootData: unknown }>();
    for (const s of sections) {
      if (!tree.has(s.section)) {
        tree.set(s.section, { title: null, subsections: [], rootData: null });
      }
      const node = tree.get(s.section)!;
      if (s.subsection) {
        node.subsections.push(s.subsection);
      } else {
        node.title = s.title;
        node.rootData = s.data;
      }
    }

    // Generate L0 abstracts for each section
    const children = Array.from(tree.entries()).map(([section, info]) => {
      const abstract = generateAbstract(section, info.rootData, info.subsections);
      return {
        name: section,
        ...(info.title && { title: info.title }),
        abstract,
        path: `/api/v1/browse/${entityId}/${section}`,
        path_L1: `/api/v1/browse/${entityId}/${section}?depth=L1`,
        has_children: info.subsections.length > 0,
        ...(info.subsections.length > 0 && {
          child_count: info.subsections.length,
          children_preview: info.subsections.slice(0, 5),
        }),
      };
    });

    return NextResponse.json({
      entity_id: profile.id,
      entity_name: profile.displayName,
      entity_type: profile.type,
      bio: profile.bio,
      current_path: `/api/v1/browse/${entityId}`,
      depth: "L0",
      children,
      hint: tree.size > 0
        ? `This entity has ${tree.size} browsable section(s). Use ?depth=L1 on any section path to get ALL data in one call. Only drill to individual subsections (L2) if you need a specific item.`
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
      select: { subsection: true, title: true, data: true },
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
            path_L1: `/api/v1/browse/${entityId}/${s.section}?depth=L1`,
          })),
        },
        { status: 404 }
      );
    }

    // ── L1: Aggregate ALL subsection data into one response ──
    if (depth === "L1" || depth === "L1") {
      const aggregated: Record<string, { title: string | null; data: unknown }> = {};
      for (const sub of subsections) {
        aggregated[sub.subsection!] = { title: sub.title, data: sub.data };
      }

      return NextResponse.json({
        entity_id: profile.id,
        entity_name: profile.displayName,
        section,
        ...(rootRecord?.title && { title: rootRecord.title }),
        current_path: `/api/v1/browse/${entityId}/${section}?depth=L1`,
        parent_path: `/api/v1/browse/${entityId}`,
        depth: "L1",
        // Include root summary if it exists
        ...(rootRecord?.data && { summary: rootRecord.data }),
        // ALL subsection data in one shot
        subsections: aggregated,
        subsection_count: subsections.length,
        hint: `Full L1 overview of "${section}" with ${subsections.length} subsection(s). All data included — no further drilling needed unless you want to update or isolate one subsection.`,
      });
    }

    // ── L0: Just abstracts for subsections ──
    if (depth === "L0") {
      return NextResponse.json({
        entity_id: profile.id,
        entity_name: profile.displayName,
        section,
        ...(rootRecord?.title && { title: rootRecord.title }),
        current_path: `/api/v1/browse/${entityId}/${section}?depth=L0`,
        parent_path: `/api/v1/browse/${entityId}`,
        depth: "L0",
        ...(rootRecord?.data && { summary: rootRecord.data }),
        children: subsections.map((s) => ({
          name: s.subsection,
          ...(s.title && { title: s.title }),
          abstract: generateAbstract(s.subsection || section, s.data, []),
          path: `/api/v1/browse/${entityId}/${section}/${s.subsection}`,
        })),
        hint: `L0 abstracts for "${section}". Use ?depth=L1 on the section path to get all data at once.`,
      });
    }

    // ── Default (no depth specified): existing behavior ──
    // Has subsections → return navigation + optional summary data
    if (subsections.length > 0) {
      return NextResponse.json({
        entity_id: profile.id,
        entity_name: profile.displayName,
        section,
        ...(rootRecord?.title && { title: rootRecord.title }),
        current_path: `/api/v1/browse/${entityId}/${section}`,
        parent_path: `/api/v1/browse/${entityId}`,
        depth: "L2_nav",
        // Include summary data if the root record has it
        ...(rootRecord?.data && { summary: rootRecord.data }),
        children: subsections.map((s) => ({
          name: s.subsection,
          ...(s.title && { title: s.title }),
          abstract: generateAbstract(s.subsection || section, s.data, []),
          path: `/api/v1/browse/${entityId}/${section}/${s.subsection}`,
        })),
        tip: `💡 Use ?depth=L1 to get ALL subsection data in one call instead of drilling into each one.`,
        hint: `"${section}" has ${subsections.length} sub-section(s). RECOMMENDED: add ?depth=L1 to your path to get everything at once.`,
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
      depth: "L2",
      data: rootRecord!.data,
      updated_at: rootRecord!.updatedAt.toISOString(),
    });
  }

  // ── Level 2+: Subsection view (leaf data) ──
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
        tip: `💡 Use /api/v1/browse/${entityId}/${section}?depth=L1 to get ALL subsections at once.`,
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
    depth: "L2",
    data: record.data,
    updated_at: record.updatedAt.toISOString(),
  });
}

// ── L0 Abstract Generator ──
// Generates a one-sentence summary from section data for quick relevance checks
function generateAbstract(sectionName: string, data: unknown, subsections: string[]): string {
  const d = data as Record<string, unknown> | null;

  // Menu section — summarize stations
  if (sectionName === "menu" && d) {
    const stations = (d as Record<string, unknown>).stations as string[] | undefined;
    if (stations) return `Menu with ${stations.length} stations: ${stations.join(", ")}`;
  }

  // Services section — summarize categories
  if (sectionName === "services" && d) {
    const categories = (d as Record<string, unknown>).categories as string[] | undefined;
    if (categories) return `Services across ${categories.length} categories: ${categories.join(", ")}`;
    const overview = (d as Record<string, unknown>).overview as string | undefined;
    if (overview) return overview;
  }

  // Hours section
  if (sectionName === "hours" && d) {
    const hours = (d as Record<string, unknown>).hours as Array<{ day: string; open?: string; close?: string }> | undefined;
    if (hours && hours.length > 0) {
      const firstDay = hours[0];
      return `Hours: ${firstDay.day} ${firstDay.open || ""}–${firstDay.close || ""} (+ ${hours.length - 1} more)`;
    }
  }

  // Subsection with items — count them
  if (d && (d as Record<string, unknown>).items) {
    const items = (d as Record<string, unknown>).items as unknown[];
    return `${items.length} items available`;
  }

  // Courses section
  if (sectionName === "courses" && d) {
    const courses = (d as Record<string, unknown>).courses as unknown[] | undefined;
    if (courses) return `${courses.length} courses currently taught`;
  }

  // Research section
  if (sectionName === "research" && d) {
    const areas = (d as Record<string, unknown>).areas as string[] | undefined;
    if (areas) return `Research areas: ${areas.join(", ")}`;
  }

  // Office hours section
  if (sectionName === "office_hours" && d) {
    const schedule = (d as Record<string, unknown>).schedule as Array<{ day: string }> | undefined;
    if (schedule) return `Office hours on ${schedule.map(s => s.day).join(", ")}`;
  }

  // Policies section
  if (sectionName === "policies") {
    return "Policies, cancellation rules, and other terms";
  }

  // Generic fallback
  if (subsections.length > 0) {
    return `${subsections.length} subsections: ${subsections.slice(0, 4).join(", ")}${subsections.length > 4 ? "..." : ""}`;
  }

  return `${sectionName} data available`;
}
