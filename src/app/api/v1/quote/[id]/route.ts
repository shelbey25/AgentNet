// GET /api/v1/quote/:id — Get quote status and details
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      profile: { select: { displayName: true, id: true } },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json({
    quote_id: quote.id,
    business_id: quote.profileId,
    business_name: quote.profile.displayName,
    status: quote.status,
    service: quote.service,
    details: quote.details,
    estimated_price: quote.estimatedPrice,
    currency: quote.currency,
    notes: quote.notes,
    expires_at: quote.expiresAt,
    created_at: quote.createdAt,
    updated_at: quote.updatedAt,
  });
}
