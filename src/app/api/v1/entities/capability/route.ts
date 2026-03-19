// POST /api/v1/entities/capability — add a capability to a profile

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
  const { profileId, type, webhookUrl, requiredFields } = body;

  if (!profileId || !type) {
    return NextResponse.json({ error: "profileId and type are required" }, { status: 400 });
  }

  const capability = await prisma.capability.create({
    data: { profileId, type },
  });

  // If webhook info provided, update the profile
  if (webhookUrl) {
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        webhookUrl,
        webhookEnabled: true,
        enabledWebhookEvents: [type],
        webhookSchema: requiredFields ? JSON.stringify(requiredFields) : undefined,
      },
    });
  }

  return NextResponse.json({ id: capability.id }, { status: 201 });
}
