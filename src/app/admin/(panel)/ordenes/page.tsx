import { LayoutGridIcon, ListIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExportLink } from "@/components/admin/ExportLink";
import { Filters } from "@/components/admin/Filters";
import { OpenQuickButton } from "@/components/admin/OpenQuickButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { KanbanCard } from "@/components/admin/work-orders/KanbanCard";
import { Input, Label, NativeSelect } from "@/components/admin/ui/input";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { addDays, dayBounds, daysSince, formatDate, isValidDate, todayAR } from "@/lib/admin/dates";
import { bikeLabel } from "@/lib/admin/labels";
import { formatARS } from "@/lib/admin/money";
import { param, type SearchParams } from "@/lib/admin/params";
import { normalize } from "@/lib/admin/search";
import { OPEN_STATUSES, WORK_ORDER_STATUSES, type WorkOrderStatus } from "@/lib/admin/types";
import { cn } from "@/lib/admin/cn";

export const metadata: Metadata = { title: "Órdenes de trabajo" };

const SELECT =
    "id, number, status, received_at, delivered_at, promised_at, labor_amount, final_price, budget_amount, problem, customers(name, phone), bikes(brand, model, wheel_size, bike_type, color), work_order_items(quantity, unit_price)";

function orderTotal(o: { labor_amount: number; work_order_items: { quantity: number; unit_price: number }[] }) {
    return (
        Number(o.labor_amount) +
        o.work_order_items.reduce(function (s, i) {
            return s + i.quantity * Number(i.unit_price);
        }, 0)
    );
}

export default async function WorkOrdersPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const view = param(params, "vista") === "lista" ? "lista" : "tablero";
    const db = await getDb();

    const header = (
        <PageHeader
            title="Órdenes de trabajo"
            actions={
                <>
                    <div className="flex rounded-md border border-line-strong bg-surface p-0.5 text-sm font-semibold">
                        <Link
                            href="/admin/ordenes"
                            className={cn(
                                "flex items-center gap-1 rounded px-2.5 py-1.5",
                                view === "tablero" ? "bg-ink text-chalk" : "text-muted hover:text-ink",
                            )}
                        >
                            <LayoutGridIcon className="size-4" /> Tablero
                        </Link>
                        <Link
                            href="/admin/ordenes?vista=lista"
                            className={cn(
                                "flex items-center gap-1 rounded px-2.5 py-1.5",
                                view === "lista" ? "bg-ink text-chalk" : "text-muted hover:text-ink",
                            )}
                        >
                            <ListIcon className="size-4" /> Lista
                        </Link>
                    </div>
                    <ExportLink table="work_orders" />
                    <OpenQuickButton kind="workOrder" label="Orden" />
                </>
            }
        />
    );

    if (view === "tablero") {
        const { data } = await db.from("work_orders").select(SELECT).in("status", OPEN_STATUSES).order("received_at");
        const orders = data ?? [];
        return (
            <div>
                {header}
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {OPEN_STATUSES.map(function (status) {
                        const column = orders.filter(function (o) {
                            return o.status === status;
                        });
                        return (
                            <section key={status} className="flex flex-col rounded-lg border border-line bg-canvas">
                                <header className="flex items-center justify-between border-b border-line bg-surface px-3 py-2 rounded-t-lg">
                                    <StatusBadge status={status} />
                                    <span className="text-sm font-bold tabular-nums">{column.length}</span>
                                </header>
                                <div className="flex flex-1 flex-col gap-2 p-2">
                                    {column.length === 0 ? (
                                        <p className="px-2 py-6 text-center text-xs text-muted">Sin órdenes</p>
                                    ) : (
                                        column.map(function (o) {
                                            return (
                                                <KanbanCard
                                                    key={o.id}
                                                    id={o.id}
                                                    number={o.number}
                                                    status={o.status as WorkOrderStatus}
                                                    customer={o.customers?.name ?? ""}
                                                    bike={bikeLabel(o.bikes)}
                                                    problem={o.problem}
                                                    days={daysSince(o.received_at)}
                                                    promisedAt={o.promised_at}
                                                    total={orderTotal(o)}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        );
    }

    const today = todayAR();
    const status = param(params, "estado");
    const q = param(params, "q");
    const fromDate = isValidDate(param(params, "desde")) ? param(params, "desde")! : addDays(today, -60);
    const toDate = isValidDate(param(params, "hasta")) ? param(params, "hasta")! : today;

    let query = db
        .from("work_orders")
        .select(SELECT)
        .gte("received_at", dayBounds(fromDate).from)
        .lt("received_at", dayBounds(toDate).to)
        .order("number", { ascending: false })
        .limit(500);
    if (status && WORK_ORDER_STATUSES.some(function (s) { return s.value === status; })) {
        query = query.eq("status", status);
    } else if (status === "abiertas") {
        query = query.in("status", OPEN_STATUSES);
    }
    const { data } = await query;
    let orders = data ?? [];
    if (q) {
        const nq = normalize(q);
        orders = orders.filter(function (o) {
            return normalize(
                `${o.number} ${o.customers?.name ?? ""} ${o.customers?.phone ?? ""} ${bikeLabel(o.bikes)} ${o.problem ?? ""}`,
            ).includes(nq);
        });
    }

    return (
        <div>
            {header}
            <Filters action="/admin/ordenes" clearHref="/admin/ordenes?vista=lista">
                <input type="hidden" name="vista" value="lista" />
                <div>
                    <Label htmlFor="q">Buscar</Label>
                    <Input id="q" name="q" defaultValue={q} placeholder="N°, cliente, bici…" />
                </div>
                <div>
                    <Label htmlFor="estado">Estado</Label>
                    <NativeSelect id="estado" name="estado" defaultValue={status ?? ""}>
                        <option value="">Todos</option>
                        <option value="abiertas">Abiertas</option>
                        {WORK_ORDER_STATUSES.map(function (s) {
                            return (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </div>
                <div>
                    <Label htmlFor="desde">Ingreso desde</Label>
                    <Input id="desde" name="desde" type="date" defaultValue={fromDate} />
                </div>
                <div>
                    <Label htmlFor="hasta">Hasta</Label>
                    <Input id="hasta" name="hasta" type="date" defaultValue={toDate} />
                </div>
            </Filters>
            <Card>
                {orders.length === 0 ? (
                    <EmptyState title="No hay órdenes con esos filtros" />
                ) : (
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>#</Th>
                                    <Th>Ingreso</Th>
                                    <Th>Cliente</Th>
                                    <Th>Bici</Th>
                                    <Th>Estado</Th>
                                    <Th>Entrega</Th>
                                    <Th className="text-right">Total</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(function (o) {
                                    return (
                                        <Tr key={o.id}>
                                            <Td>
                                                <Link href={`/admin/ordenes/${o.id}`} className="font-semibold text-primary hover:underline">
                                                    #{o.number}
                                                </Link>
                                            </Td>
                                            <Td className="tabular-nums">{formatDate(o.received_at)}</Td>
                                            <Td>{o.customers?.name}</Td>
                                            <Td className="max-w-56 truncate text-muted">{bikeLabel(o.bikes)}</Td>
                                            <Td>
                                                <StatusBadge status={o.status} />
                                            </Td>
                                            <Td className="tabular-nums">{formatDate(o.delivered_at)}</Td>
                                            <Td className="text-right font-semibold tabular-nums">
                                                {formatARS(o.status === "entregada" ? Number(o.final_price) : orderTotal(o))}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </TableWrap>
                )}
            </Card>
        </div>
    );
}
