"use client";

import { Button } from "@/components/admin/ui/button";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="mx-auto mt-10 max-w-md rounded-lg border border-danger/30 bg-surface p-6 text-center">
            <p className="font-bold text-ink">Algo salió mal al cargar esta pantalla.</p>
            <p className="mt-2 text-sm text-muted">
                Puede ser la conexión con la base de datos. Tus datos no se perdieron.
            </p>
            {error.digest ? <p className="mt-2 font-mono text-xs text-muted">Código: {error.digest}</p> : null}
            <Button className="mt-4" onClick={reset}>
                Reintentar
            </Button>
        </div>
    );
}
