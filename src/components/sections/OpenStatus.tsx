"use client";

import { useNowMinute } from "@/hooks/useNow";
import { getOpenStatus } from "@/lib/schedule";
import type { DaySchedule } from "@/types";

type OpenStatusProps = {
    schedule: DaySchedule[];
    className?: string;
};

export function OpenStatus({ schedule, className = "" }: OpenStatusProps) {
    const now = useNowMinute();
    const status = now && getOpenStatus(schedule, now);
    const isOpen = Boolean(status && status.isOpen);

    return (
        <p
            className={`inline-flex min-h-9 items-center gap-2.5 rounded-full border border-white/15 bg-ink/50 px-4 py-1.5 text-sm font-semibold text-chalk backdrop-blur-md ${className}`}
            aria-live="polite"
        >
            <span aria-hidden className="relative flex size-2.5">
                {isOpen && (
                    <span className="absolute inset-0 animate-ping-soft rounded-full bg-lime" />
                )}
                <span
                    className={`relative size-2.5 rounded-full ${
                        status ? (isOpen ? "bg-lime" : "bg-accent") : "bg-steel"
                    }`}
                />
            </span>
            {status ? status.label : "Consultando horario…"}
        </p>
    );
}
