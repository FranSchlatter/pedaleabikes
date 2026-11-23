import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/admin/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
    return (
        <section className={cn("rounded-lg border border-line bg-surface", className)} {...props} />
    );
}

export function CardHeader({
    title,
    action,
    className,
    description,
}: {
    title: ReactNode;
    action?: ReactNode;
    description?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5",
                className,
            )}
        >
            <div>
                <h2 className="text-sm font-bold text-ink">{title}</h2>
                {description ? <p className="text-xs text-muted">{description}</p> : null}
            </div>
            {action}
        </div>
    );
}

const badgeTones = {
    neutral: "bg-canvas text-ink border-line",
    primary: "bg-info-soft text-primary border-primary/20",
    success: "bg-success-soft text-success border-success/20",
    warning: "bg-warning-soft text-warning border-warning/25",
    danger: "bg-danger-soft text-danger border-danger/20",
    dark: "bg-ink text-chalk border-ink",
};

export type BadgeTone = keyof typeof badgeTones;

export function Badge({
    tone = "neutral",
    className,
    ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                badgeTones[tone],
                className,
            )}
            {...props}
        />
    );
}

export function PageHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-ink">
                    {title}
                </h1>
                {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}

export function EmptyState({
    title,
    description,
    action,
    className,
}: {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2 px-4 py-10 text-center",
                className,
            )}
        >
            <p className="text-sm font-semibold text-ink">{title}</p>
            {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
            {action ? <div className="mt-2">{action}</div> : null}
        </div>
    );
}

export function Stat({
    label,
    value,
    hint,
    tone,
    className,
}: {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    tone?: "positive" | "negative";
    className?: string;
}) {
    return (
        <div className={cn("rounded-lg border border-line bg-surface px-4 py-3", className)}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
            <p
                className={cn(
                    "mt-1 text-xl font-bold tabular-nums text-ink",
                    tone === "positive" && "text-success",
                    tone === "negative" && "text-danger",
                )}
            >
                {value}
            </p>
            {hint ? <div className="mt-0.5 text-xs text-muted">{hint}</div> : null}
        </div>
    );
}

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse rounded-md bg-line/60", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
    return (
        <kbd className="rounded border border-current/30 px-1 font-mono text-[10px] font-semibold leading-4 opacity-70">
            {children}
        </kbd>
    );
}
