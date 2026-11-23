// Todo en hora de Argentina. Argentina no usa horario de verano desde 2009, así que el offset
// es fijo (-03:00) y alcanza con strings para los límites de día y mes.
export const TIMEZONE = "America/Argentina/Buenos_Aires";
const OFFSET = "-03:00";

const isoDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

const shortDate = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

const shortDateTime = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

const timeOnly = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

// "YYYY-MM-DD" del instante dado, en Argentina.
export function toArDate(value: Date | string = new Date()) {
    return isoDay.format(typeof value === "string" ? new Date(value) : value);
}

export function todayAR() {
    return toArDate(new Date());
}

export function currentMonthAR() {
    return todayAR().slice(0, 7);
}

export function addDays(date: string, days: number) {
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

export function addMonths(month: string, months: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + months, 1));
    return d.toISOString().slice(0, 7);
}

// Límites [from, to) de un día como timestamps con offset de Argentina.
export function dayBounds(date: string) {
    return { from: `${date}T00:00:00${OFFSET}`, to: `${addDays(date, 1)}T00:00:00${OFFSET}` };
}

// Primer y último día (inclusive) de un mes "YYYY-MM".
export function monthBounds(month: string) {
    const first = `${month}-01`;
    const last = addDays(`${addMonths(month, 1)}-01`, -1);
    return { first, last };
}

export function isValidMonth(value: string | undefined | null): value is string {
    return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

export function isValidDate(value: string | undefined | null): value is string {
    return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));
}

// Fecha elegida en un input → timestamp. Hoy usa la hora actual; otro día, el mediodía.
export function dateInputToTimestamp(date: string | null | undefined) {
    if (!date || date === todayAR()) {
        return new Date().toISOString();
    }
    return `${date}T12:00:00${OFFSET}`;
}

export function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    // Fechas puras (YYYY-MM-DD) se muestran tal cual, sin pasar por zona horaria.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split("-");
        return `${d}/${m}/${y}`;
    }
    return shortDate.format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    return shortDateTime.format(new Date(value));
}

export function formatTime(value: string | null | undefined) {
    if (!value) return "—";
    return timeOnly.format(new Date(value));
}

const MONTHS = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
];

export function formatMonth(month: string, short = false) {
    const [y, m] = month.split("-").map(Number);
    const name = MONTHS[m - 1] ?? month;
    return short ? `${name.slice(0, 3)} ${String(y).slice(2)}` : `${name} ${y}`;
}

// Días transcurridos (en días de Argentina) desde un timestamp.
export function daysSince(value: string) {
    const from = Date.parse(`${toArDate(value)}T12:00:00Z`);
    const to = Date.parse(`${todayAR()}T12:00:00Z`);
    return Math.round((to - from) / 86400000);
}
