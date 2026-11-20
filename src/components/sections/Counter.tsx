"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

type CounterProps = {
    value: number;
    prefix?: string;
    suffix?: string;
};

const numberFormatter = new Intl.NumberFormat("es-AR");

function render(node: HTMLElement, prefix: string, suffix: string, value: number) {
    node.textContent = `${prefix}${numberFormatter.format(Math.round(value))}${suffix}`;
}

// El SSR muestra el valor final (sin JS se lee bien); al montar se resetea a 0 y anima al entrar
// en viewport. Se escribe el DOM directo para no re-renderizar React en cada frame.
export function Counter({ value, prefix = "", suffix = "" }: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const reduceMotion = useReducedMotion();

    useEffect(
        function () {
            const node = ref.current;
            if (!node || reduceMotion) {
                return;
            }
            if (!inView) {
                render(node, prefix, suffix, 0);
                return;
            }
            const controls = animate(0, value, {
                duration: 1.8,
                ease: [0.16, 1, 0.3, 1],
                onUpdate: render.bind(null, node, prefix, suffix),
            });
            return controls.stop.bind(controls);
        },
        [inView, reduceMotion, value, prefix, suffix],
    );

    return (
        <span ref={ref} className="tabular-nums">
            {`${prefix}${numberFormatter.format(value)}${suffix}`}
        </span>
    );
}
