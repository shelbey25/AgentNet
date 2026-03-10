// Generic REST adapter — calls external business endpoints directly
import { ActionAdapter, AdapterResponse } from "./base";

export const genericRestAdapter: ActionAdapter = {
  name: "generic_rest",
  supportedActions: [
    "order",
    "book",
    "availability",
    "quote",
    "message",
    "service_request",
  ],

  async execute(
    endpoint: { url: string; method: string; headers?: Record<string, string> },
    payload: Record<string, unknown>
  ): Promise<AdapterResponse> {
    try {
      const isGet = endpoint.method.toUpperCase() === "GET";

      let url = endpoint.url;
      if (isGet && Object.keys(payload).length > 0) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
          params.set(key, String(value));
        }
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        method: endpoint.method.toUpperCase(),
        headers: {
          "Content-Type": "application/json",
          ...(endpoint.headers || {}),
        },
        ...(isGet ? {} : { body: JSON.stringify(payload) }),
      });

      const data = await res.json().catch(() => ({}));

      return {
        success: res.ok,
        data,
        statusCode: res.status,
        ...(res.ok ? {} : { error: data.error || `HTTP ${res.status}` }),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Adapter fetch failed",
        statusCode: 502,
      };
    }
  },
};
