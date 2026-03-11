// POST /api/v1/request_service — Request a service from a provider
import { NextRequest, NextResponse } from "next/server";
import { dispatchAction, logAction } from "@/lib/adapters";
import { checkPublicRateLimit, rateLimited, badRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const start = Date.now();
  const body = await request.json();
  const { provider_id, service, time_preference, details, custom_fields } = body;

  if (!provider_id) return badRequest("provider_id is required");
  if (!service) return badRequest("service is required");

  const result = await dispatchAction(provider_id, "request_service", {
    service,
    time_preference,
    details: details || {},
    ...(custom_fields && { custom_fields }),
  });

  await logAction({
    profileId: provider_id,
    action: "request_service",
    method: "POST",
    path: "/api/v1/request_service",
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
