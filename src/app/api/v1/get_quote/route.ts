// POST /api/v1/get_quote — Request a price quote
import { NextRequest, NextResponse } from "next/server";
import { dispatchAction, logAction } from "@/lib/adapters";
import { checkPublicRateLimit, rateLimited, badRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const start = Date.now();
  const body = await request.json();
  const { business_id, service, details } = body;

  if (!business_id) return badRequest("business_id is required");
  if (!service) return badRequest("service is required");

  const result = await dispatchAction(business_id, "quote", {
    service,
    details: details || {},
  });

  await logAction({
    profileId: business_id,
    action: "quote",
    method: "POST",
    path: "/api/v1/get_quote",
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
