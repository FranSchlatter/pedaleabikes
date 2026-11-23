// Lectura segura de searchParams.
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function param(params: Record<string, string | string[] | undefined>, key: string) {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

export function isUuid(value: string | undefined): value is string {
    return Boolean(value && /^[0-9a-f-]{36}$/i.test(value));
}

// ?limite=N para tablas paginadas (entre `fallback` y 20.000).
export function limitParam(
    params: Record<string, string | string[] | undefined>,
    fallback: number,
) {
    const n = Math.trunc(Number(param(params, "limite")));
    return Number.isFinite(n) && n > 0 ? Math.min(n, 20000) : fallback;
}
