import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { EvolutionChart } from "@/components/admin/reports/EvolutionChart";
import { buttonVariants } from "@/components/admin/ui/button";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { monthResult, percentChange } from "@/lib/admin/calc";
import { cn } from "@/lib/admin/cn";
import {
    addMonths,
    currentMonthAR,
    formatMonth,
    isValidMonth,
    monthBounds,
} from "@/lib/admin/dates";
import { formatARS, formatPct } from "@/lib/admin/money";
import { param, type SearchParams } from "@/lib/admin/params";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Reportes" };

type Monthly = {
    month: string;
    revenue: number;
    cogs: number;
    operating_expenses: number;
    merchandise_purchases: number;
    withdrawals: number;
    sales_count: number;
    sales_total: number;
    work_orders_count: number;
    work_orders_total: number;
};

const EMPTY: Omit<Monthly, "month"> = {
    revenue: 0,
    cogs: 0,
    operating_expenses: 0,
    merchandise_purchases: 0,
    withdrawals: 0,
    sales_count: 0,
    sales_total: 0,
    work_orders_count: 0,
    work_orders_total: 0,
};

function Delta({
    current,
    previous,
    invert = false,
}: {
    current: number;
    previous: number;
    invert?: boolean;
}) {
    const change = percentChange(current, previous);
    if (change === null) return <span className="text-muted">sin datos del mes anterior</span>;
    const good = invert ? change <= 0 : change >= 0;
    return (
        <span className={good ? "text-success" : "text-danger"}>
            {change >= 0 ? "▲" : "▼"} {formatPct(Math.abs(change))} vs. mes anterior
        </span>
    );
}

