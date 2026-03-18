import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/v1/admin/stats — admin dashboard statistics
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const [totalStudents, totalProfiles, totalOpportunities, totalInitiatives, totalMatches, recentSessions] =
    await Promise.all([
      prisma.user.count({ where: { role: "person" } }),
      prisma.profile.count(),
      prisma.profile.count({ where: { type: "opportunity" } }),
      prisma.studentInitiative.count(),
      prisma.opportunityMatch.count(),
      prisma.chatSession.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

  return NextResponse.json({
    totalStudents,
    totalProfiles,
    totalOpportunities,
    totalInitiatives,
    totalMatches,
    recentSessions,
  });
}
