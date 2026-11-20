import type { DaySchedule, Weekday } from "@/types";

const TIMEZONE = "America/Argentina/Buenos_Aires";

const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKDAY_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

type ZonedNow = {
    year: number;
    month: number;
    day: number;
    weekday: Weekday;
    minutes: number;
};

export type OpenStatus = {
    isOpen: boolean;
    label: string;
};

export type BusinessDayOption = {
    value: string;
    label: string;
};

function toMinutes(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

// Se calcula siempre en hora de Argentina, sin importar la zona del dispositivo del visitante.
export function getZonedNow(date: Date): ZonedNow {
    const parts: Record<string, number> = {};
    for (const part of partsFormatter.formatToParts(date)) {
        if (part.type !== "literal") {
            parts[part.type] = Number(part.value);
        }
    }
    const weekday = new Date(
        Date.UTC(parts.year, parts.month - 1, parts.day),
    ).getUTCDay() as Weekday;
    return {
        year: parts.year,
        month: parts.month,
        day: parts.day,
        weekday,
        minutes: parts.hour * 60 + parts.minute,
    };
}

function findDay(schedule: DaySchedule[], weekday: number) {
    return schedule.find(function (entry) {
        return entry.day === weekday;
    });
}

export function getOpenStatus(schedule: DaySchedule[], date: Date): OpenStatus {
    const now = getZonedNow(date);
    const today = findDay(schedule, now.weekday);
    const ranges = today?.ranges ?? [];

    for (const range of ranges) {
        if (now.minutes >= toMinutes(range.open) && now.minutes < toMinutes(range.close)) {
            return { isOpen: true, label: `Abierto ahora · cierra ${range.close}` };
        }
    }

    for (const range of ranges) {
        if (now.minutes < toMinutes(range.open)) {
            return { isOpen: false, label: `Cerrado · abre hoy ${range.open}` };
        }
    }

    for (let offset = 1; offset <= 7; offset++) {
        const weekday = (now.weekday + offset) % 7;
        const next = findDay(schedule, weekday);
        if (next && next.ranges.length > 0) {
            const when = offset === 1 ? "mañana" : `el ${WEEKDAY_LONG[weekday]}`;
            return { isOpen: false, label: `Cerrado · abre ${when} ${next.ranges[0].open}` };
        }
    }

    return { isOpen: false, label: "Cerrado" };
}

function pad(value: number) {
    return String(value).padStart(2, "0");
}

// Días en los que se puede dejar la bici: los que el local abre, desde hoy en adelante.
// Hoy solo cuenta si todavía no cerró. No contempla feriados (ver DECISIONS.md).
export function getUpcomingBusinessDays(
    schedule: DaySchedule[],
    date: Date,
    count: number,
): BusinessDayOption[] {
    const now = getZonedNow(date);
    const options: BusinessDayOption[] = [];
    const base = Date.UTC(now.year, now.month - 1, now.day);

    for (let offset = 0; options.length < count && offset < count * 3; offset++) {
        const day = new Date(base + offset * 86400000);
        const weekday = day.getUTCDay();
        const entry = findDay(schedule, weekday);
        if (!entry || entry.ranges.length === 0) {
            continue;
        }
        if (offset === 0) {
            const lastClose = toMinutes(entry.ranges[entry.ranges.length - 1].close);
            if (now.minutes >= lastClose) {
                continue;
            }
        }
        const dd = pad(day.getUTCDate());
        const mm = pad(day.getUTCMonth() + 1);
        const prefix = offset === 0 ? "Hoy" : offset === 1 ? "Mañana" : WEEKDAY_SHORT[weekday];
        options.push({
            value: `${day.getUTCFullYear()}-${mm}-${dd}`,
            label: `${prefix} ${dd}/${mm}`,
        });
    }

    return options;
}
