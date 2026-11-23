"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProduct } from "@/app/admin/actions/inventory";
import { Button } from "@/components/admin/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/admin/ui/dialog";
import { Field, Input, NativeSelect, Textarea } from "@/components/admin/ui/input";
import { MoneyInput } from "@/components/admin/ui/money-input";
import { computePrice } from "@/lib/admin/calc";
import { formatARS, formatNumber, parseARS } from "@/lib/admin/money";
import type { Option } from "@/lib/admin/types";

export type ProductData = {
    id?: string;
    sku: string;
    name: string;
    category_id: string;
    supplier_id: string;
    location: string;
    cost: number | null;
    margin: number | null;
    manual_price: number | null;
    stock: number;
    min_stock: number;
    active: boolean;
    notes: string;
};

const EMPTY: ProductData = {
    sku: "",
    name: "",
    category_id: "",
    supplier_id: "",
    location: "",
    cost: null,
    margin: null,
    manual_price: null,
    stock: 0,
    min_stock: 0,
    active: true,
    notes: "",
};

type Props = {
    categories: Option[];
    suppliers: Option[];
    defaultMargin: number;
    rounding: number;
    product?: ProductData;
};

export function ProductFormButton(props: Props) {
    const [open, setOpen] = useState(false);
    const editing = Boolean(props.product?.id);
    return (
        <>
            <Button
                variant={editing ? "secondary" : "default"}
                onClick={function () {
                    setOpen(true);
                }}
            >
                {editing ? <PencilIcon /> : <PlusIcon />}
                {editing ? "Editar" : "Nuevo producto"}
            </Button>
            {open ? (
                <ProductDialog
                    {...props}
                    onClose={function () {
                        setOpen(false);
                    }}
                />
            ) : null}
        </>
    );
}

