import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
    const configured = isSupabaseConfigured();
    return (
        <main id="contenido" className="flex min-h-dvh items-center justify-center bg-ink px-4 py-10">
            <div className="w-full max-w-sm">
                <div className="mb-6 flex flex-col items-center gap-3 text-center">
                    <Image src="/logo.png" alt="Pedalea Bikes" width={120} height={108} priority />
                    <p className="font-display text-xl font-extrabold uppercase tracking-tight text-chalk">
                        Sistema de gestión
                    </p>
                </div>
                <div className="rounded-lg border border-ink-3 bg-surface p-6">
                    {configured ? (
                        <Suspense>
                            <LoginForm />
                        </Suspense>
                    ) : (
                        <div className="space-y-3 text-sm">
                            <p className="font-bold">Falta conectar Supabase</p>
                            <p className="text-muted">
                                No hay credenciales en <code>.env.local</code>. Seguí los pasos de{" "}
                                <code>SETUP.md</code>: crear el proyecto, correr las migraciones,
                                cargar <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
                                <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> y crear el usuario.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
