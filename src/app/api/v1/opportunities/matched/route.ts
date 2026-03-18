import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/v1/opportunities/matched — get opportunities matched to current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await prisma.opportunityMatch.findMany({
    where: { userId: session.user.id },
    include: {
      profile: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          opportunityType: true,
          department: true,
          deadline: true,
          compensation: true,
          eligibility: true,
          applyUrl: true,
          tags: true,
        },
      },
    },
    orderBy: [{ matchScore: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ matches });
}
