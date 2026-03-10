// Base adapter interface for translating platform actions to business API calls
// Agent → Platform API → Action Adapter → Business Endpoint

export interface AdapterRequest {
  action: string;
  businessId: string;
  payload: Record<string, unknown>;
}

export interface AdapterResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  statusCode: number;
}

export interface ActionAdapter {
  name: string;
  supportedActions: string[];
  execute(
    endpoint: { url: string; method: string; headers?: Record<string, string> },
    payload: Record<string, unknown>
  ): Promise<AdapterResponse>;
}

// Registry of adapters by name
const adapterRegistry = new Map<string, ActionAdapter>();

export function registerAdapter(adapter: ActionAdapter) {
  adapterRegistry.set(adapter.name, adapter);
}

export function getAdapter(name: string): ActionAdapter | undefined {
  return adapterRegistry.get(name);
}

export function getAllAdapters(): ActionAdapter[] {
  return Array.from(adapterRegistry.values());
}
