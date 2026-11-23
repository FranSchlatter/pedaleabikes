import { statusLabel } from "@/lib/admin/types";
import { Badge, type BadgeTone } from "./ui/misc";

const TONES: Record<string, BadgeTone> = {
    recibida: "neutral",
    presupuestada: "warning",
    en_reparacion: "primary",
    lista: "success",
    entregada: "dark",
    cancelada: "danger",
};

export function StatusBadge({ status }: { status: string }) {
    return <Badge tone={TONES[status] ?? "neutral"}>{statusLabel(status)}</Badge>;
}
