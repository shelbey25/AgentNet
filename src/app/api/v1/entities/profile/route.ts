// POST /api/v1/entities/profile — create a profile in AgentNet (service-to-service)

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
  const {
    userId, type, displayName, bio, department, category, campusRole,
    opportunityType, tags, eligibility, compensation, deadline, applyUrl,
    location,
  } = body;

  if (!displayName) {
    return NextResponse.json({ error: "displayName is required" }, { status: 400 });
  }

  const profile = await prisma.profile.create({
    data: {
      userId: userId || undefined,
      type: type || "opportunity",
      displayName,
      bio: bio || null,
      department: department || null,
      category: category || null,
      campusRole: campusRole || null,
      opportunityType: opportunityType || null,
      tags: tags || [],
      eligibility: eligibility || null,
      compensation: compensation || null,
      deadline: deadline ? new Date(deadline) : null,
      applyUrl: applyUrl || null,
      location: location || "Tuscaloosa, AL",
    },
  });

  return NextResponse.json({ id: profile.id, displayName: profile.displayName }, { status: 201 });
}
