import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/me/skills — add a skill
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, category, profileId: targetProfileId } = await request.json();

  const profile = targetProfileId
    ? await prisma.profile.findFirst({ where: { id: targetProfileId, userId: session.user.id } })
    : await prisma.profile.findFirst({ where: { userId: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (!name) {
    return NextResponse.json(
      { error: "Skill name is required" },
      { status: 400 }
    );
  }

  const skill = await prisma.skill.create({
    data: {
      profileId: profile.id,
      name,
      category: category || null,
    },
  });

  return NextResponse.json(skill, { status: 201 });
}

// GET /api/me/skills — list own skills
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const skills = await prisma.skill.findMany({
    where: { profileId: profile.id },
  });

  return NextResponse.json(skills);
}
