import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PUT /api/me/profile — update own profile
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    displayName,
    bio,
    location,
    avatarUrl,
    status,
    isPublic,
    phone,
    website,
    address,
    hours,
  } = body;

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const validStatuses = [
    "available",
    "looking_for_work",
    "hiring",
    "busy",
    "inactive",
  ];

  const updated = await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(status !== undefined &&
        validStatuses.includes(status) && { status }),
      ...(isPublic !== undefined && { isPublic }),
      ...(phone !== undefined && { phone }),
      ...(website !== undefined && { website }),
      ...(address !== undefined && { address }),
      ...(hours !== undefined && { hours }),
    },
    include: {
      skills: true,
      services: true,
    },
  });

  return NextResponse.json(updated);
}
