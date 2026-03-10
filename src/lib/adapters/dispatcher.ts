// Action dispatcher — routes agent actions to the correct adapter
// Flow: Agent → Platform API → Dispatcher → Adapter → Business Endpoint

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { AdapterResponse } from "./base";
import { genericRestAdapter } from "./generic-rest";
import {
  handleLocalOrder,
  handleLocalBooking,
  handleLocalAvailability,
  handleLocalQuote,
  handleLocalServiceRequest,
} from "./local";

type CapabilityMapping = {
  [key: string]: string; // action → CapabilityType
};

const ACTION_TO_CAPABILITY: CapabilityMapping = {
  order: "ordering",
  book: "booking",
  availability: "availability",
  quote: "quotes",
  request_service: "service_requests",
  message: "messaging",
};

export async function dispatchAction(
  profileId: string,
  action: string,
  payload: Record<string, unknown>
): Promise<AdapterResponse> {
  // 1. Check the business has this capability
  const requiredCapability = ACTION_TO_CAPABILITY[action];
  if (requiredCapability) {
    const cap = await prisma.capability.findFirst({
      where: { profileId, type: requiredCapability as never, isActive: true },
    });
    if (!cap) {
      return {
        success: false,
        error: `Business does not support capability: ${requiredCapability}`,
        statusCode: 404,
      };
    }
  }

  // 2. Check if business has an external endpoint registered
  const endpoint = await prisma.businessEndpoint.findFirst({
    where: { profileId, action, isActive: true },
  });

  // 3. If external endpoint exists, use generic REST adapter to proxy
  if (endpoint) {
    return genericRestAdapter.execute(
      {
        url: endpoint.url,
        method: endpoint.method,
        headers: (endpoint.headers as Record<string, string>) || undefined,
      },
      payload
    );
  }

  // 4. Otherwise, handle locally
  switch (action) {
    case "order":
      return handleLocalOrder(profileId, payload);
    case "book":
      return handleLocalBooking(profileId, payload);
    case "availability":
      return handleLocalAvailability(profileId, payload);
    case "quote":
      return handleLocalQuote(profileId, payload);
    case "request_service":
      return handleLocalServiceRequest(profileId, payload);
    default:
      return {
        success: false,
        error: `Unknown action: ${action}`,
        statusCode: 400,
      };
  }
}

// Log action for audit trail
export async function logAction(params: {
  profileId?: string;
  action: string;
  method: string;
  path: string;
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
  statusCode?: number;
  source?: string;
  apiKeyId?: string;
  duration?: number;
}) {
  try {
    await prisma.actionLog.create({
      data: {
        profileId: params.profileId || null,
        action: params.action,
        method: params.method,
        path: params.path,
        payload: params.payload ? (params.payload as Prisma.InputJsonValue) : undefined,
        response: params.response ? (params.response as Prisma.InputJsonValue) : undefined,
        statusCode: params.statusCode,
        source: params.source || "agent",
        apiKeyId: params.apiKeyId,
        duration: params.duration,
      },
    });
  } catch {
    // Non-critical — don't break the request
    console.error("Failed to log action");
  }
}
