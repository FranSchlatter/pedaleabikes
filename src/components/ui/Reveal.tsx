"use client";

import * as m from "motion/react-m";
import type { Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export const revealItem: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

type RevealProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    y?: number;
};

export function Reveal({ children, className, delay = 0, y = 40 }: RevealProps) {
    return (
        <m.div
            data-reveal
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE, delay }}
        >
            {children}
        </m.div>
    );
}

type StaggerProps = {
    children: ReactNode;
    className?: string;
    as?: "div" | "ul" | "ol";
};

export function Stagger({ children, className, as = "div" }: StaggerProps) {
    const Component = as === "ul" ? m.ul : as === "ol" ? m.ol : m.div;
    return (
        <Component
            className={className}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
        >
            {children}
        </Component>
    );
}

type StaggerItemProps = {
    children: ReactNode;
    className?: string;
    as?: "div" | "li";
};

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
    const Component = as === "li" ? m.li : m.div;
    return (
        <Component data-reveal className={className} variants={revealItem}>
            {children}
        </Component>
    );
}
