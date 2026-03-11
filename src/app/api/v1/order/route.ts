// POST /api/v1/order — Place an order with a business
import { NextRequest, NextResponse } from "next/server";
import { dispatchAction, logAction } from "@/lib/adapters";
import { checkPublicRateLimit, rateLimited, badRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const start = Date.now();
  const body = await request.json();
  const { business_id, items, pickup_time, notes, custom_fields } = body;

  if (!business_id) return badRequest("business_id is required");
  if (!items || !Array.isArray(items) || items.length === 0)
    return badRequest("items array is required");

  const result = await dispatchAction(business_id, "order", {
    items,
    pickup_time,
    notes,
    ...(custom_fields && { custom_fields }),
  });

  await logAction({
    profileId: business_id,
    action: "order",
    method: "POST",
    path: "/api/v1/order",
    payload: body,
    response: result.data,
    statusCode: result.statusCode,
    source: "agent",
    duration: Date.now() - start,
  });

  return NextResponse.json(
    result.success ? result.data : { error: result.error },
    { status: result.statusCode }
  );
}
