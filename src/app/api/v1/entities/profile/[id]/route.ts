// PATCH /api/v1/entities/profile/[id] — update a profile in AgentNet

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkServiceKey(request: NextRequest) {
  const key = process.env.ENTITIES_API_KEY;
  if (!key) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${key}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkServiceKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Remove fields that shouldn't be directly updated
  delete body.id;
  delete body.userId;
  delete body.createdAt;

  if (body.deadline) body.deadline = new Date(body.deadline);

  const profile = await prisma.profile.update({
    where: { id },
    data: body,
  });

  return NextResponse.json({ id: profile.id, displayName: profile.displayName });
}
