"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Las features de animación se cargan en un chunk aparte, después de hidratar: así no suman al
// JS crítico ni al TBT. domMax (y no domAnimation) porque los filtros usan layout animations.
function loadFeatures() {
    return import("./motion-features").then(function (mod) {
        return mod.default;
    });
}

export function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <LazyMotion features={loadFeatures} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    );
}
