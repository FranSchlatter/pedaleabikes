"use client";

import { BanIcon } from "lucide-react";
import { toast } from "sonner";
import { cancelWorkOrder } from "@/app/admin/actions/work-orders";
import { voidPurchase } from "@/app/admin/actions/purchases";
import { voidSale } from "@/app/admin/actions/sales";
import { voidTransaction } from "@/app/admin/actions/cash";
import { Button } from "./ui/button";
import { Confirm } from "./ui/confirm";

const ACTIONS = {
    sale: {
        fn: voidSale,
        title: "¿Anular la venta?",
        text: "Se devuelve el stock de los productos y se anulan los ingresos en caja. La venta queda registrada como anulada.",
        label: "Anular venta",
    },
    purchase: {
        fn: voidPurchase,
        title: "¿Anular la compra?",
        text: "Se descuenta el stock que había sumado y se anula el egreso. El costo de los productos no vuelve atrás.",
        label: "Anular compra",
    },
    workOrder: {
        fn: cancelWorkOrder,
        title: "¿Cancelar / anular la orden?",
        text: "Los repuestos vuelven al stock y, si ya se cobró, se anulan los ingresos. La orden queda como cancelada.",
        label: "Cancelar orden",
    },
    transaction: {
        fn: voidTransaction,
        title: "¿Anular el movimiento?",
        text: "Deja de contar en saldos y reportes. Queda visible como anulado.",
        label: "Anular",
    },
};

export function VoidButton({
    kind,
    id,
    size = "default",
}: {
    kind: keyof typeof ACTIONS;
    id: string;
    size?: "default" | "sm";
}) {
    const config = ACTIONS[kind];
    return (
        <Confirm
            title={config.title}
            description={config.text}
            confirmLabel={config.label}
            askReason={kind !== "transaction"}
            trigger={
                <Button variant="danger-outline" size={size}>
                    <BanIcon />
                    {config.label}
                </Button>
            }
            onConfirm={async function (reason) {
                const result = await config.fn({ id, reason });
                if (!result.ok) {
                    toast.error(result.error);
                    return false;
                }
                toast.success("Listo, quedó anulado.");
            }}
        />
    );
}
