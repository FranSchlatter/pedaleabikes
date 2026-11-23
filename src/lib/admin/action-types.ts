// Tipo compartido con el cliente (action.ts es server-only).
export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };
