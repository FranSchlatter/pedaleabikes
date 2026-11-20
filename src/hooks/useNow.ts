"use client";

import { useSyncExternalStore } from "react";

// Reloj compartido con resolución de 1 minuto. Con useSyncExternalStore el server (y el primer
// render de hidratación) ven null, así no hay mismatch entre la hora del build y la del visitante.
const MINUTE = 60000;

function subscribe(onChange: () => void) {
    const interval = window.setInterval(onChange, 15000);
    document.addEventListener("visibilitychange", onChange);
    return function unsubscribe() {
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onChange);
    };
}

function getSnapshot() {
    return Math.floor(Date.now() / MINUTE);
}

function getServerSnapshot() {
    return null;
}

export function useNowMinute(): Date | null {
    const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return minute === null ? null : new Date(minute * MINUTE);
}
