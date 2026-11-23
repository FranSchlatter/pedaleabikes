import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Data Access Layer: toda lectura o escritura del admin pasa por acá, que valida la sesión.
export const getDb = cache(async function getDb() {
    // Todo el admin es por request (sesión + datos en vivo + fecha de hoy).
    await connection();
    if (!isSupabaseConfigured()) {
        redirect("/admin/login");
    }
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) {
        redirect("/admin/login");
    }
    return supabase;
});

export async function getUserEmail() {
    const supabase = await getDb();
    const { data } = await supabase.auth.getClaims();
    return (data?.claims.email as string | undefined) ?? null;
}
