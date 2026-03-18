import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/v1/initiatives — list all active initiatives
export async function GET() {
  const initiatives = await prisma.studentInitiative.findMany({
    where: { isActive: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ initiatives });
}

// POST /api/v1/initiatives — create a new student initiative
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, category, tags, lookingFor, contactEmail, website } = await req.json();

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
  }

  const validCategories = ["club", "startup", "project", "research", "volunteer"];
  const cat = validCategories.includes(category) ? category : "project";

  const initiative = await prisma.studentInitiative.create({
    data: {
      userId: session.user.id,
      title,
      description,
      category: cat,
      tags: tags || [],
      lookingFor: lookingFor || [],
      contactEmail,
      website,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ initiative }, { status: 201 });
}
