import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/me/services — add a service (businesses)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { name, description, category, price } = await request.json();
  if (!name) {
    return NextResponse.json(
      { error: "Service name is required" },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: {
      profileId: profile.id,
      name,
      description: description || null,
      category: category || null,
      price: price || null,
    },
  });

  return NextResponse.json(service, { status: 201 });
}

// GET /api/me/services — list own services
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const services = await prisma.service.findMany({
    where: { profileId: profile.id },
  });

  return NextResponse.json(services);
}
