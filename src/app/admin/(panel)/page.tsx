import type { Metadata } from "next";
import Link from "next/link";
import { QuickButtons } from "@/components/admin/QuickButtons";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardHeader, EmptyState, PageHeader, Stat } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { dayBounds, daysSince, formatDate, formatTime, todayAR } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import { OPEN_STATUSES, WORK_ORDER_STATUSES } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Hoy" };

export default async function TodayPage() {
    const db = await getDb();
    const today = todayAR();
    const { from, to } = dayBounds(today);

    const [txRes, salesRes, deliveredRes, openRes, lowRes, accountsRes] = await Promise.all([
        db
            .from("transactions")
            .select("amount, type, account_id, transaction_categories(name, report_group)")
            .is("voided_at", null)
            .neq("type", "transfer")
            .gte("occurred_at", from)
            .lt("occurred_at", to),
        db
            .from("sales")
            .select("id, number, occurred_at, total, accounts(name), customers(name), sale_items(description)")
            .is("voided_at", null)
            .gte("occurred_at", from)
            .lt("occurred_at", to)
            .order("occurred_at", { ascending: false }),
        db
            .from("work_orders")
            .select("id, number, final_price, delivered_at, customers(name)")
            .eq("status", "entregada")
            .gte("delivered_at", from)
            .lt("delivered_at", to)
            .order("delivered_at", { ascending: false }),
        db
            .from("work_orders")
            .select("id, number, status, received_at, promised_at, customers(name, phone)")
            .in("status", OPEN_STATUSES)
            .order("received_at"),
        db.from("v_low_stock").select("id, name, stock, min_stock, supplier_name").order("stock").limit(12),
        db.from("accounts").select("id, name").order("sort_order"),
    ]);

    const tx = txRes.data ?? [];
    const sales = salesRes.data ?? [];
    const delivered = deliveredRes.data ?? [];
    const open = openRes.data ?? [];
    const low = lowRes.data ?? [];
    const accounts = accountsRes.data ?? [];

    const incomeByAccount = new Map<string, number>();
    let incomeTotal = 0;
    let expenseTotal = 0;
    for (const t of tx) {
        const amount = Number(t.amount);
        if (t.type === "income") {
            incomeTotal += amount;
            incomeByAccount.set(t.account_id, (incomeByAccount.get(t.account_id) ?? 0) + amount);
        } else if (t.transaction_categories?.report_group !== "merchandise") {
            expenseTotal += amount;
        }
    }
    const salesTotal = sales.reduce(function (s, x) {
        return s + Number(x.total);
    }, 0);
    const deliveredTotal = delivered.reduce(function (s, x) {
        return s + Number(x.final_price ?? 0);
    }, 0);

    const byStatus = OPEN_STATUSES.map(function (status) {
        return {
            status,
            label: WORK_ORDER_STATUSES.find(function (s) {
                return s.value === status;
            })!.label,
            orders: open.filter(function (o) {
                return o.status === status;
            }),
        };
    });

    return (
        <div className="space-y-4">
            <PageHeader title="Hoy" description={formatDate(today)} />
            <QuickButtons />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Cobrado hoy" value={formatARS(incomeTotal)} hint="Ventas + órdenes entregadas" />
                <Stat label="Ventas de mostrador" value={formatARS(salesTotal)} hint={`${sales.length} ventas`} />
                <Stat
                    label="Entregadas hoy"
                    value={formatARS(deliveredTotal)}
                    hint={`${delivered.length} órdenes`}
                />
                <Stat label="Gastos de hoy" value={formatARS(expenseTotal)} hint="Sin compras de mercadería" />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card>
                    <CardHeader title="Cobros por medio de pago" />
                    <ul className="divide-y divide-line">
                        {accounts.map(function (a) {
                            const amount = incomeByAccount.get(a.id) ?? 0;
                            return (
                                <li key={a.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <span>{a.name}</span>
                                    <span className={amount ? "font-bold tabular-nums" : "tabular-nums text-muted"}>
                                        {formatARS(amount)}
                                    </span>
                                </li>
                            );
                        })}
                        <li className="flex items-center justify-between bg-canvas px-4 py-2.5 text-sm font-bold">
                            <span>Total</span>
                            <span className="tabular-nums">{formatARS(incomeTotal)}</span>
                        </li>
                    </ul>
                </Card>

                <Card className="xl:col-span-2">
                    <CardHeader
                        title="Órdenes abiertas"
                        action={
                            <Link href="/admin/ordenes" className="text-sm font-semibold text-primary hover:underline">
                                Ver tablero
                            </Link>
                        }
                    />
                    <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
                        {byStatus.map(function (col) {
                            return (
                                <div key={col.status} className="bg-surface p-3">
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={col.status} />
                                        <span className="text-2xl font-bold tabular-nums">{col.orders.length}</span>
                                    </div>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {col.orders.slice(0, 4).map(function (o) {
                                            const days = daysSince(o.received_at);
                                            return (
                                                <li key={o.id}>
                                                    <Link
                                                        href={`/admin/ordenes/${o.id}`}
                                                        className="flex justify-between gap-2 hover:underline"
                                                    >
                                                        <span className="truncate">
                                                            #{o.number} {o.customers?.name}
                                                        </span>
                                                        <span className={days > 5 ? "text-danger" : "text-muted"}>
                                                            {days}d
                                                        </span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                        {col.orders.length > 4 ? (
                                            <li className="text-xs text-muted">y {col.orders.length - 4} más</li>
                                        ) : null}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader
                        title="Ventas de hoy"
                        action={
                            <Link href="/admin/ventas" className="text-sm font-semibold text-primary hover:underline">
                                Ver todas
                            </Link>
                        }
                    />
                    {sales.length === 0 && delivered.length === 0 ? (
                        <EmptyState title="Todavía no hay ventas hoy" description="Usá + Venta (tecla V)." />
                    ) : (
                        <TableWrap>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Hora</Th>
                                        <Th>Detalle</Th>
                                        <Th>Medio</Th>
                                        <Th className="text-right">Total</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map(function (s) {
                                        return (
                                            <Tr key={s.id}>
                                                <Td className="tabular-nums text-muted">{formatTime(s.occurred_at)}</Td>
                                                <Td>
                                                    <Link href={`/admin/ventas/${s.id}`} className="hover:underline">
                                                        <span className="font-semibold">#{s.number}</span>{" "}
                                                        {s.sale_items
                                                            .map(function (i) {
                                                                return i.description;
                                                            })
                                                            .join(", ")}
                                                    </Link>
                                                </Td>
                                                <Td className="text-muted">{s.accounts?.name}</Td>
                                                <Td className="text-right font-semibold tabular-nums">
                                                    {formatARS(s.total)}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                    {delivered.map(function (o) {
                                        return (
                                            <Tr key={o.id}>
                                                <Td className="tabular-nums text-muted">{formatTime(o.delivered_at)}</Td>
                                                <Td>
                                                    <Link href={`/admin/ordenes/${o.id}`} className="hover:underline">
                                                        <span className="font-semibold">OT #{o.number}</span> entregada ·{" "}
                                                        {o.customers?.name}
                                                    </Link>
                                                </Td>
                                                <Td className="text-muted">Taller</Td>
                                                <Td className="text-right font-semibold tabular-nums">
                                                    {formatARS(o.final_price)}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </TableWrap>
                    )}
                </Card>

                <Card>
                    <CardHeader
                        title="Stock bajo"
                        action={
                            <Link
                                href="/admin/inventario?stock=bajo"
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                Ver todo
                            </Link>
                        }
                    />
                    {low.length === 0 ? (
                        <EmptyState title="Nada bajo el mínimo" />
                    ) : (
                        <ul className="divide-y divide-line text-sm">
                            {low.map(function (p) {
                                return (
                                    <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2">
                                        <span className="min-w-0">
                                            <Link href={`/admin/inventario/${p.id}`} className="block truncate hover:underline">
                                                {p.name}
                                            </Link>
                                            <span className="block truncate text-xs text-muted">{p.supplier_name}</span>
                                        </span>
                                        <span
                                            className={
                                                (p.stock ?? 0) <= 0
                                                    ? "shrink-0 font-bold text-danger tabular-nums"
                                                    : "shrink-0 font-bold text-warning tabular-nums"
                                            }
                                        >
                                            {p.stock} / {p.min_stock}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}
