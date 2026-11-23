import type { ComponentProps } from "react";
import { cn } from "@/lib/admin/cn";

export const fieldClass =
    "w-full rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/30 disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-70 aria-invalid:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
    return <input className={cn(fieldClass, "h-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
    return <textarea className={cn(fieldClass, "min-h-20 py-2", className)} {...props} />;
}

export function NativeSelect({ className, ...props }: ComponentProps<"select">) {
    return <select className={cn(fieldClass, "h-9 pr-7", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
    return (
        <label
            className={cn(
                "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted",
                className,
            )}
            {...props}
        />
    );
}

type FieldProps = {
    label: string;
    htmlFor?: string;
    hint?: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
};

export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
    return (
        <div className={className}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {error ? (
                <p className="mt-1 text-xs text-danger">{error}</p>
            ) : hint ? (
                <p className="mt-1 text-xs text-muted">{hint}</p>
            ) : null}
        </div>
    );
}
