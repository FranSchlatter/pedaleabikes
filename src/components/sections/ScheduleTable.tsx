"use client";

import { useNowMinute } from "@/hooks/useNow";
import { formatRanges } from "@/lib/format";
import { getZonedNow } from "@/lib/schedule";
import type { DaySchedule } from "@/types";

type ScheduleTableProps = {
    schedule: DaySchedule[];
};

export function ScheduleTable({ schedule }: ScheduleTableProps) {
    const now = useNowMinute();
    const today = now && getZonedNow(now).weekday;
    return (
        <table className="w-full text-left">
            <caption className="sr-only">Horarios de atención</caption>
            <thead className="sr-only">
                <tr>
                    <th scope="col">Día</th>
                    <th scope="col">Horario</th>
                </tr>
            </thead>
            <tbody>
                {schedule.map(function (day) {
                    const isToday = today === day.day;
                    const closed = day.ranges.length === 0;
                    return (
                        <tr
                            key={day.day}
                            className={`border-b border-white/10 last:border-0 ${isToday ? "text-chalk" : "text-chalk/75"}`}
                            aria-current={isToday ? "date" : undefined}
                        >
                            <th scope="row" className="py-3.5 pr-4 font-semibold">
                                <span className="flex items-center gap-2">
                                    {isToday && (
                                        <span
                                            aria-hidden
                                            className="size-2 rounded-full bg-accent"
                                        />
                                    )}
                                    {day.label}
                                    {isToday && (
                                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                                            Hoy
                                        </span>
                                    )}
                                </span>
                            </th>
                            <td
                                className={`py-3.5 text-right tabular-nums ${closed ? "text-steel" : ""}`}
                            >
                                {formatRanges(day.ranges)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
