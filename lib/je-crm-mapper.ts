// Re-export from canonical location (api/_lib) for local dev / server.ts compatibility.
// Production Vercel functions import directly from api/_lib to ensure correct bundling.
export * from '../api/_lib/je-crm-mapper';