function ProductDialog({ categories, suppliers, defaultMargin, rounding, product, onClose }: Props & { onClose: () => void }) {
    const router = useRouter();
    const [data, setData] = useState<ProductData>(product ?? EMPTY);
    const [marginText, setMarginText] = useState(
        product?.margin === null || product?.margin === undefined ? "" : formatNumber(product.margin * 100),
    );
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const editing = Boolean(product?.id);

    const price = computePrice(
        { cost: data.cost ?? 0, margin: data.margin, manualPrice: data.manual_price },
        { defaultMargin, rounding },
    );

    function set<K extends keyof ProductData>(key: K, value: ProductData[K]) {
        setData(function (d) {
            return { ...d, [key]: value };
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!data.name.trim()) {
            setError("El producto necesita nombre.");
            return;
        }
        startTransition(async function () {
            const result = await saveProduct({
                id: product?.id,
                sku: data.sku,
                name: data.name,
                category_id: data.category_id || null,
                supplier_id: data.supplier_id || null,
                location: data.location,
                cost: data.cost ?? 0,
                margin: data.margin,
                manual_price: data.manual_price,
                min_stock: data.min_stock,
                stock: editing ? undefined : data.stock,
                active: data.active,
                notes: data.notes,
            });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast.success(editing ? "Producto actualizado" : `“${data.name}” creado`);
            onClose();
            if (!editing) router.push(`/admin/inventario/${result.data.id}`);
        });
    }

    return (
        <Dialog
            open
            onOpenChange={function (o) {
                if (!o) onClose();
            }}
        >
            <DialogContent size="md">
                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="grid gap-3 sm:grid-cols-2">
                        <Field label="Nombre" htmlFor="p-name" className="sm:col-span-2">
                            <Input
                                id="p-name"
                                autoFocus
                                value={data.name}
                                onChange={function (e) {
                                    set("name", e.target.value);
                                }}
                            />
                        </Field>
                        <Field label="SKU / código" htmlFor="p-sku">
                            <Input
                                id="p-sku"
                                value={data.sku}
                                onChange={function (e) {
                                    set("sku", e.target.value);
                                }}
                            />
                        </Field>
                        <Field label="Ubicación" htmlFor="p-loc" hint="Ej.: Estante A1, cajón B2">
                            <Input
                                id="p-loc"
                                value={data.location}
                                onChange={function (e) {
                                    set("location", e.target.value);
                                }}
                            />
                        </Field>
                        <Field label="Categoría" htmlFor="p-cat">
                            <NativeSelect
                                id="p-cat"
                                value={data.category_id}
                                onChange={function (e) {
                                    set("category_id", e.target.value);
                                }}
                            >
                                <option value="">Sin categoría</option>
                                {categories.map(function (c) {
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    );
                                })}
                            </NativeSelect>
                        </Field>
                        <Field label="Proveedor principal" htmlFor="p-sup">
                            <NativeSelect
                                id="p-sup"
                                value={data.supplier_id}
                                onChange={function (e) {
                                    set("supplier_id", e.target.value);
                                }}
                            >
                                <option value="">Sin proveedor</option>
                                {suppliers.map(function (s) {
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    );
                                })}
                            </NativeSelect>
                        </Field>
                        <Field label="Costo unitario">
                            <MoneyInput
                                value={data.cost}
                                onValueChange={function (v) {
                                    set("cost", v);
                                }}
                            />
                        </Field>
                        <Field
                            label="Margen % (recargo)"
                            htmlFor="p-margin"
                            hint={`Vacío = ${formatNumber(defaultMargin * 100)} % por defecto`}
                        >
                            <Input
                                id="p-margin"
                                inputMode="decimal"
                                value={marginText}
                                placeholder={formatNumber(defaultMargin * 100)}
                                onChange={function (e) {
                                    setMarginText(e.target.value);
                                    const n = parseARS(e.target.value);
                                    set("margin", e.target.value.trim() === "" || n === null ? null : n / 100);
                                }}
                                className="text-right"
                            />
                        </Field>
                        <Field label="Precio manual (opcional)" hint="Solo para excepciones: ignora costo y margen">
                            <MoneyInput
                                value={data.manual_price}
                                onValueChange={function (v) {
                                    set("manual_price", v);
                                }}
                            />
                        </Field>
                        <div className="flex flex-col justify-center rounded-md bg-info-soft px-3 py-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Precio de venta</span>
                            <span className="text-xl font-bold tabular-nums">{formatARS(price)}</span>
                        </div>
                        {!editing ? (
                            <Field label="Stock inicial" htmlFor="p-stock" hint="Queda registrado como carga inicial">
                                <Input
                                    id="p-stock"
                                    type="number"
                                    value={data.stock}
                                    onChange={function (e) {
                                        set("stock", Math.trunc(Number(e.target.value) || 0));
                                    }}
                                />
                            </Field>
                        ) : null}
                        <Field label="Stock mínimo" htmlFor="p-min" hint="Alerta y lista de reposición">
                            <Input
                                id="p-min"
                                type="number"
                                min={0}
                                value={data.min_stock}
                                onChange={function (e) {
                                    set("min_stock", Math.max(0, Math.trunc(Number(e.target.value) || 0)));
                                }}
                            />
                        </Field>
                        <Field label="Notas" htmlFor="p-notes" className="sm:col-span-2">
                            <Textarea
                                id="p-notes"
                                className="min-h-14"
                                value={data.notes}
                                onChange={function (e) {
                                    set("notes", e.target.value);
                                }}
                            />
                        </Field>
                        {editing ? (
                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={data.active}
                                    onChange={function (e) {
                                        set("active", e.target.checked);
                                    }}
                                />
                                Activo (los inactivos no aparecen para vender ni comprar)
                            </label>
                        ) : null}
                        {error ? (
                            <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger sm:col-span-2">
                                {error}
                            </p>
                        ) : null}
                    </DialogBody>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Guardando…" : "Guardar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
