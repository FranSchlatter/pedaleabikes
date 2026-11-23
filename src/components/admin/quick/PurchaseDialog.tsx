"use client";

import { Trash2Icon } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createPurchase } from "@/app/admin/actions/purchases";
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
import { Field, Input, Label, NativeSelect } from "@/components/admin/ui/input";
import { MoneyInput } from "@/components/admin/ui/money-input";
import { SearchSelect, type SearchOption } from "@/components/admin/ui/search-select";
import { linesTotal } from "@/lib/admin/calc";
import { dateInputToTimestamp, todayAR } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import type { Catalog } from "@/lib/admin/types";
import { AccountPicker } from "./AccountPicker";

type Line = {
    productId: string;
    name: string;
    quantity: number;
    unitCost: number | null;
    previousCost: number;
    stock: number;
};

type Props = {
    catalog: Catalog | null;
    supplierId?: string;
    onOpenChange: (open: boolean) => void;
    onDone: () => void;
};

export function PurchaseDialog({ catalog, supplierId: initialSupplier, onOpenChange, onDone }: Props) {
    const [supplierId, setSupplierId] = useState(initialSupplier ?? "");
    const [lines, setLines] = useState<Line[]>([]);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [invoiceRef, setInvoiceRef] = useState("");
    const [date, setDate] = useState(todayAR());
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const defaultAccount =
        catalog?.accounts.find(function (a) {
            return a.name.toLowerCase().includes("banco");
        })?.id ??
        catalog?.accounts[0]?.id ??
        null;
    const effectiveAccount = accountId ?? defaultAccount;

    // Primero los productos del proveedor elegido.
    const options = useMemo<SearchOption[]>(
        function () {
            if (!catalog) return [];
            return [...catalog.products]
                .sort(function (a, b) {
                    return Number(b.supplier_id === supplierId) - Number(a.supplier_id === supplierId);
                })
                .map(function (p) {
                    return {
                        key: p.id,
                        label: p.name,
                        keywords: p.sku ?? "",
                        sublabel: [p.sku, `stock ${p.stock}`, `mín. ${p.min_stock}`].filter(Boolean).join(" · "),
                        right: <span className="text-xs text-muted">costo {formatARS(p.cost)}</span>,
                    };
                });
        },
        [catalog, supplierId],
    );

    const total = linesTotal(
        lines.map(function (l) {
            return { quantity: l.quantity, unitPrice: l.unitCost ?? 0 };
        }),
    );

    function add(option: SearchOption) {
        const product = catalog?.products.find(function (p) {
            return p.id === option.key;
        });
        if (!product) return;
        if (!supplierId && product.supplier_id) setSupplierId(product.supplier_id);
        setLines(function (prev) {
            if (
                prev.some(function (l) {
                    return l.productId === product.id;
                })
            ) {
                return prev.map(function (l) {
                    return l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l;
                });
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    quantity: Math.max(product.min_stock * 2 - product.stock, 1),
                    unitCost: product.cost,
                    previousCost: product.cost,
                    stock: product.stock,
                },
            ];
        });
    }

    function update(productId: string, patch: Partial<Line>) {
        setLines(function (prev) {
            return prev.map(function (l) {
                return l.productId === productId ? { ...l, ...patch } : l;
            });
        });
    }

    function submit() {
        setError(null);
        if (lines.length === 0) {
            setError("Agregá al menos un producto.");
            return;
        }
        if (
            lines.some(function (l) {
                return l.unitCost === null;
            })
        ) {
            setError("Completá el costo de todos los productos.");
            return;
        }
        if (!effectiveAccount) {
            setError("Elegí la cuenta con la que pagaste.");
            return;
        }
        startTransition(async function () {
            const result = await createPurchase({
                occurred_at: dateInputToTimestamp(date),
                supplier_id: supplierId || null,
                account_id: effectiveAccount,
                invoice_ref: invoiceRef,
                items: lines.map(function (l) {
                    return { product_id: l.productId, quantity: l.quantity, unit_cost: l.unitCost ?? 0 };
                }),
            });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast.success(`Compra #${result.data.number} registrada · ${formatARS(result.data.total)}`);
            onDone();
        });
    }

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent size="lg">
                <DialogHeader>
                    <DialogTitle>Nueva compra</DialogTitle>
                    <DialogDescription>
                        Suma stock, registra el egreso de mercadería y actualiza el costo (y el precio) de cada
                        producto.
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Proveedor" htmlFor="purchase-supplier" className="sm:col-span-1">
                            <NativeSelect
                                id="purchase-supplier"
                                value={supplierId}
                                onChange={function (e) {
                                    setSupplierId(e.target.value);
                                }}
                            >
                                <option value="">Sin proveedor</option>
                                {(catalog?.suppliers ?? []).map(function (s) {
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    );
                                })}
                            </NativeSelect>
                        </Field>
                        <Field label="Factura / remito" htmlFor="purchase-ref">
                            <Input
                                id="purchase-ref"
                                value={invoiceRef}
                                placeholder="Opcional"
                                onChange={function (e) {
                                    setInvoiceRef(e.target.value);
                                }}
                            />
                        </Field>
                        <Field label="Fecha" htmlFor="purchase-date">
                            <Input
                                id="purchase-date"
                                type="date"
                                value={date}
                                max={todayAR()}
                                onChange={function (e) {
                                    setDate(e.target.value || todayAR());
                                }}
                            />
                        </Field>
                    </div>

                    <SearchSelect
                        options={options}
                        onSelect={add}
                        autoFocus
                        placeholder={catalog ? "Buscar producto o SKU…" : "Cargando catálogo…"}
                        emptyText="No está en el inventario: crealo primero en Inventario."
                    />

                    {lines.length > 0 ? (
                        <div className="overflow-x-auto rounded-md border border-line">
                            <table className="w-full text-sm">
                                <thead className="bg-canvas text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                                    <tr>
                                        <th className="px-2 py-1.5">Producto</th>
                                        <th className="w-20 px-2 py-1.5">Cant.</th>
                                        <th className="w-36 px-2 py-1.5">Costo unit.</th>
                                        <th className="w-28 px-2 py-1.5 text-right">Subtotal</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map(function (line) {
                                        const changed =
                                            line.unitCost !== null && line.unitCost !== line.previousCost;
                                        return (
                                            <tr key={line.productId} className="border-t border-line align-top">
                                                <td className="px-2 py-1.5">
                                                    <p className="font-medium">{line.name}</p>
                                                    <p className="text-xs text-muted">
                                                        Stock {line.stock} · costo anterior {formatARS(line.previousCost)}
                                                        {changed ? (
                                                            <span className="font-semibold text-warning"> · cambia</span>
                                                        ) : null}
                                                    </p>
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        aria-label="Cantidad"
                                                        value={line.quantity}
                                                        onChange={function (e) {
                                                            update(line.productId, {
                                                                quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                                                            });
                                                        }}
                                                        className="h-8 text-right tabular-nums"
                                                    />
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <MoneyInput
                                                        value={line.unitCost}
                                                        aria-label="Costo unitario"
                                                        onValueChange={function (v) {
                                                            update(line.productId, { unitCost: v });
                                                        }}
                                                        className="h-8"
                                                    />
                                                </td>
                                                <td className="px-2 py-1.5 pt-3 text-right font-semibold tabular-nums">
                                                    {formatARS(line.quantity * (line.unitCost ?? 0))}
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Quitar"
                                                        onClick={function () {
                                                            setLines(function (prev) {
                                                                return prev.filter(function (l) {
                                                                    return l.productId !== line.productId;
                                                                });
                                                            });
                                                        }}
                                                    >
                                                        <Trash2Icon />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="rounded-md border border-dashed border-line-strong px-3 py-6 text-center text-sm text-muted">
                            Buscá los productos que llegaron. La cantidad sugerida es la de reposición.
                        </p>
                    )}

                    <div>
                        <Label>Pagado con</Label>
                        <AccountPicker
                            accounts={catalog?.accounts ?? []}
                            value={effectiveAccount}
                            onChange={setAccountId}
                        />
                    </div>

                    {error ? (
                        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                            {error}
                        </p>
                    ) : null}
                </DialogBody>
                <DialogFooter className="justify-between">
                    <p className="text-sm text-muted">
                        Total <span className="ml-1 text-2xl font-bold tabular-nums text-ink">{formatARS(total)}</span>
                    </p>
                    <Button size="lg" onClick={submit} disabled={pending || !catalog}>
                        {pending ? "Registrando…" : "Registrar compra"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
