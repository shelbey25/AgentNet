// Webhook delivery system
// Fires webhooks to entity-configured URLs when actions occur
// Uses HMAC-SHA256 signing for payload verification
// Async fire-and-forget pattern (doesn't block action responses)

import { createHmac } from "crypto";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Maps action names to webhook event types
const ACTION_TO_EVENT: Record<string, string> = {
  order: "ordering",
  book: "booking",
  availability: "availability",
  quote: "quotes",
  request_service: "service_requests",
  message: "messaging",
};

export interface WebhookPayload {
  event: string;
  entity_id: string;
  entity_name: string;
  timestamp: string;
  data: Record<string, unknown>;
  schema?: Record<string, unknown>; // Custom field definitions for this event type
}

/**
 * Fire a webhook for a profile action (non-blocking).
 * Checks if the profile has webhooks enabled for this event type,
 * then delivers the payload asynchronously.
 */
export function fireWebhook(
  profileId: string,
  action: string,
  data: Record<string, unknown>
): void {
  // Fire and forget — don't await
  deliverWebhook(profileId, action, data).catch((err) => {
    console.error(`[webhook] Delivery error for profile ${profileId}:`, err);
  });
}

async function deliverWebhook(
  profileId: string,
  action: string,
  data: Record<string, unknown>
): Promise<void> {
  const eventType = ACTION_TO_EVENT[action] || action;

  // Fetch profile webhook config
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: {
      webhookUrl: true,
      webhookSecret: true,
      webhookEnabled: true,
      enabledWebhookEvents: true,
      webhookSchema: true,
      displayName: true,
    },
  });

  if (!profile) return;
  if (!profile.webhookEnabled) return;
  if (!profile.webhookUrl) return;

  // Check if this event type is enabled
  if (
    profile.enabledWebhookEvents.length > 0 &&
    !profile.enabledWebhookEvents.includes(eventType)
  ) {
    return;
  }

  // Extract event-specific schema if defined
  const schemaMap = profile.webhookSchema as Record<string, unknown> | null;
  const eventSchema = schemaMap && typeof schemaMap === "object" ? (schemaMap[eventType] as Record<string, unknown> | undefined) : undefined;

  const payload: WebhookPayload = {
    event: eventType,
    entity_id: profileId,
    entity_name: profile.displayName,
    timestamp: new Date().toISOString(),
    data,
    ...(eventSchema && { schema: eventSchema }),
  };

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-AgentNet-Event": eventType,
    "X-AgentNet-Entity": profileId,
    "X-AgentNet-Timestamp": payload.timestamp,
  };

  // HMAC-SHA256 signature if secret is configured
  if (profile.webhookSecret) {
    const signature = createHmac("sha256", profile.webhookSecret)
      .update(body)
      .digest("hex");
    headers["X-AgentNet-Signature"] = `sha256=${signature}`;
  }

  let statusCode: number | null = null;
  let responseBody: string | null = null;
  let success = false;
  let error: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(profile.webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    statusCode = res.status;
    success = res.ok;

    try {
      responseBody = await res.text();
      // Truncate long responses
      if (responseBody && responseBody.length > 1000) {
        responseBody = responseBody.substring(0, 1000) + "...(truncated)";
      }
    } catch {
      // Ignore body read errors
    }
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Unknown webhook delivery error";
  }

  // Log the delivery attempt
  try {
    await prisma.webhookLog.create({
      data: {
        profileId,
        event: eventType,
        payload: payload as unknown as Prisma.InputJsonValue,
        url: profile.webhookUrl,
        statusCode,
        response: responseBody,
        success,
        attempts: 1,
        error,
      },
    });
  } catch (logErr) {
    console.error("[webhook] Failed to log delivery:", logErr);
  }
}
