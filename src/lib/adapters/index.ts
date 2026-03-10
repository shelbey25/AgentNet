export { registerAdapter, getAdapter, getAllAdapters } from "./base";
export type { ActionAdapter, AdapterRequest, AdapterResponse } from "./base";
export { genericRestAdapter } from "./generic-rest";
export { dispatchAction, logAction } from "./dispatcher";
