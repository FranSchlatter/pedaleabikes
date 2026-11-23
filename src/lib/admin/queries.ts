import "server-only";
import type { Db } from "@/lib/supabase/server";

// PostgREST corta en 1000 filas por request: esto pagina hasta traer todo.
export async function fetchAll<T>(
    build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
    pageSize = 1000,
): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; ; from += pageSize) {
        const { data, error } = await build(from, from + pageSize - 1);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < pageSize) break;
    }
    return rows;
}

export async function getSettings(db: Db) {
    const { data } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
    return {
        default_margin: Number(data?.default_margin ?? 0.8),
        price_rounding: Number(data?.price_rounding ?? 100),
        business_name: data?.business_name ?? "Pedalea Bikes",
        address: data?.address ?? "",
        phone: data?.phone ?? "",
        whatsapp: data?.whatsapp ?? "",
        email: data?.email ?? "",
        tax_id: data?.tax_id ?? "",
        receipt_footer: data?.receipt_footer ?? "",
    };
}

export type Settings = Awaited<ReturnType<typeof getSettings>>;
