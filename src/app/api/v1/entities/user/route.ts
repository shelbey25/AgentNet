// POST /api/v1/entities/user — create a user in AgentNet (service-to-service)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

function checkServiceKey(request: NextRequest) {
  const key = process.env.ENTITIES_API_KEY;
  if (!key) return true; // No key configured = open (dev mode)
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${key}`;
}

export async function POST(request: NextRequest) {
  if (!checkServiceKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, name, password, role } = body;

  if (!email || !name || !password) {
    return NextResponse.json({ error: "email, name, and password are required" }, { status: 400 });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ id: existing.id, existing: true }, { status: 200 });
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: role || "person" },
  });

  return NextResponse.json({ id: user.id, existing: false }, { status: 201 });
}
