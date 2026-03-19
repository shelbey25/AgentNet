// POST /api/v1/entities/info-section — create an info section
// PUT  /api/v1/entities/info-section — upsert an info section

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkServiceKey(request: NextRequest) {
  const key = process.env.ENTITIES_API_KEY;
  if (!key) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${key}`;
}

export async function POST(request: NextRequest) {
  if (!checkServiceKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { profileId, section, subsection, title, data: sectionData, body: sectionBody } = body;

  if (!profileId || !section) {
    return NextResponse.json({ error: "profileId and section are required" }, { status: 400 });
  }

  const infoSection = await prisma.infoSection.create({
    data: {
      profileId,
      section,
      subsection: subsection || null,
      title: title || null,
      data: sectionData || (sectionBody ? { body: sectionBody } : {}),
    },
  });

  return NextResponse.json({ id: infoSection.id }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!checkServiceKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { profileId, section, subsection, title, data: sectionData } = body;

  if (!profileId || !section) {
    return NextResponse.json({ error: "profileId and section are required" }, { status: 400 });
  }

  const infoSection = await prisma.infoSection.upsert({
    where: {
      profileId_section_subsection: {
        profileId,
        section,
        subsection: subsection || null,
      },
    },
    update: { data: sectionData || {}, title: title || undefined },
    create: {
      profileId,
      section,
      subsection: subsection || null,
      title: title || null,
      data: sectionData || {},
    },
  });

  return NextResponse.json({ id: infoSection.id });
}
