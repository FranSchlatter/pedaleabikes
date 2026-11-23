"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deliverWorkOrder } from "@/app/admin/actions/work-orders";
import { AccountPicker } from "@/components/admin/quick/AccountPicker";
import { useQuickActions } from "@/components/admin/quick/QuickActions";
import { Button } from "@/components/admin/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/admin/ui/dialog";
import { Label, Textarea } from "@/components/admin/ui/input";
import { MoneyInput } from "@/components/admin/ui/money-input";
import { allocateWorkOrder } from "@/lib/admin/calc";
import { formatARS } from "@/lib/admin/money";
import type { EditorItem } from "./WorkOrderEditor";

type Props = {
    orderId: string;
    number: number;
    items: EditorItem[];
    labor: number;
    total: number;
    workDone: string;
    tallerCategoryId: string;
    onClose: () => void;
};

export function DeliverDialog({ orderId, number, items, labor, total, workDone, tallerCategoryId, onClose }: Props) {
    const { catalog } = useQuickActions();
    const [finalPrice, setFinalPrice] = useState<number | null>(total);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [done, setDone] = useState(workDone);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const account = accountId ?? catalog?.accounts[0]?.id ?? null;

    const categoryName = new Map(
        (catalog?.categories ?? []).map(function (c) {
            return [c.id, c.name];
        }),
    );
    const groups = [
        { key: tallerCategoryId, amount: labor },
        ...items.map(function (i) {
            return { key: i.income_category_id, amount: i.quantity * i.unit_price };
        }),
    ];
    const allocation = allocateWorkOrder(groups, tallerCategoryId, finalPrice ?? 0);

    function submit() {
        setError(null);
        if (finalPrice === null || finalPrice < 0) {
            setError("Ingresá el precio final.");
            return;
        }
        if (!account) {
            setError("Elegí la cuenta de cobro.");
            return;
        }
        startTransition(async function () {
            const result = await deliverWorkOrder({
                id: orderId,
                account_id: account,
                final_price: finalPrice,
                work_done: done,
            });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast.success(`Orden #${number} entregada · ${formatARS(finalPrice)}`);
            onClose();
        });
    }

    return (
        <Dialog
            open
            onOpenChange={function (o) {
                if (!o) onClose();
            }}
        >
            <DialogContent size="sm">
                <DialogHeader>
                    <DialogTitle>Entregar y cobrar · #{number}</DialogTitle>
                    <DialogDescription>Genera los ingresos en caja y pasa la orden a Entregada.</DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-3">
                    <div>
                        <Label>Precio final</Label>
                        <MoneyInput value={finalPrice} onValueChange={setFinalPrice} autoFocus className="h-11 text-lg" />
                        <p className="mt-1 text-xs text-muted">
                            Calculado: {formatARS(total)}. Si cobrás distinto, la diferencia va a Taller.
                        </p>
                    </div>
                    <div>
                        <Label>Cobrado en</Label>
                        <AccountPicker accounts={catalog?.accounts ?? []} value={account} onChange={setAccountId} />
                    </div>
                    <div>
                        <Label>Trabajos realizados</Label>
                        <Textarea
                            value={done}
                            onChange={function (e) {
                                setDone(e.target.value);
                            }}
                        />
                    </div>
                    <div className="rounded-md bg-canvas p-2.5 text-sm">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Se registra en caja</p>
                        {allocation.length === 0 ? (
                            <p className="text-muted">Sin ingresos (precio 0).</p>
                        ) : (
                            <ul className="space-y-0.5">
                                {allocation.map(function (a) {
                                    return (
                                        <li key={a.key} className="flex justify-between">
                                            <span>{categoryName.get(a.key) ?? "Taller"}</span>
                                            <span className="tabular-nums">{formatARS(a.amount)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    {error ? (
                        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                            {error}
                        </p>
                    ) : null}
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>
                        Volver
                    </Button>
                    <Button onClick={submit} disabled={pending} className="bg-success hover:bg-success/90">
                        {pending ? "Registrando…" : `Cobrar ${formatARS(finalPrice ?? 0)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
