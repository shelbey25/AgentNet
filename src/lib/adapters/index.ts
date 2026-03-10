export { registerAdapter, getAdapter, getAllAdapters } from "./base";
export type { ActionAdapter, AdapterRequest, AdapterResponse, IntegrationTypeName } from "./base";
export { genericRestAdapter } from "./generic-rest";
export { dispatchAction, logAction } from "./dispatcher";
export { registerAllAdapters } from "./named-adapters";
