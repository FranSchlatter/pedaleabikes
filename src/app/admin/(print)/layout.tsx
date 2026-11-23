import { Suspense } from "react";

export const instant = false;

export default function PrintLayout({ children }: { children: React.ReactNode }) {
    return (
        <main id="contenido" className="min-h-dvh bg-white print:bg-white">
            <Suspense fallback={<p className="p-8 text-sm text-muted">Cargando…</p>}>{children}</Suspense>
        </main>
    );
}
