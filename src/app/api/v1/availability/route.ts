// GET /api/v1/availability — Check business availability
import { NextRequest, NextResponse } from "next/server";
import { dispatchAction, logAction } from "@/lib/adapters";
import { checkPublicRateLimit, rateLimited, badRequest } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const business_id = searchParams.get("business_id");
  const service = searchParams.get("service");
  const date = searchParams.get("date");

  if (!business_id) return badRequest("business_id is required");
  if (!date) return badRequest("date is required (YYYY-MM-DD)");

  const result = await dispatchAction(business_id, "availability", {
    service: service || "",
    date,
  });

  await logAction({
    profileId: business_id,
    action: "availability",
    method: "GET",
    path: "/api/v1/availability",
    payload: { business_id, service, date },
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
