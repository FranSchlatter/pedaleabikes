"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

type HeroCtaProps = {
    children: ReactNode;
    delay: number;
};

export function HeroCta({ children, delay }: HeroCtaProps) {
    return (
        <m.div
            data-reveal
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
        >
            {children}
        </m.div>
    );
}
