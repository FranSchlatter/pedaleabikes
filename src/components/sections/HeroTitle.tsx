"use client";

import * as m from "motion/react-m";

const EASE = [0.16, 1, 0.3, 1] as const;

type HeroTitleProps = {
    lines: string[];
};

function countWords(lines: string[]) {
    return lines.join(" ").split(" ").filter(Boolean).length;
}

// Entrada palabra por palabra con máscara (overflow-hidden + translateY): solo transform,
// sin opacity, así el texto no castiga el LCP ni genera layout shift.
export function HeroTitle({ lines }: HeroTitleProps) {
    return (
        <h1 className="heading-display text-[clamp(3.6rem,15vw,11rem)] text-chalk">
            {lines.map(function (line, lineIndex) {
                const words = line.split(" ");
                const firstWordIndex = countWords(lines.slice(0, lineIndex));
                return (
                    <span key={line} className="block">
                        {words.map(function (word, index) {
                            const delay = 0.15 + (firstWordIndex + index) * 0.09;
                            const accent = lineIndex === lines.length - 1;
                            return (
                                <span
                                    key={`${line}-${word}`}
                                    className="-mb-[0.08em] inline-block overflow-hidden pb-[0.08em] align-bottom"
                                >
                                    <m.span
                                        className={`inline-block pr-[0.22em] ${accent ? "text-accent" : ""}`}
                                        initial={{ y: "105%" }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 0.9, ease: EASE, delay }}
                                    >
                                        {word}
                                    </m.span>
                                </span>
                            );
                        })}
                    </span>
                );
            })}
        </h1>
    );
}
