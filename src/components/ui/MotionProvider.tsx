"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import type { ReactNode } from "react";

// LazyMotion + `m` mantiene el bundle chico; domMax porque los filtros usan layout animations.
export function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <LazyMotion features={domMax} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    );
}
