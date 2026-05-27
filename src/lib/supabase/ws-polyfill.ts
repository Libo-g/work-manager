// Minimal WebSocket stub for Node.js 18 runtimes where native WebSocket
// and the "ws" package are both unavailable (e.g. EdgeOne cloud functions).
// The server-side Supabase clients never subscribe to realtime channels,
// so this only needs to satisfy the constructor check, not actually connect.

const stub = function () {} as unknown as typeof globalThis.WebSocket;
(globalThis as Record<string, unknown>).WebSocket ??= stub;

export {};
