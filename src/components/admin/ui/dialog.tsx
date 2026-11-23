"use client";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/admin/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type ContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
    size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
};

export function DialogContent({ className, children, size = "md", ...props }: ContentProps) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/50" />
            <DialogPrimitive.Content
                className={cn(
                    "fixed left-1/2 top-[4vh] z-50 flex max-h-[92dvh] w-[calc(100%-1.5rem)] -translate-x-1/2 flex-col rounded-lg border border-line bg-surface shadow-xl focus:outline-none sm:top-[6vh] sm:max-h-[88dvh]",
                    sizes[size],
                    className,
                )}
                {...props}
            >
                {children}
                <DialogPrimitive.Close
                    className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink"
                    aria-label="Cerrar"
                >
                    <XIcon className="size-4" />
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("border-b border-line px-5 py-3.5 pr-12", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
    return <DialogPrimitive.Title className={cn("text-base font-bold text-ink", className)} {...props} />;
}

export function DialogDescription({
    className,
    ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
    return <DialogPrimitive.Description className={cn("text-sm text-muted", className)} {...props} />;
}

export function DialogBody({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-end gap-2 border-t border-line bg-canvas/60 px-5 py-3",
                className,
            )}
            {...props}
        />
    );
}
