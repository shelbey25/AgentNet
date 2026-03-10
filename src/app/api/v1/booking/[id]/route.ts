// GET /api/v1/booking/:id — Get booking status and details
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      profile: { select: { displayName: true, id: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({
    booking_id: booking.id,
    business_id: booking.profileId,
    business_name: booking.profile.displayName,
    status: booking.status,
    service: booking.service,
    date_time: booking.dateTime,
    duration: booking.duration,
    notes: booking.notes,
    created_at: booking.createdAt,
    updated_at: booking.updatedAt,
  });
}
