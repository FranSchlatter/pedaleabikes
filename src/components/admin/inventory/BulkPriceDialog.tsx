"use client";

import { PercentIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { bulkUpdateCosts } from "@/app/admin/actions/inventory";
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
import { Field, Input, NativeSelect } from "@/components/admin/ui/input";
import { parseARS } from "@/lib/admin/money";
import type { Option } from "@/lib/admin/types";

export function BulkPriceDialog({
    categories,
    suppliers,
}: {
    categories: Option[];
    suppliers: Option[];
}) {
    const [open, setOpen] = useState(false);
    const [percent, setPercent] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const value = parseARS(percent);

    function reset() {
        setPercent("");
        setConfirming(false);
        setError(null);
    }

    function submit() {
        setError(null);
        if (value === null || value === 0) {
            setError("Ingresá un porcentaje, por ejemplo 12 o -5.");
            return;
        }
        if (!supplierId && !categoryId && !confirming) {
            setConfirming(true);
            return;
        }
        startTransition(async function () {
            const result = await bulkUpdateCosts({
                percent: value,
                supplier_id: supplierId || null,
                category_id: categoryId || null,
            });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast.success(
                `Costos actualizados: ${result.data.count} productos (${value > 0 ? "+" : ""}${value} %)`,
            );
            setOpen(false);
            reset();
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={function (o) {
                setOpen(o);
                if (!o) reset();
            }}
        >
            <Button
                variant="secondary"
                onClick={function () {
                    setOpen(true);
                }}
            >
                <PercentIcon /> Actualizar precios
            </Button>
            <DialogContent size="sm">
                <DialogHeader>
                    <DialogTitle>Actualización masiva</DialogTitle>
                    <DialogDescription>
                        Para listas nuevas: aplica un % al costo. Los precios se recalculan con el
                        margen de cada producto (los de precio manual no cambian).
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-3">
                    <Field
                        label="Porcentaje sobre el costo"
                        htmlFor="bulk-pct"
                        hint="Ej.: 12 sube 12 %, -5 baja 5 %"
                    >
                        <Input
                            id="bulk-pct"
                            autoFocus
                            inputMode="decimal"
                            value={percent}
                            onChange={function (e) {
                                setPercent(e.target.value);
                                setConfirming(false);
                            }}
                        />
                    </Field>
                    <Field label="Proveedor" htmlFor="bulk-sup">
                        <NativeSelect
                            id="bulk-sup"
                            value={supplierId}
                            onChange={function (e) {
                                setSupplierId(e.target.value);
                                setConfirming(false);
                            }}
                        >
                            <option value="">Todos</option>
                            {suppliers.map(function (s) {
                                return (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                );
                            })}
                        </NativeSelect>
                    </Field>
                    <Field label="Categoría" htmlFor="bulk-cat">
                        <NativeSelect
                            id="bulk-cat"
                            value={categoryId}
                            onChange={function (e) {
                                setCategoryId(e.target.value);
                                setConfirming(false);
                            }}
                        >
                            <option value="">Todas</option>
                            {categories.map(function (c) {
                                return (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                );
                            })}
                        </NativeSelect>
                    </Field>
                    {confirming ? (
                        <p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
                            No elegiste proveedor ni categoría: se va a aplicar a <b>todos</b> los
                            productos activos. Volvé a tocar “Aplicar” para confirmar.
                        </p>
                    ) : null}
                    {error ? (
                        <p
                            role="alert"
                            className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
                        >
                            {error}
                        </p>
                    ) : null}
                </DialogBody>
                <DialogFooter>
                    <Button onClick={submit} disabled={pending}>
                        {pending ? "Aplicando…" : "Aplicar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
