"use client";

import { MessageCircleIcon, PrinterIcon, Trash2Icon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
    addWorkOrderItem,
    removeWorkOrderItem,
    setWorkOrderStatus,
    updateWorkOrder,
} from "@/app/admin/actions/work-orders";
import { useQuickActions } from "@/components/admin/quick/QuickActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { VoidButton } from "@/components/admin/VoidButton";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/admin/ui/input";
import { Badge, Card, CardHeader } from "@/components/admin/ui/misc";
import { MoneyInput } from "@/components/admin/ui/money-input";
import { SearchSelect, type SearchOption } from "@/components/admin/ui/search-select";
import { cn } from "@/lib/admin/cn";
import { formatDate, formatDateTime } from "@/lib/admin/dates";
import { budgetMessage, readyMessage } from "@/lib/admin/messages";
import { formatARS } from "@/lib/admin/money";
import { whatsAppUrl } from "@/lib/admin/phone";
import { OPEN_STATUSES, statusLabel, type WorkOrderStatus } from "@/lib/admin/types";
import { DeliverDialog } from "./DeliverDialog";

export type EditorItem = {
    id: string;
    kind: "product" | "service" | "free";
    description: string;
    quantity: number;
    unit_price: number;
    unit_cost: number;
    income_category_id: string;
};

type Props = {
    order: {
        id: string;
        number: number;
        status: WorkOrderStatus;
        received_at: string;
        delivered_at: string | null;
        promised_at: string | null;
        problem: string;
        diagnosis: string;
        work_done: string;
        notes: string;
        labor_amount: number;
        budget_amount: number | null;
        final_price: number | null;
        account_name: string | null;
        void_reason: string | null;
        bike_id: string | null;
    };
    customer: { id: string; name: string; phone: string | null };
    bikeText: string;
    bikes: { id: string; label: string }[];
    items: EditorItem[];
    transactions: { id: string; amount: number; voided: boolean; category: string }[];
    tallerCategoryId: string;
    businessName: string;
    businessAddress: string;
    openDeliver: boolean;
};

