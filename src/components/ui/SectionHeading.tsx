import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
    id: string;
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    tone?: "light" | "dark" | "accent";
    align?: "left" | "center";
    className?: string;
};

const TONES = {
    light: {
        eyebrow: "text-accent-ink",
        bar: "bg-accent-ink",
        title: "text-ink",
        description: "text-graphite",
    },
    dark: { eyebrow: "text-mint", bar: "bg-mint", title: "text-chalk", description: "text-steel" },
    accent: { eyebrow: "text-ink", bar: "bg-ink", title: "text-ink", description: "text-ink/80" },
};

export function SectionHeading({
    id,
    eyebrow,
    title,
    description,
    tone = "light",
    align = "left",
    className = "",
}: SectionHeadingProps) {
    const centered = align === "center";
    const colors = TONES[tone];
    return (
        <Reveal className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
            <p
                className={`mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] ${colors.eyebrow}`}
            >
                <span aria-hidden className="flex gap-1">
                    <span className={`h-0.5 w-6 ${colors.bar}`} />
                    <span className={`h-0.5 w-2 ${colors.bar}`} />
                </span>
                {eyebrow}
            </p>
            <h2
                id={id}
                className={`heading-display text-4xl sm:text-5xl lg:text-6xl ${colors.title}`}
            >
                {title}
            </h2>
            {description && (
                <p
                    className={`mt-5 max-w-2xl text-lg leading-relaxed ${centered ? "mx-auto" : ""} ${colors.description}`}
                >
                    {description}
                </p>
            )}
        </Reveal>
    );
}
