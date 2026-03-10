import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/me/skills — add a skill
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

  const { name, category } = await request.json();
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

  const profile = await prisma.profile.findUnique({
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
