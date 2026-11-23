import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "./auth";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
    return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
    return { ok: false, error };
}

// Mensajes legibles para errores de Postgres/PostgREST. Los RAISE de nuestras funciones ya
// vienen en castellano (código P0001).
export function dbErrorMessage(error: PostgrestError | Error | null | undefined) {
    if (!error) return "Error desconocido.";
    const e = error as PostgrestError;
    switch (e.code) {
        case "P0001":
            return e.message;
        case "23505":
            if (e.message.includes("sku")) return "Ya existe un producto con ese SKU.";
            return "Ya existe un registro con ese nombre.";
        case "23503":
            return "No se puede: hay registros que dependen de este.";
        case "23514":
            return "Algún valor no es válido (revisá montos y cantidades).";
        case "42501":
            return "No tenés permiso para hacer esto. Volvé a iniciar sesión.";
        default:
            return e.message || "No se pudo completar la operación.";
    }
}

export function zodMessage(error: z.ZodError) {
    const issue = error.issues[0];
    return issue?.message ?? "Datos inválidos.";
}

// Envuelve una Server Action: valida con Zod, verifica la sesión, captura errores y refresca
// la vista actual al terminar bien.
export async function runAction<S extends z.ZodType, T>(
    schema: S,
    input: unknown,
    fn: (data: z.infer<S>, db: Awaited<ReturnType<typeof getDb>>) => Promise<T>,
): Promise<ActionResult<T>> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
        return fail(zodMessage(parsed.error));
    }
    const db = await getDb();
    try {
        const data = await fn(parsed.data, db);
        refresh();
        return ok(data);
    } catch (error) {
        if (error instanceof DbError) {
            return fail(error.message);
        }
        console.error(error);
        return fail(error instanceof Error ? error.message : "No se pudo completar la operación.");
    }
}

export class DbError extends Error {}

// Lanza un DbError legible si la respuesta de Supabase trae error.
export function check<T>(result: { data: T; error: PostgrestError | null }): NonNullable<T> {
    if (result.error) {
        throw new DbError(dbErrorMessage(result.error));
    }
    return result.data as NonNullable<T>;
}
