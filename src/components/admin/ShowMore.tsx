import Link from "next/link";

// Pie de tabla paginada: "Mostrando X de Y · Ver N más · Ver todos". Conserva los filtros.
export function ShowMore({
    shown,
    total,
    step,
    basePath,
    params,
    exact = true,
}: {
    shown: number;
    total: number;
    step: number;
    basePath: string;
    params: Record<string, string | string[] | undefined>;
    // false cuando no se conoce el total (hay al menos `total` filas).
    exact?: boolean;
}) {
    if (shown >= total) return null;
    function href(limit: number) {
        const q = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (key !== "limite" && typeof value === "string" && value) q.set(key, value);
        }
        q.set("limite", String(limit));
        return `${basePath}?${q.toString()}`;
    }
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-line px-4 py-3 text-sm">
            <span className="text-muted">
                Mostrando {shown} de {exact ? total : `más de ${shown}`}
            </span>
            <Link
                href={href(shown + step)}
                className="font-semibold text-primary hover:underline"
                scroll={false}
            >
                Ver {step} más
            </Link>
            {exact ? (
                <Link
                    href={href(total)}
                    className="font-semibold text-primary hover:underline"
                    scroll={false}
                >
                    Ver todos
                </Link>
            ) : null}
        </div>
    );
}