export function WorkOrderEditor({
    order,
    customer,
    bikeText,
    bikes,
    items,
    transactions,
    tallerCategoryId,
    businessName,
    businessAddress,
    openDeliver,
}: Props) {
    const { catalog, reloadCatalog } = useQuickActions();
    const [pending, startTransition] = useTransition();
    const [deliverOpen, setDeliverOpen] = useState(openDeliver);
    const [freeLine, setFreeLine] = useState<{ description: string; price: number | null } | null>(
        null,
    );
    const isOpen = OPEN_STATUSES.includes(order.status);
    const [labor, setLabor] = useState<number | null>(order.labor_amount);
    const [budget, setBudget] = useState<number | null>(order.budget_amount);

    useEffect(
        function () {
            if (!catalog) reloadCatalog();
        },
        [catalog, reloadCatalog],
    );

    const itemsTotal = items.reduce(function (s, i) {
        return s + i.quantity * i.unit_price;
    }, 0);
    const total = (labor ?? 0) + itemsTotal;

    const options = useMemo<SearchOption[]>(
        function () {
            if (!catalog) return [];
            return [
                ...catalog.services.map(function (s) {
                    return {
                        key: `s:${s.id}`,
                        label: s.name,
                        keywords: "servicio service taller",
                        sublabel: "Servicio",
                        right: formatARS(s.price),
                    };
                }),
                ...catalog.products.map(function (p) {
                    return {
                        key: `p:${p.id}`,
                        label: p.name,
                        keywords: `${p.sku ?? ""} ${p.category ?? ""}`,
                        sublabel: [p.sku, `stock ${p.stock}`].filter(Boolean).join(" · "),
                        right: formatARS(p.price),
                    };
                }),
            ];
        },
        [catalog],
    );

    function save(patch: Parameters<typeof updateWorkOrder>[0]) {
        startTransition(async function () {
            const result = await updateWorkOrder(patch);
            if (!result.ok) toast.error(result.error);
        });
    }

    function addOption(option: SearchOption) {
        const [type, refId] = option.key.split(":");
        startTransition(async function () {
            const result = await addWorkOrderItem({
                work_order_id: order.id,
                item:
                    type === "p"
                        ? { kind: "product", product_id: refId, quantity: 1 }
                        : { kind: "service", service_id: refId, quantity: 1 },
            });
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            if (type === "p") reloadCatalog();
        });
    }

    function addFree() {
        if (!freeLine || !freeLine.description.trim() || freeLine.price === null) {
            toast.error("Completá descripción y precio.");
            return;
        }
        startTransition(async function () {
            const result = await addWorkOrderItem({
                work_order_id: order.id,
                item: {
                    kind: "free",
                    description: freeLine.description,
                    quantity: 1,
                    unit_price: freeLine.price ?? 0,
                },
            });
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            setFreeLine(null);
        });
    }

    function removeItem(item: EditorItem) {
        startTransition(async function () {
            const result = await removeWorkOrderItem({ id: item.id });
            if (!result.ok) toast.error(result.error);
            else if (item.kind === "product") reloadCatalog();
        });
    }

    function changeStatus(status: WorkOrderStatus) {
        startTransition(async function () {
            const result = await setWorkOrderStatus({ id: order.id, status: status as "recibida" });
            if (!result.ok) toast.error(result.error);
            else toast.success(`Orden #${order.number}: ${statusLabel(status)}`);
        });
    }

    const messageData = {
        number: order.number,
        customerName: customer.name,
        bike: bikeText === "Sin bici cargada" ? "bici" : bikeText.split(" — ")[0],
        labor: order.labor_amount,
        items,
        total: order.final_price ?? total,
    };

    return (
        <div className={cn("space-y-4", pending && "cursor-progress")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-display text-2xl font-extrabold uppercase leading-none">
                            Orden #{order.number}
                        </h1>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                        Ingresó {formatDateTime(order.received_at)}
                        {order.delivered_at
                            ? ` · Entregada ${formatDateTime(order.delivered_at)}`
                            : ""}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <a
                        className={buttonVariants({ variant: "secondary" })}
                        href={whatsAppUrl(customer.phone, budgetMessage(messageData, businessName))}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <MessageCircleIcon /> Enviar presupuesto
                    </a>
                    <a
                        className={buttonVariants({ variant: "secondary" })}
                        href={whatsAppUrl(
                            customer.phone,
                            readyMessage(messageData, businessName, businessAddress),
                        )}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <MessageCircleIcon /> Avisar que está lista
                    </a>
                    <a
                        className={buttonVariants({ variant: "secondary" })}
                        href={`/admin/comprobante/${order.id}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <PrinterIcon /> Comprobante
                    </a>
                    {order.status !== "cancelada" ? (
                        <VoidButton kind="workOrder" id={order.id} />
                    ) : null}
                </div>
            </div>

            {order.status === "cancelada" ? (
                <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                    Orden cancelada{order.void_reason ? ` · ${order.void_reason}` : ""}. Los
                    repuestos volvieron al stock.
                </p>
            ) : null}

            {isOpen ? (
                <Card className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">
                            Estado
                        </span>
                        {OPEN_STATUSES.map(function (s) {
                            return (
                                <Button
                                    key={s}
                                    size="sm"
                                    variant={s === order.status ? "default" : "secondary"}
                                    disabled={pending || s === order.status}
                                    onClick={function () {
                                        changeStatus(s);
                                    }}
                                >
                                    {statusLabel(s)}
                                </Button>
                            );
                        })}
                        <Button
                            size="sm"
                            className="ml-auto bg-success hover:bg-success/90"
                            onClick={function () {
                                setDeliverOpen(true);
                            }}
                        >
                            Entregar y cobrar
                        </Button>
                    </div>
                </Card>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card>
                        <CardHeader
                            title="Repuestos y servicios"
                            description="Los repuestos descuentan stock al agregarlos."
                        />
                        <div className="space-y-3 p-3">
                            {isOpen ? (
                                <div className="flex flex-wrap gap-2">
                                    <SearchSelect
                                        options={options}
                                        onSelect={addOption}
                                        className="min-w-64 flex-1"
                                        placeholder={
                                            catalog
                                                ? "Agregar repuesto o servicio…"
                                                : "Cargando catálogo…"
                                        }
                                    />
                                    <Button
                                        variant="secondary"
                                        className="h-10"
                                        onClick={function () {
                                            setFreeLine({ description: "", price: null });
                                        }}
                                    >
                                        + Línea libre
                                    </Button>
                                </div>
                            ) : null}
                            {freeLine ? (
                                <div className="flex flex-wrap items-end gap-2 rounded-md bg-canvas p-2">
                                    <div className="min-w-48 flex-1">
                                        <Label>Descripción</Label>
                                        <Input
                                            autoFocus
                                            value={freeLine.description}
                                            onChange={function (e) {
                                                setFreeLine({
                                                    ...freeLine,
                                                    description: e.target.value,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="w-36">
                                        <Label>Precio</Label>
                                        <MoneyInput
                                            value={freeLine.price}
                                            onValueChange={function (v) {
                                                setFreeLine({ ...freeLine, price: v });
                                            }}
                                        />
                                    </div>
                                    <Button onClick={addFree} disabled={pending}>
                                        Agregar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={function () {
                                            setFreeLine(null);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            ) : null}
                            {items.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted">
                                    Todavía no hay repuestos ni servicios.
                                </p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                                        <tr className="border-b border-line">
                                            <th className="py-1.5">Ítem</th>
                                            <th className="px-2 py-1.5 text-right">Cant.</th>
                                            <th className="px-2 py-1.5 text-right">Precio</th>
                                            <th className="py-1.5 pl-2 text-right">Subtotal</th>
                                            <th className="w-10" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(function (i) {
                                            return (
                                                <tr key={i.id} className="border-b border-line">
                                                    <td className="py-1.5">
                                                        {i.description}
                                                        <span className="ml-1.5 text-xs text-muted">
                                                            {i.kind === "product"
                                                                ? "repuesto"
                                                                : i.kind === "service"
                                                                  ? "servicio"
                                                                  : "libre"}
                                                        </span>
                                                    </td>
                                                    <td className="py-1.5 text-right tabular-nums">
                                                        {i.quantity}
                                                    </td>
                                                    <td className="py-1.5 text-right tabular-nums">
                                                        {formatARS(i.unit_price)}
                                                    </td>
                                                    <td className="whitespace-nowrap py-1.5 pl-2 text-right font-semibold tabular-nums">
                                                        {formatARS(i.quantity * i.unit_price)}
                                                    </td>
                                                    <td className="py-1 text-right">
                                                        {isOpen ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                aria-label={`Quitar ${i.description}`}
                                                                disabled={pending}
                                                                onClick={function () {
                                                                    removeItem(i);
                                                                }}
                                                            >
                                                                <Trash2Icon />
                                                            </Button>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader
                            title="Trabajo"
                            description="Se guarda al salir de cada campo."
                        />
                        <div className="grid gap-3 p-3 md:grid-cols-2">
                            <TextField
                                label="Problema / pedido"
                                value={order.problem}
                                onSave={function (v) {
                                    save({ id: order.id, problem: v });
                                }}
                            />
                            <TextField
                                label="Diagnóstico"
                                value={order.diagnosis}
                                onSave={function (v) {
                                    save({ id: order.id, diagnosis: v });
                                }}
                            />
                            <TextField
                                label="Trabajos realizados"
                                value={order.work_done}
                                onSave={function (v) {
                                    save({ id: order.id, work_done: v });
                                }}
                            />
                            <TextField
                                label="Notas internas"
                                value={order.notes}
                                onSave={function (v) {
                                    save({ id: order.id, notes: v });
                                }}
                            />
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader title="Cliente y bici" />
                        <div className="space-y-2 p-3 text-sm">
                            <Link
                                href={`/admin/clientes/${customer.id}`}
                                className="flex items-center gap-1.5 font-semibold text-primary hover:underline"
                            >
                                <UserIcon className="size-4" />
                                {customer.name}
                            </Link>
                            <p className="text-muted">{customer.phone ?? "Sin teléfono"}</p>
                            {isOpen && bikes.length > 0 ? (
                                <NativeSelect
                                    aria-label="Bici"
                                    defaultValue={order.bike_id ?? ""}
                                    onChange={function (e) {
                                        save({ id: order.id, bike_id: e.target.value || null });
                                    }}
                                >
                                    <option value="">Sin bici</option>
                                    {bikes.map(function (b) {
                                        return (
                                            <option key={b.id} value={b.id}>
                                                {b.label}
                                            </option>
                                        );
                                    })}
                                </NativeSelect>
                            ) : (
                                <p>{bikeText}</p>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Importes" />
                        <div className="space-y-3 p-3 text-sm">
                            <div>
                                <Label>Mano de obra</Label>
                                <MoneyInput
                                    value={labor}
                                    disabled={!isOpen}
                                    onValueChange={setLabor}
                                    onBlur={function () {
                                        if ((labor ?? 0) !== order.labor_amount) {
                                            save({ id: order.id, labor_amount: labor ?? 0 });
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Presupuesto informado</Label>
                                <div className="flex gap-1.5">
                                    <div className="flex-1">
                                        <MoneyInput
                                            value={budget}
                                            disabled={!isOpen}
                                            onValueChange={setBudget}
                                            onBlur={function () {
                                                if (budget !== order.budget_amount) {
                                                    save({ id: order.id, budget_amount: budget });
                                                }
                                            }}
                                        />
                                    </div>
                                    {isOpen ? (
                                        <Button
                                            variant="secondary"
                                            title="Usar el total calculado"
                                            onClick={function () {
                                                setBudget(total);
                                                save({ id: order.id, budget_amount: total });
                                            }}
                                        >
                                            = total
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                            <div>
                                <Label>Prometida para</Label>
                                <Input
                                    type="date"
                                    defaultValue={order.promised_at ?? ""}
                                    disabled={!isOpen}
                                    onBlur={function (e) {
                                        if ((e.target.value || null) !== order.promised_at) {
                                            save({
                                                id: order.id,
                                                promised_at: e.target.value || null,
                                            });
                                        }
                                    }}
                                />
                            </div>
                            <dl className="space-y-1 border-t border-line pt-3">
                                <div className="flex justify-between">
                                    <dt className="text-muted">Repuestos y servicios</dt>
                                    <dd className="tabular-nums">{formatARS(itemsTotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted">Mano de obra</dt>
                                    <dd className="tabular-nums">
                                        {formatARS(order.labor_amount)}
                                    </dd>
                                </div>
                                <div className="flex justify-between text-base font-bold">
                                    <dt>Total calculado</dt>
                                    <dd className="tabular-nums">{formatARS(total)}</dd>
                                </div>
                                {order.final_price !== null ? (
                                    <div className="flex justify-between text-base font-bold text-success">
                                        <dt>Cobrado ({order.account_name})</dt>
                                        <dd className="tabular-nums">
                                            {formatARS(order.final_price)}
                                        </dd>
                                    </div>
                                ) : null}
                            </dl>
                            {order.promised_at ? (
                                <p className="text-xs text-muted">
                                    Prometida para el {formatDate(order.promised_at)}
                                </p>
                            ) : null}
                        </div>
                    </Card>

                    {transactions.length > 0 ? (
                        <Card>
                            <CardHeader title="Ingresos generados" />
                            <ul className="space-y-1 p-3 text-sm">
                                {transactions.map(function (t) {
                                    return (
                                        <li key={t.id} className="flex justify-between">
                                            <span>
                                                {t.category}{" "}
                                                {t.voided ? (
                                                    <Badge tone="danger">anulado</Badge>
                                                ) : null}
                                            </span>
                                            <span className="tabular-nums">
                                                {formatARS(t.amount)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Card>
                    ) : null}
                </div>
            </div>

            {deliverOpen && isOpen ? (
                <DeliverDialog
                    orderId={order.id}
                    number={order.number}
                    items={items}
                    labor={order.labor_amount}
                    total={total}
                    workDone={order.work_done}
                    tallerCategoryId={tallerCategoryId}
                    onClose={function () {
                        setDeliverOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}

function TextField({
    label,
    value,
    onSave,
}: {
    label: string;
    value: string;
    onSave: (v: string) => void;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <Textarea
                defaultValue={value}
                onBlur={function (e) {
                    if (e.target.value !== value) onSave(e.target.value);
                }}
            />
        </div>
    );
}
