"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { adjustStock } from "@/app/admin/actions/inventory";
import { Button } from "@/components/admin/ui/button";
import { Field, Input } from "@/components/admin/ui/input";

const REASONS = ["Conteo físico", "Rotura / defecto", "Pérdida", "Uso interno del taller", "Devolución a proveedor"];

export function AdjustStockForm({ productId, currentStock }: { productId: string; currentStock: number }) {
    const [value, setValue] = useState(String(currentStock));
    const [reason, setReason] = useState("");
    const [pending, startTransition] = useTransition();
    const newStock = Math.trunc(Number(value));
    const diff = Number.isFinite(newStock) ? newStock - currentStock : 0;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!Number.isFinite(newStock)) {
            toast.error("Stock inválido.");
            return;
        }
        if (diff === 0) {
            toast.error("El stock nuevo es igual al actual.");
            return;
        }
        startTransition(async function () {
            const result = await adjustStock({ id: productId, new_stock: newStock, reason });
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            toast.success(`Stock ajustado a ${newStock}`);
            setReason("");
        });
    }

    return (
        <form onSubmit={submit} className="space-y-3 p-4">
            <Field label="Stock real" htmlFor="adj-stock" hint={diff ? `Diferencia: ${diff > 0 ? "+" : ""}${diff}` : `Actual: ${currentStock}`}>
                <Input
                    id="adj-stock"
                    type="number"
                    value={value}
                    onChange={function (e) {
                        setValue(e.target.value);
                    }}
                />
            </Field>
            <Field label="Motivo" htmlFor="adj-reason">
                <Input
                    id="adj-reason"
                    list="adj-reasons"
                    value={reason}
                    required
                    onChange={function (e) {
                        setReason(e.target.value);
                    }}
                />
                <datalist id="adj-reasons">
                    {REASONS.map(function (r) {
                        return <option key={r} value={r} />;
                    })}
                </datalist>
            </Field>
            <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Ajustando…" : "Registrar ajuste"}
            </Button>
        </form>
    );
}
