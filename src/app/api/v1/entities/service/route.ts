// POST /api/v1/entities/service — add a service to a profile

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
  const { profileId, name, description, price, duration, category } = body;

  if (!profileId || !name) {
    return NextResponse.json({ error: "profileId and name are required" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      profileId,
      name,
      description: description || null,
      price: price ?? null,
      duration: duration ?? null,
      category: category || null,
    },
  });

  return NextResponse.json({ id: service.id }, { status: 201 });
}
