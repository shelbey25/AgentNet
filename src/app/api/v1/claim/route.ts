// POST /api/v1/claim — Submit a claim request for an unclaimed profile
// GET  /api/v1/claim — List user's claim requests

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET — List current user's claim requests
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = await prisma.claimRequest.findMany({
    where: { userId: session.user.id },
    include: {
      profile: {
        select: { id: true, displayName: true, type: true, department: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    claims: claims.map((c) => ({
      id: c.id,
      profile_id: c.profileId,
      profile_name: c.profile.displayName,
      profile_type: c.profile.type,
      status: c.status,
      evidence: c.evidence,
      created_at: c.createdAt.toISOString(),
    })),
  });
}

// POST — Submit a claim request
// Body: { profile_id: string, evidence?: string }
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { profile_id, evidence } = body;

  if (!profile_id) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 400 });
  }

  // Check profile exists and is claimable
  const profile = await prisma.profile.findUnique({
    where: { id: profile_id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (!profile.isClaimable) {
    return NextResponse.json(
      { error: "This profile is not available for claiming" },
      { status: 403 }
    );
  }

  if (profile.claimedAt) {
    return NextResponse.json(
      { error: "This profile has already been claimed" },
      { status: 409 }
    );
  }

  // Check for existing claim
  const existingClaim = await prisma.claimRequest.findUnique({
    where: {
      profileId_userId: { profileId: profile_id, userId: session.user.id },
    },
  });

  if (existingClaim) {
    return NextResponse.json(
      { error: "You have already submitted a claim for this profile", existing: existingClaim.status },
      { status: 409 }
    );
  }

  // Auto-approve if user's email matches a .ua.edu or .crimson.ua.edu domain
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  const isEduEmail = user?.email.endsWith(".ua.edu") || user?.email.endsWith("@ua.edu");
  const autoApprove = isEduEmail;

  const claim = await prisma.claimRequest.create({
    data: {
      profileId: profile_id,
      userId: session.user.id,
      status: autoApprove ? "approved" : "pending",
      evidence: evidence || (isEduEmail ? "UA email verified" : null),
    },
  });

  // If auto-approved, update the profile
  if (autoApprove) {
    await prisma.profile.update({
      where: { id: profile_id },
      data: {
        claimedAt: new Date(),
        isClaimable: false,
      },
    });
  }

  return NextResponse.json(
    {
      claim_id: claim.id,
      profile_id: claim.profileId,
      status: claim.status,
      message: autoApprove
        ? "Claim approved! Your UA email was verified."
        : "Claim submitted. An admin will review your request.",
    },
    { status: 201 }
  );
}
