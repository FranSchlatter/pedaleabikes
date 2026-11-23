import type { ComponentProps } from "react";
import { cn } from "@/lib/admin/cn";

export function TableWrap({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("w-full overflow-x-auto", className)} {...props} />;
}

export function Table({ className, ...props }: ComponentProps<"table">) {
    return <table className={cn("w-full border-collapse text-sm", className)} {...props} />;
}

export function Th({ className, ...props }: ComponentProps<"th">) {
    return (
        <th
            className={cn(
                "sticky top-0 whitespace-nowrap border-b border-line bg-canvas px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-muted",
                className,
            )}
            {...props}
        />
    );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
    return (
        <td className={cn("border-b border-line px-3 py-2 align-middle", className)} {...props} />
    );
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
    return <tr className={cn("hover:bg-canvas/70", className)} {...props} />;
}
