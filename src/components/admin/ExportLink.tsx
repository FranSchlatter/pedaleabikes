import { DownloadIcon } from "lucide-react";
import { buttonVariants } from "./ui/button";

// Descarga directa del Excel (route handler /admin/export).
export function ExportLink({ table, query, label = "Excel" }: { table: string; query?: string; label?: string }) {
    const href = `/admin/export?table=${table}${query ? `&${query}` : ""}`;
    return (
        <a href={href} className={buttonVariants({ variant: "secondary" })} download>
            <DownloadIcon />
            {label}
        </a>
    );
}