function Kpi({
    label,
    value,
    sub,
    strong,
}: {
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    strong?: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-lg border px-4 py-3",
                strong ? "border-ink bg-ink text-chalk" : "border-line bg-surface",
            )}
        >
            <p
                className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    strong ? "text-steel" : "text-muted",
                )}
            >
                {label}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
            {sub ? <div className="mt-0.5 text-xs">{sub}</div> : null}
        </div>
    );
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const db = await getDb();
    const month = isValidMonth(param(params, "mes")) ? param(params, "mes")! : currentMonthAR();
    const prevMonth = addMonths(month, -1);
    const { first, last } = monthBounds(month);
    const prevBounds = monthBounds(prevMonth);
    const firstOfRange = monthBounds(addMonths(month, -11)).first;

    const [monthlyRes, catRes, prevCatRes, itemsRes] = await Promise.all([
        db.rpc("report_monthly", { p_from: firstOfRange, p_to: last }),
        db.rpc("report_categories", { p_from: first, p_to: last }),
        db.rpc("report_categories", { p_from: prevBounds.first, p_to: prevBounds.last }),
        db.rpc("report_items", { p_from: first, p_to: last }),
    ]);

    const monthly: Monthly[] = (monthlyRes.data ?? []).map(function (m) {
        return {
            month: String(m.month).slice(0, 7),
            revenue: Number(m.revenue),
            cogs: Number(m.cogs),
            operating_expenses: Number(m.operating_expenses),
            merchandise_purchases: Number(m.merchandise_purchases),
            withdrawals: Number(m.withdrawals),
            sales_count: Number(m.sales_count),
            sales_total: Number(m.sales_total),
            work_orders_count: Number(m.work_orders_count),
            work_orders_total: Number(m.work_orders_total),
        };
    });
    function find(m: string): Monthly {
        return (
            monthly.find(function (x) {
                return x.month === m;
            }) ?? { month: m, ...EMPTY }
        );
    }
    const cur = find(month);
    const prev = find(prevMonth);
    const curR = monthResult({
        revenue: cur.revenue,
        cogs: cur.cogs,
        operatingExpenses: cur.operating_expenses,
        withdrawals: cur.withdrawals,
    });
    const prevR = monthResult({
        revenue: prev.revenue,
        cogs: prev.cogs,
        operatingExpenses: prev.operating_expenses,
        withdrawals: prev.withdrawals,
    });
    const ticket = cur.sales_count ? Math.round(cur.sales_total / cur.sales_count) : 0;
    const prevTicket = prev.sales_count ? Math.round(prev.sales_total / prev.sales_count) : 0;

    const evolution = monthly.map(function (m) {
        const r = monthResult({
            revenue: m.revenue,
            cogs: m.cogs,
            operatingExpenses: m.operating_expenses,
            withdrawals: m.withdrawals,
        });
        return {
            month: m.month,
            income: m.revenue,
            expenses: m.cogs + m.operating_expenses,
            result: r.result,
        };
    });

    const cats = catRes.data ?? [];
    const prevCats = prevCatRes.data ?? [];
    function prevTotal(id: string) {
        return Number(
            prevCats.find(function (c) {
                return c.category_id === id;
            })?.total ?? 0,
        );
    }
    const incomeCats = cats.filter(function (c) {
        return c.type === "income";
    });
    const expenseCats = cats.filter(function (c) {
        return c.report_group === "operating";
    });
    const withdrawalCats = cats.filter(function (c) {
        return c.report_group === "withdrawal";
    });

    const items = (itemsRes.data ?? []).map(function (i) {
        return {
            key: `${i.product_id ?? ""}${i.service_id ?? ""}${i.description}`,
            kind: i.kind,
            description: i.description,
            quantity: Number(i.quantity),
            revenue: Number(i.revenue),
            margin: Number(i.revenue) - Number(i.cost),
            productId: i.product_id,
        };
    });
    const products = items.filter(function (i) {
        return i.kind === "product";
    });
    const services = items.filter(function (i) {
        return i.kind === "service" || i.kind === "labor" || i.kind === "free";
    });
    function top<T extends { quantity: number; margin: number }>(
        list: T[],
        by: "quantity" | "margin",
    ) {
        return [...list]
            .sort(function (a, b) {
                return b[by] - a[by];
            })
            .slice(0, 10);
    }

    const hasData = cur.revenue > 0 || cur.operating_expenses > 0 || cur.merchandise_purchases > 0;

    return (
        <div className="space-y-4">
            <PageHeader
                title="Reportes"
                description={`Resultado de ${formatMonth(month)} comparado con ${formatMonth(prevMonth)}.`}
                actions={
                    <div className="flex items-center gap-1">
                        <Link
                            href={`/admin/reportes?mes=${prevMonth}`}
                            className={buttonVariants({ variant: "secondary", size: "icon" })}
                            aria-label="Mes anterior"
                        >
                            <ChevronLeftIcon />
                        </Link>
                        <form action="/admin/reportes" className="flex items-center gap-1">
                            <input
                                type="month"
                                name="mes"
                                defaultValue={month}
                                className="h-9 rounded-md border border-line-strong bg-surface px-2 text-sm"
                                aria-label="Mes"
                            />
                            <button
                                type="submit"
                                className={buttonVariants({ variant: "secondary" })}
                            >
                                Ver
                            </button>
                        </form>
                        <Link
                            href={`/admin/reportes?mes=${addMonths(month, 1)}`}
                            className={buttonVariants({ variant: "secondary", size: "icon" })}
                            aria-label="Mes siguiente"
                        >
                            <ChevronRightIcon />
                        </Link>
                    </div>
                }
            />

            {!hasData ? (
                <Card>
                    <EmptyState
                        title={`Sin movimientos en ${formatMonth(month)}`}
                        description="Elegí otro mes."
                    />
                </Card>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi
                    label="Facturación"
                    value={formatARS(cur.revenue)}
                    sub={<Delta current={cur.revenue} previous={prev.revenue} />}
                />
                <Kpi
                    label="Costo de lo vendido"
                    value={formatARS(cur.cogs)}
                    sub={<span className="text-muted">Costos congelados al vender</span>}
                />
                <Kpi
                    label="Margen bruto"
                    value={
                        <>
                            {formatARS(curR.grossMargin)}{" "}
                            <span className="text-base font-semibold text-muted">
                                {formatPct(curR.grossMarginPct)}
                            </span>
                        </>
                    }
                    sub={<Delta current={curR.grossMargin} previous={prevR.grossMargin} />}
                />
                <Kpi
                    label="Gastos operativos"
                    value={formatARS(cur.operating_expenses)}
                    sub={
                        <Delta
                            current={cur.operating_expenses}
                            previous={prev.operating_expenses}
                            invert
                        />
                    }
                />
                <Kpi
                    label="Resultado del mes"
                    strong
                    value={formatARS(curR.result)}
                    sub={
                        <span className="text-steel">
                            Margen bruto − gastos operativos · {formatPct(curR.resultPct)} de la
                            facturación
                        </span>
                    }
                />
                <Kpi
                    label="Retiros personales"
                    value={formatARS(cur.withdrawals)}
                    sub={
                        <span className="text-muted">
                            Aparte. Después de retiros: {formatARS(curR.afterWithdrawals)}
                        </span>
                    }
                />
                <Kpi
                    label="Ticket promedio (mostrador)"
                    value={formatARS(ticket)}
                    sub={<Delta current={ticket} previous={prevTicket} />}
                />
                <Kpi
                    label="Ventas · órdenes entregadas"
                    value={`${cur.sales_count} · ${cur.work_orders_count}`}
                    sub={
                        <span className="text-muted">
                            Mes anterior: {prev.sales_count} · {prev.work_orders_count}
                        </span>
                    }
                />
            </div>

            <Card className="flex gap-3 border-primary/30 bg-info-soft p-4 text-sm">
                <InfoIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                    <p>
                        <b>Compras de mercadería del mes: {formatARS(cur.merchandise_purchases)}</b>{" "}
                        (mes anterior {formatARS(prev.merchandise_purchases)}).
                    </p>
                    <p className="text-muted">
                        No son gasto del mes: esa plata pasa a ser stock, y su costo se reconoce
                        recién cuando se vende (en “Costo de lo vendido”). Por eso el resultado
                        puede ser bueno en un mes de mucha compra.
                    </p>
                </div>
            </Card>

            <Card>
                <CardHeader
                    title="Últimos 12 meses"
                    description="Ingresos, egresos (costo de lo vendido + gastos operativos) y resultado."
                />
                <div className="p-3">
                    <EvolutionChart data={evolution} />
                </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <CategoryTable
                    title="Ingresos por categoría"
                    rows={incomeCats}
                    total={cur.revenue}
                    prevTotal={prevTotal}
                />
                <div className="space-y-4">
                    <CategoryTable
                        title="Gastos operativos por categoría"
                        rows={expenseCats}
                        total={cur.operating_expenses}
                        prevTotal={prevTotal}
                        invert
                    />
                    {withdrawalCats.length > 0 ? (
                        <CategoryTable
                            title="Retiros (fuera del resultado)"
                            rows={withdrawalCats}
                            total={cur.withdrawals}
                            prevTotal={prevTotal}
                            invert
                        />
                    ) : null}
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <RankingTable
                    title="Productos más vendidos (cantidad)"
                    rows={top(products, "quantity")}
                />
                <RankingTable
                    title="Productos que más margen dejaron"
                    rows={top(products, "margin")}
                />
                <RankingTable
                    title="Servicios y mano de obra (cantidad)"
                    rows={top(services, "quantity")}
                />
                <RankingTable
                    title="Servicios y mano de obra (margen)"
                    rows={top(services, "margin")}
                />
            </div>
        </div>
    );
}

function CategoryTable({
    title,
    rows,
    total,
    prevTotal,
    invert = false,
}: {
    title: string;
    rows: { category_id: string; name: string; total: number }[];
    total: number;
    prevTotal: (id: string) => number;
    invert?: boolean;
}) {
    return (
        <Card>
            <CardHeader title={title} />
            {rows.length === 0 ? (
                <EmptyState title="Sin movimientos" />
            ) : (
                <TableWrap>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Categoría</Th>
                                <Th className="text-right">Monto</Th>
                                <Th className="w-28">%</Th>
                                <Th className="text-right">Mes ant.</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(function (r) {
                                const value = Number(r.total);
                                const pct = total ? value / total : 0;
                                const prev = prevTotal(r.category_id);
                                const change = percentChange(value, prev);
                                return (
                                    <Tr key={r.category_id}>
                                        <Td>{r.name}</Td>
                                        <Td className="text-right font-semibold tabular-nums">
                                            {formatARS(value)}
                                        </Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 flex-1 rounded bg-canvas">
                                                    <div
                                                        className="h-2 rounded bg-primary"
                                                        style={{ width: `${pct * 100}%` }}
                                                    />
                                                </div>
                                                <span className="w-9 text-right text-xs tabular-nums text-muted">
                                                    {formatPct(pct)}
                                                </span>
                                            </div>
                                        </Td>
                                        <Td className="text-right text-xs tabular-nums">
                                            <span className="text-muted">{formatARS(prev)}</span>
                                            {change !== null ? (
                                                <span
                                                    className={cn(
                                                        "ml-1",
                                                        (invert ? change <= 0 : change >= 0)
                                                            ? "text-success"
                                                            : "text-danger",
                                                    )}
                                                >
                                                    {change >= 0 ? "▲" : "▼"}
                                                </span>
                                            ) : null}
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </TableWrap>
            )}
        </Card>
    );
}

function RankingTable({
    title,
    rows,
}: {
    title: string;
    rows: {
        key: string;
        description: string;
        quantity: number;
        revenue: number;
        margin: number;
        productId: string | null;
    }[];
}) {
    return (
        <Card>
            <CardHeader title={title} />
            {rows.length === 0 ? (
                <EmptyState title="Sin ventas en el mes" />
            ) : (
                <TableWrap>
                    <Table>
                        <thead>
                            <tr>
                                <Th>#</Th>
                                <Th>Ítem</Th>
                                <Th className="text-right">Cant.</Th>
                                <Th className="text-right">Facturado</Th>
                                <Th className="text-right">Margen</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(function (r, i) {
                                return (
                                    <Tr key={r.key}>
                                        <Td className="text-muted tabular-nums">{i + 1}</Td>
                                        <Td className="max-w-64 truncate">
                                            {r.productId ? (
                                                <Link
                                                    href={`/admin/inventario/${r.productId}`}
                                                    className="hover:underline"
                                                >
                                                    {r.description}
                                                </Link>
                                            ) : (
                                                r.description
                                            )}
                                        </Td>
                                        <Td className="text-right tabular-nums">{r.quantity}</Td>
                                        <Td className="text-right tabular-nums">
                                            {formatARS(r.revenue)}
                                        </Td>
                                        <Td className="text-right font-semibold tabular-nums">
                                            {formatARS(r.margin)}
                                            <span className="ml-1 text-xs font-normal text-muted">
                                                {formatPct(r.revenue ? r.margin / r.revenue : null)}
                                            </span>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </TableWrap>
            )}
        </Card>
    );
}
