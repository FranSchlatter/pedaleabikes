"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
    email: z.email("Revisá el email."),
    password: z.string().min(1, "Falta la contraseña."),
    next: z.string().optional(),
});

export type LoginState = { error?: string; email?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        next: formData.get("next") || undefined,
    });
    const email = String(formData.get("email") ?? "");
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message, email };
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    });
    if (error) {
        return {
            error:
                error.code === "invalid_credentials"
                    ? "Email o contraseña incorrectos."
                    : "No se pudo iniciar sesión. Probá de nuevo.",
            email,
        };
    }
    const next = parsed.data.next;
    redirect(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
}
