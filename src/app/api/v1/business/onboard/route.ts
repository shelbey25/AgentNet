// POST /api/v1/business/onboard — Register or update a business
// Businesses provide: profile info, capabilities, endpoints, info sections

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    description,
    location,
    phone,
    website,
    address,
    hours,
    capabilities,
    endpoints,
    info_sections,
  } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Get or create profile
  let profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile) {
    // Update existing profile
    profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        displayName: name,
        bio: description || profile.bio,
        location: location || profile.location,
        phone: phone || profile.phone,
        website: website || profile.website,
        address: address || profile.address,
        hours: hours || profile.hours,
        type: "business",
      },
    });
  } else {
    profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        type: "business",
        displayName: name,
        bio: description,
        location: location || "Tuscaloosa, AL",
        phone,
        website,
        address,
        hours,
      },
    });
  }

  // Update user role to business
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "business" },
  });

  // Set capabilities
  const validCapabilities = [
    "ordering",
    "booking",
    "messaging",
    "service_requests",
    "availability",
    "quotes",
  ];

  if (capabilities && Array.isArray(capabilities)) {
    // Remove old capabilities
    await prisma.capability.deleteMany({ where: { profileId: profile.id } });

    // Create new ones
    for (const cap of capabilities) {
      if (validCapabilities.includes(cap)) {
        await prisma.capability.create({
          data: {
            profileId: profile.id,
            type: cap,
            isActive: true,
          },
        });
      }
    }
  }

  // Set external endpoints
  if (endpoints && typeof endpoints === "object") {
    for (const [action, url] of Object.entries(endpoints)) {
      if (typeof url === "string") {
        await prisma.businessEndpoint.upsert({
          where: {
            profileId_action: { profileId: profile.id, action },
          },
          update: { url, isActive: true },
          create: {
            profileId: profile.id,
            action,
            url,
            method: "POST",
          },
        });
      }
    }
  }

  // Set info sections
  if (info_sections && typeof info_sections === "object") {
    for (const [section, data] of Object.entries(info_sections)) {
      if (typeof data === "object" && data !== null) {
        const jsonData = data as unknown as import("@prisma/client").Prisma.InputJsonValue;
        await prisma.infoSection.upsert({
          where: {
            profileId_section_subsection: {
              profileId: profile.id,
              section,
              subsection: "",
            },
          },
          update: {
            data: jsonData,
            cachedAt: new Date(),
          },
          create: {
            profileId: profile.id,
            section,
            subsection: null,
            title: section.charAt(0).toUpperCase() + section.slice(1),
            data: jsonData,
          },
        });
      }
    }
  }

  // Fetch final state
  const result = await prisma.profile.findUnique({
    where: { id: profile.id },
    include: {
      capabilities: true,
      businessEndpoints: true,
      infoSections: { select: { section: true, subsection: true } },
      services: true,
    },
  });

  return NextResponse.json(
    {
      business_id: profile.id,
      name: profile.displayName,
      capabilities: result?.capabilities.map((c) => c.type) || [],
      endpoints: result?.businessEndpoints.map((e) => ({
        action: e.action,
        url: e.url,
      })) || [],
      info_sections: [...new Set(result?.infoSections.map((i) => i.section) ?? [])],
      services: result?.services.length || 0,
    },
    { status: 200 }
  );
}
