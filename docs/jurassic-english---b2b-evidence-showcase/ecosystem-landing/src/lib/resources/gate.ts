// Release gate for the Student Academy resource store.
//
// This phase is preview-only. Production builds and requests get a 404 for
// every store page and API, whatever else is configured, so merging this code
// cannot open a store or take money. Opening the store needs a separate,
// owner-approved release that replaces this function (see
// JE_RESOURCE_STORE_QA_RELEASE_GATE.md).

export type StoreMode = "off" | "sandbox";

export function storeMode(): StoreMode {
  if (process.env.VERCEL_ENV === "production") return "off";
  if (process.env.VERCEL_ENV === "preview") return "sandbox";
  return process.env.NODE_ENV === "production" && !process.env.RESOURCES_LOCAL_SANDBOX ? "off" : "sandbox";
}
