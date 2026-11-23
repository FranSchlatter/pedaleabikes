import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/admin/cn";

export const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary-hover",
                secondary: "border border-line-strong bg-surface text-ink hover:bg-canvas",
                ghost: "text-ink hover:bg-canvas",
                danger: "bg-danger text-white hover:bg-danger/90",
                "danger-outline": "border border-danger/40 bg-surface text-danger hover:bg-danger-soft",
                link: "h-auto p-0 text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-3.5",
                sm: "h-8 px-2.5 text-xs",
                lg: "h-11 px-5 text-base",
                icon: "size-9",
                "icon-sm": "size-8",
            },
        },
        defaultVariants: { variant: "default", size: "default" },
    },
);

export type ButtonProps = ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
    const Comp = asChild ? Slot.Root : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
