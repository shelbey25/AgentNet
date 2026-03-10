// Named integration adapters — MVP stubs that wrap genericRestAdapter
// When a real integration is built (e.g. Square SDK), replace the stub.
//
// Each adapter implements ActionAdapter and is keyed by integration type.
// The dispatcher checks the business's integrationType to pick the adapter.

import { ActionAdapter, AdapterResponse, registerAdapter } from "./base";
import { genericRestAdapter } from "./generic-rest";

// ─── Square ────────────────────────────────────────────
// Future: use Square SDK for orders, bookings, payments
const squareAdapter: ActionAdapter = {
  name: "square",
  supportedActions: ["order", "book", "availability"],
  async execute(endpoint, payload): Promise<AdapterResponse> {
    // MVP: proxy through generic REST
    // TODO: replace with Square SDK calls (Orders API, Bookings API)
    return genericRestAdapter.execute(endpoint, payload);
  },
};

// ─── Calendly ──────────────────────────────────────────
// Future: use Calendly API for scheduling
const calendlyAdapter: ActionAdapter = {
  name: "calendly",
  supportedActions: ["book", "availability"],
  async execute(endpoint, payload): Promise<AdapterResponse> {
    // MVP: proxy through generic REST
    // TODO: replace with Calendly API (scheduling links, event types)
    return genericRestAdapter.execute(endpoint, payload);
  },
};

// ─── Shopify ───────────────────────────────────────────
// Future: use Shopify Storefront API for product ordering
const shopifyAdapter: ActionAdapter = {
  name: "shopify",
  supportedActions: ["order"],
  async execute(endpoint, payload): Promise<AdapterResponse> {
    return genericRestAdapter.execute(endpoint, payload);
  },
};

// ─── Toast ─────────────────────────────────────────────
// Future: use Toast API for restaurant ordering
const toastAdapter: ActionAdapter = {
  name: "toast",
  supportedActions: ["order"],
  async execute(endpoint, payload): Promise<AdapterResponse> {
    return genericRestAdapter.execute(endpoint, payload);
  },
};

// ─── Stripe Checkout ───────────────────────────────────
// Future: create Stripe Checkout sessions
const stripeCheckoutAdapter: ActionAdapter = {
  name: "stripe_checkout",
  supportedActions: ["order", "book"],
  async execute(endpoint, payload): Promise<AdapterResponse> {
    // MVP: proxy through generic REST
    // TODO: use Stripe SDK to create checkout sessions, return checkout_url
    return genericRestAdapter.execute(endpoint, payload);
  },
};

// ─── Manual / Custom ───────────────────────────────────
// Businesses with custom endpoints — just uses generic REST
const customAdapter: ActionAdapter = {
  name: "custom",
  supportedActions: ["order", "book", "availability", "quote", "message", "service_request"],
  async execute(endpoint, payload): Promise<AdapterResponse> {
    return genericRestAdapter.execute(endpoint, payload);
  },
};

const manualAdapter: ActionAdapter = {
  name: "manual",
  supportedActions: ["order", "book", "availability", "quote", "message", "service_request"],
  async execute(_endpoint, _payload): Promise<AdapterResponse> {
    // Manual businesses don't have external endpoints
    // All actions handled locally — this adapter only runs if a manual
    // business somehow has a registered endpoint
    return {
      success: false,
      error: "Manual integration — action handled locally",
      statusCode: 400,
    };
  },
};

// ─── Register all adapters ─────────────────────────────
export function registerAllAdapters() {
  registerAdapter(squareAdapter);
  registerAdapter(calendlyAdapter);
  registerAdapter(shopifyAdapter);
  registerAdapter(toastAdapter);
  registerAdapter(stripeCheckoutAdapter);
  registerAdapter(customAdapter);
  registerAdapter(manualAdapter);
  registerAdapter(genericRestAdapter);
}

// Auto-register on import
registerAllAdapters();
