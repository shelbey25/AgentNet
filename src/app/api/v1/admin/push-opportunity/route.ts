import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/v1/admin/push-opportunity — push an opportunity to matching students
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { opportunityId, targetMajor, targetMinGPA } = await req.json();

  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
  }

  // Verify the opportunity exists
  const opportunity = await prisma.profile.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity || opportunity.type !== "opportunity") {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  try {
    // Find matching students based on criteria
    const students = await prisma.user.findMany({
      where: { role: "person" },
      include: {
        portfolio: true,
        memories: true,
      },
    });

    let matchCount = 0;
    const oppTags = opportunity.tags.map((t) => t.toLowerCase());
    const oppDept = opportunity.department?.toLowerCase() || "";

    for (const student of students) {
      // Skip if already matched
      const existing = await prisma.opportunityMatch.findUnique({
        where: { userId_profileId: { userId: student.id, profileId: opportunityId } },
      });
      if (existing) continue;

      // Calculate match score
      let score = 50; // Base score
      let reason = "";
      const mem = new Map(student.memories.map((m) => [m.key, m.value]));
      const studentMajor = mem.get("major") || "";
      const studentGPA = parseFloat(mem.get("gpa") || "0");

      // Major filter
      if (targetMajor && studentMajor) {
        if (studentMajor.toLowerCase().includes(targetMajor.toLowerCase())) {
          score += 20;
          reason += `Major match (${studentMajor}). `;
        } else {
          continue; // Skip if major doesn't match and filter is specified
        }
      }

      // GPA filter
      if (targetMinGPA && studentGPA) {
        if (studentGPA >= targetMinGPA) {
          score += 10;
          reason += `GPA ${studentGPA} meets minimum ${targetMinGPA}. `;
        } else {
          continue; // Skip if GPA is below minimum
        }
      }

      // Tag matching
      if (student.portfolio) {
        const portfolioTags = student.portfolio.matchTags.map((t) => t.toLowerCase());
        const overlap = oppTags.filter((tag) => portfolioTags.includes(tag));
        if (overlap.length > 0) {
          score += overlap.length * 5;
          reason += `${overlap.length} tag matches. `;
        }

        // Department match
        if (oppDept) {
          const interests = student.portfolio.interests.map((i) => i.toLowerCase());
          if (interests.some((i) => i.includes(oppDept) || oppDept.includes(i))) {
            score += 10;
            reason += "Interest alignment. ";
          }
        }
      }

      // Career interest match
      const careerInterest = mem.get("career_interest") || "";
      if (careerInterest && oppTags.some((tag) => careerInterest.toLowerCase().includes(tag))) {
        score += 15;
        reason += "Career interest alignment. ";
      }

      // Cap at 100
      score = Math.min(score, 100);

      // Create the match
      await prisma.opportunityMatch.create({
        data: {
          userId: student.id,
          profileId: opportunityId,
          matchScore: score,
          reason: reason.trim() || "General opportunity match.",
          pushedBy: session.user.id,
        },
      });
      matchCount++;
    }

    return NextResponse.json({
      message: `Pushed "${opportunity.displayName}" to ${matchCount} matching student(s).`,
      matchCount,
    });
  } catch (error) {
    console.error("Push opportunity error:", error);
    return NextResponse.json({ error: "Failed to push opportunity" }, { status: 500 });
  }
}
