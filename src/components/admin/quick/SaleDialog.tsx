"use client";

import { Trash2Icon } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createSale, type SaleInput } from "@/app/admin/actions/sales";
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
import { Input, Label, NativeSelect } from "@/components/admin/ui/input";
import { Badge, Kbd } from "@/components/admin/ui/misc";
import { MoneyInput } from "@/components/admin/ui/money-input";
import { SearchSelect, type SearchOption } from "@/components/admin/ui/search-select";
import { linesTotal } from "@/lib/admin/calc";
import { cn } from "@/lib/admin/cn";
import { dateInputToTimestamp, todayAR } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import type { Catalog } from "@/lib/admin/types";
import { AccountPicker } from "./AccountPicker";
import { CustomerPicker } from "./CustomerPicker";

type Line = {
    uid: string;
    kind: "product" | "service" | "free" | "commission";
    refId?: string;
    description: string;
    quantity: number;
    unitPrice: number | null;
    stock?: number;
    incomeCategoryId?: string;
};

type Props = {
    catalog: Catalog | null;
    customerId?: string;
    onOpenChange: (open: boolean) => void;
    onDone: () => void;
};

let uidCounter = 0;
function uid() {
    uidCounter += 1;
    return `l${uidCounter}`;
}

export function SaleDialog({ catalog, customerId: initialCustomer, onOpenChange, onDone }: Props) {
    const [lines, setLines] = useState<Line[]>([]);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(initialCustomer ?? null);
    const [date, setDate] = useState(todayAR());
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const searchRef = useRef<HTMLInputElement>(null);

    const incomeCategories = useMemo(
        function () {
            return (catalog?.categories ?? []).filter(function (c) {
                return c.type === "income";
            });
        },
        [catalog],
    );

    const options = useMemo<SearchOption[]>(
        function () {
            if (!catalog) return [];
            const products = catalog.products.map(function (p) {
                return {
                    key: `p:${p.id}`,
                    label: p.name,
                    keywords: `${p.sku ?? ""} ${p.category ?? ""}`,
                    sublabel: [p.sku, p.category, `stock ${p.stock}`].filter(Boolean).join(" · "),
                    right: <span className="font-semibold">{formatARS(p.price)}</span>,
                };
            });
            const services = catalog.services.map(function (s) {
                return {
                    key: `s:${s.id}`,
                    label: s.name,
                    keywords: "servicio taller service",
                    sublabel: "Servicio de taller",
                    right: <span className="font-semibold">{formatARS(s.price)}</span>,
                };
            });
            return [...services, ...products];
        },
        [catalog],
    );

    const effectiveAccount = accountId ?? catalog?.accounts[0]?.id ?? null;
    const total = linesTotal(
        lines.map(function (l) {
            return { quantity: l.quantity, unitPrice: l.unitPrice ?? 0 };
        }),
    );

    function addOption(option: SearchOption) {
        if (!catalog) return;
        const [type, id] = option.key.split(":");
        if (type === "p") {
            const product = catalog.products.find(function (p) {
                return p.id === id;
            });
            if (!product) return;
            setLines(function (prev) {
                const existing = prev.find(function (l) {
                    return l.kind === "product" && l.refId === id;
                });
                if (existing) {
                    return prev.map(function (l) {
                        return l === existing ? { ...l, quantity: l.quantity + 1 } : l;
                    });
                }
                return [
                    ...prev,
                    {
                        uid: uid(),
                        kind: "product",
                        refId: id,
                        description: product.name,
                        quantity: 1,
                        unitPrice: product.price,
                        stock: product.stock,
                    },
                ];
            });
        } else {
            const service = catalog.services.find(function (s) {
                return s.id === id;
            });
            if (!service) return;
            setLines(function (prev) {
                return [
                    ...prev,
                    {
                        uid: uid(),
                        kind: "service",
                        refId: id,
                        description: service.name,
                        quantity: 1,
                        unitPrice: service.price || null,
                    },
                ];
            });
        }
        setError(null);
    }

    function addSpecial(kind: "free" | "commission") {
        setLines(function (prev) {
            return [
                ...prev,
                {
                    uid: uid(),
                    kind,
                    description: kind === "commission" ? "Comisión por venta de bicicleta" : "",
                    quantity: 1,
                    unitPrice: null,
                    incomeCategoryId:
                        kind === "free"
                            ? incomeCategories.find(function (c) {
                                  return c.code === "otros";
                              })?.id
                            : undefined,
                },
            ];
        });
    }

    function update(uidValue: string, patch: Partial<Line>) {
        setLines(function (prev) {
            return prev.map(function (l) {
                return l.uid === uidValue ? { ...l, ...patch } : l;
            });
        });
    }

    function remove(uidValue: string) {
        setLines(function (prev) {
            return prev.filter(function (l) {
                return l.uid !== uidValue;
            });
        });
        searchRef.current?.focus();
    }

    function submit() {
        if (pending) return;
        if (lines.length === 0) {
            setError("Agregá al menos un producto o servicio.");
            return;
        }
        const missing = lines.find(function (l) {
            return (
                l.unitPrice === null ||
                (l.kind !== "product" && l.kind !== "service" && !l.description.trim())
            );
        });
        if (missing) {
            setError(
                `Completá el precio y la descripción de "${missing.description || "la línea libre"}".`,
            );
            return;
        }
        if (!effectiveAccount) {
            setError("Elegí el medio de pago.");
            return;
        }
        const items: SaleInput["items"] = lines.map(function (l) {
            const price = l.unitPrice ?? 0;
            switch (l.kind) {
                case "product":
                    return {
                        kind: "product",
                        product_id: l.refId!,
                        quantity: l.quantity,
                        unit_price: price,
                    };
                case "service":
                    return {
                        kind: "service",
                        service_id: l.refId!,
                        quantity: l.quantity,
                        unit_price: price,
                    };
                case "free":
                    return {
                        kind: "free",
                        description: l.description,
                        quantity: l.quantity,
                        unit_price: price,
                        income_category_id: l.incomeCategoryId,
                    };
                default:
                    return {
                        kind: "commission",
                        description: l.description,
                        quantity: 1,
                        unit_price: price,
                    };
            }
        });
        startTransition(async function () {
            const result = await createSale({
                occurred_at: dateInputToTimestamp(date),
                account_id: effectiveAccount,
                customer_id: customerId,
                items,
            });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast.success(
                `Venta #${result.data.number} registrada · ${formatARS(result.data.total)}`,
            );
            onDone();
        });
    }

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent
                size="lg"
                onKeyDown={function (e) {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        submit();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Nueva venta</DialogTitle>
                    <DialogDescription>
                        Buscá y agregá con <Kbd>Enter</Kbd>. Con el buscador vacío, <Kbd>Enter</Kbd>{" "}
                        cobra.
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-4">
                    <SearchSelect
                        options={options}
                        onSelect={addOption}
                        onEmptyEnter={submit}
                        inputRef={searchRef}
                        autoFocus
                        placeholder={catalog ? "Producto, SKU o servicio…" : "Cargando catálogo…"}
                    />

                    {lines.length > 0 ? (
                        <div className="overflow-x-auto rounded-md border border-line">
                            <table className="w-full text-sm">
                                <thead className="bg-canvas text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                                    <tr>
                                        <th className="px-2 py-1.5">Ítem</th>
                                        <th className="w-20 px-2 py-1.5">Cant.</th>
                                        <th className="w-36 px-2 py-1.5">Precio unit.</th>
                                        <th className="w-28 px-2 py-1.5 text-right">Subtotal</th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map(function (line) {
                                        const noStock =
                                            line.kind === "product" &&
                                            line.stock !== undefined &&
                                            line.quantity > line.stock;
                                        return (
                                            <tr
                                                key={line.uid}
                                                className="border-t border-line align-top"
                                            >
                                                <td className="px-2 py-1.5">
                                                    {line.kind === "free" ||
                                                    line.kind === "commission" ? (
                                                        <div className="space-y-1">
                                                            <Input
                                                                value={line.description}
                                                                placeholder="Descripción"
                                                                aria-label="Descripción"
                                                                autoFocus={line.kind === "free"}
                                                                onChange={function (e) {
                                                                    update(line.uid, {
                                                                        description: e.target.value,
                                                                    });
                                                                }}
                                                                className="h-8"
                                                            />
                                                            {line.kind === "free" ? (
                                                                <NativeSelect
                                                                    aria-label="Categoría de ingreso"
                                                                    value={
                                                                        line.incomeCategoryId ?? ""
                                                                    }
                                                                    onChange={function (e) {
                                                                        update(line.uid, {
                                                                            incomeCategoryId:
                                                                                e.target.value,
                                                                        });
                                                                    }}
                                                                    className="h-8 text-xs"
                                                                >
                                                                    {incomeCategories.map(
                                                                        function (c) {
                                                                            return (
                                                                                <option
                                                                                    key={c.id}
                                                                                    value={c.id}
                                                                                >
                                                                                    {c.name}
                                                                                </option>
                                                                            );
                                                                        },
                                                                    )}
                                                                </NativeSelect>
                                                            ) : (
                                                                <Badge tone="primary">
                                                                    Comisión · costo 0
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="font-medium">
                                                                {line.description}
                                                            </p>
                                                            {line.kind === "service" ? (
                                                                <p className="text-xs text-muted">
                                                                    Servicio
                                                                </p>
                                                            ) : (
                                                                <p
                                                                    className={cn(
                                                                        "text-xs text-muted",
                                                                        noStock &&
                                                                            "font-semibold text-warning",
                                                                    )}
                                                                >
                                                                    Stock: {line.stock}
                                                                    {noStock
                                                                        ? " · queda negativo"
                                                                        : ""}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        step={1}
                                                        value={line.quantity}
                                                        disabled={line.kind === "commission"}
                                                        aria-label="Cantidad"
                                                        onChange={function (e) {
                                                            update(line.uid, {
                                                                quantity: Math.max(
                                                                    1,
                                                                    Math.floor(
                                                                        Number(e.target.value) || 1,
                                                                    ),
                                                                ),
                                                            });
                                                        }}
                                                        className="h-8 text-right tabular-nums"
                                                    />
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <MoneyInput
                                                        value={line.unitPrice}
                                                        aria-label="Precio unitario"
                                                        autoFocus={line.kind === "commission"}
                                                        onValueChange={function (v) {
                                                            update(line.uid, { unitPrice: v });
                                                        }}
                                                        className="h-8"
                                                    />
                                                </td>
                                                <td className="px-2 py-1.5 pt-3 text-right font-semibold tabular-nums">
                                                    {formatARS(
                                                        line.quantity * (line.unitPrice ?? 0),
                                                    )}
                                                </td>
                                                <td className="px-1 py-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Quitar"
                                                        onClick={function () {
                                                            remove(line.uid);
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
                            Todavía no hay ítems. Empezá a escribir para buscar.
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={function () {
                                addSpecial("free");
                            }}
                        >
                            + Línea libre
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={function () {
                                addSpecial("commission");
                            }}
                        >
                            + Comisión por venta de bici
                        </Button>
                    </div>

                    <div>
                        <Label>Cobrado en</Label>
                        <AccountPicker
                            accounts={catalog?.accounts ?? []}
                            value={effectiveAccount}
                            onChange={setAccountId}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <div>
                            <Label>Cliente (opcional)</Label>
                            <CustomerPicker
                                customers={catalog?.customers ?? []}
                                value={customerId}
                                onChange={setCustomerId}
                            />
                        </div>
                        <div>
                            <Label htmlFor="sale-date">Fecha</Label>
                            <Input
                                id="sale-date"
                                type="date"
                                value={date}
                                max={todayAR()}
                                onChange={function (e) {
                                    setDate(e.target.value || todayAR());
                                }}
                            />
                        </div>
                    </div>

                    {error ? (
                        <p
                            role="alert"
                            className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
                        >
                            {error}
                        </p>
                    ) : null}
                </DialogBody>
                <DialogFooter className="justify-between">
                    <p className="text-sm text-muted">
                        Total{" "}
                        <span className="ml-1 text-2xl font-bold tabular-nums text-ink">
                            {formatARS(total)}
                        </span>
                    </p>
                    <Button size="lg" onClick={submit} disabled={pending || !catalog}>
                        {pending ? "Registrando…" : `Cobrar ${formatARS(total)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
