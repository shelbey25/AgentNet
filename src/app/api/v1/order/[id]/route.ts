// GET /api/v1/order/:id — Get order status and details
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      profile: { select: { displayName: true, id: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    order_id: order.id,
    business_id: order.profileId,
    business_name: order.profile.displayName,
    status: order.status,
    items: order.items,
    total: order.total,
    pickup_time: order.pickupTime,
    payment_mode: order.paymentMode,
    checkout_url: order.checkoutUrl,
    next_step: order.nextStep,
    notes: order.notes,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  });
}
