"use client";

import { useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";
import { BellIcon, BikeIcon, ChatIcon, WheelIcon, WrenchIcon } from "@/components/ui/Icons";
import type { WorkshopStep } from "@/types";

type WorkflowProps = {
    steps: WorkshopStep[];
};

const STEP_ICONS = [BikeIcon, ChatIcon, WrenchIcon, BellIcon];

type StepProps = {
    step: WorkshopStep;
    index: number;
    total: number;
    progress: MotionValue<number>;
};

function Step({ step, index, total, progress }: StepProps) {
    const Icon = STEP_ICONS[index % STEP_ICONS.length];
    const threshold = index / (total - 1);
    const start = Math.max(0, threshold - 0.12);
    const active = useTransform(progress, [start, threshold], [0, 1]);
    const scale = useTransform(progress, [start, threshold], [0.85, 1]);
    return (
        <li className="relative grid grid-cols-[3.5rem_1fr] gap-5 pb-12 last:pb-0 lg:block lg:pb-0">
            <div className="relative z-10 size-14 lg:mx-auto">
                <div className="absolute inset-0 flex items-center justify-center rounded-full border border-white/15 bg-ink-2 text-steel">
                    <Icon className="size-6" />
                </div>
                <m.div
                    style={{ opacity: active, scale }}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-accent text-ink shadow-[0_0_0_8px_rgba(255,91,31,0.15)]"
                >
                    <Icon className="size-6" />
                </m.div>
            </div>
            <div className="lg:mt-8 lg:text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
                    Paso 0{index + 1}
                </p>
                <h3 className="heading-display mt-2 text-3xl text-chalk md:text-4xl">
                    {step.title}
                </h3>
                <p className="mt-3 max-w-xs leading-relaxed text-steel lg:mx-auto">
                    {step.description}
                </p>
            </div>
        </li>
    );
}

// El "camino" se dibuja con scaleX/scaleY (solo transform) atado al scroll, y una rueda lo
// recorre: el wrapper ocupa todo el largo y se traslada en % de sí mismo, sin animar left/top.
export function Workflow({ steps }: WorkflowProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.55"] });
    const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
    const complete = useMotionValue(1);
    // Con reduced-motion el camino se muestra ya completo, sin nada atado al scroll.
    const progress = useReducedMotion() ? complete : smooth;
    const travel = useTransform(progress, [0, 1], ["0%", "100%"]);
    const spin = useTransform(progress, [0, 1], [0, 720]);

    return (
        <section
            aria-labelledby="flujo-title"
            className="relative overflow-hidden bg-ink py-24 text-chalk md:py-32"
        >
            <div aria-hidden className="speed-lines absolute inset-0 text-chalk opacity-40" />
            <div className="container-x relative">
                <div className="max-w-3xl">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-lime">
                        Cómo trabajamos
                    </p>
                    <h2
                        id="flujo-title"
                        className="heading-display text-5xl sm:text-6xl lg:text-7xl"
                    >
                        Del taller a la calle <span className="text-accent">en 4 pasos</span>
                    </h2>
                </div>

                <div ref={ref} className="relative mt-16 lg:mt-24">
                    {/* Track mobile (vertical) */}
                    <div
                        aria-hidden
                        className="absolute bottom-7 left-7 top-7 w-0.5 -translate-x-1/2 lg:hidden"
                    >
                        <div className="absolute inset-0 bg-white/10" />
                        <m.div
                            style={{ scaleY: progress }}
                            className="absolute inset-0 origin-top bg-accent"
                        />
                        <m.div style={{ y: travel }} className="absolute inset-0">
                            <m.span
                                style={{ rotate: spin }}
                                className="absolute -left-3 -top-3 block size-6 text-lime"
                            >
                                <WheelIcon className="size-6" />
                            </m.span>
                        </m.div>
                    </div>

                    {/* Track desktop (horizontal) */}
                    <div
                        aria-hidden
                        className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 lg:block"
                    >
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0_14px,transparent_14px_26px)]" />
                        <m.div
                            style={{ scaleX: progress }}
                            className="absolute inset-0 origin-left bg-accent"
                        />
                        <m.div style={{ x: travel }} className="absolute inset-0">
                            <m.span
                                style={{ rotate: spin }}
                                className="absolute -top-12 -left-4 block size-8 text-lime"
                            >
                                <WheelIcon className="size-8" />
                            </m.span>
                        </m.div>
                    </div>

                    <ol className="relative lg:grid lg:grid-cols-4 lg:gap-8">
                        {steps.map(function (step, index) {
                            return (
                                <Step
                                    key={step.id}
                                    step={step}
                                    index={index}
                                    total={steps.length}
                                    progress={progress}
                                />
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}
