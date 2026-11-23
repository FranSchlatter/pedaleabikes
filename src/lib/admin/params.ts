// Lectura segura de searchParams.
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function param(params: Record<string, string | string[] | undefined>, key: string) {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

export function isUuid(value: string | undefined): value is string {
    return Boolean(value && /^[0-9a-f-]{36}$/i.test(value));
}
