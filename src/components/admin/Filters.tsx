import Form from "next/form";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

// Filtros por query string: un form GET, sin estado en el cliente. El link "Limpiar" vuelve a la
// ruta base.
export function Filters({
    action,
    children,
    clearHref,
}: {
    action: string;
    children: ReactNode;
    clearHref?: string;
}) {
    return (
        <Form
            action={action}
            className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-line bg-surface p-3"
        >
            {children}
            <Button type="submit" variant="secondary">
                Filtrar
            </Button>
            {clearHref ? (
                <a
                    href={clearHref}
                    className="px-2 text-sm font-semibold text-muted hover:text-ink"
                >
                    Limpiar
                </a>
            ) : null}
        </Form>
    );
}
