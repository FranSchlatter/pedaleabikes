import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoidButton } from "@/components/admin/VoidButton";
import { Badge, Card, CardHeader, PageHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { formatDateTime } from "@/lib/admin/dates";
import { formatARS, formatPct } from "@/lib/admin/money";
import { isUuid } from "@/lib/admin/params";

export const metadata: Metadata = { title: "Venta" };

const KIND_LABEL: Record<string, string> = {
    product: "Producto",
    service: "Servicio",
    free: "Línea libre",
    commission: "Comisión bici",
};

export default async function SalePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();
    const db = await getDb();
    const { data: sale } = await db
        .from("sales")
        .select(
            "*, accounts(name), customers(id, name, phone), sale_items(*, transaction_categories(name)), transactions(id, amount, voided_at, transaction_categories(name))",
        )
        .eq("id", id)
        .maybeSingle();
    if (!sale) notFound();

    const cost = sale.sale_items.reduce(function (s, i) {
        return s + i.quantity * Number(i.unit_cost);
    }, 0);
    const margin = Number(sale.total) - cost;

    return (
        <div className="max-w-4xl">
            <PageHeader
                title={`Venta #${sale.number}`}
                description={formatDateTime(sale.occurred_at)}
                actions={sale.voided_at ? null : <VoidButton kind="sale" id={sale.id} />}
            />
            {sale.voided_at ? (
                <p className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                    Anulada el {formatDateTime(sale.voided_at)}
                    {sale.void_reason ? ` · ${sale.void_reason}` : ""}
                </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader title="Ítems" />
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Ítem</Th>
                                    <Th className="text-right">Cant.</Th>
                                    <Th className="text-right">Precio</Th>
                                    <Th className="text-right">Costo</Th>
                                    <Th className="text-right">Subtotal</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.sale_items.map(function (i) {
                                    return (
                                        <Tr key={i.id}>
                                            <Td>
                                                {i.product_id ? (
                                                    <Link href={`/admin/inventario/${i.product_id}`} className="hover:underline">
                                                        {i.description}
                                                    </Link>
                                                ) : (
                                                    i.description
                                                )}
                                                <div className="text-xs text-muted">
                                                    {KIND_LABEL[i.kind]} · {i.transaction_categories?.name}
                                                </div>
                                            </Td>
                                            <Td className="text-right tabular-nums">{i.quantity}</Td>
                                            <Td className="text-right tabular-nums">{formatARS(i.unit_price)}</Td>
                                            <Td className="text-right tabular-nums text-muted">{formatARS(i.unit_cost)}</Td>
                                            <Td className="text-right font-semibold tabular-nums">
                                                {formatARS(i.quantity * Number(i.unit_price))}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </TableWrap>
                </Card>
                <Card>
                    <CardHeader title="Resumen" />
                    <dl className="space-y-2 px-4 py-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted">Total</dt>
                            <dd className="text-lg font-bold tabular-nums">{formatARS(sale.total)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted">Costo (congelado)</dt>
                            <dd className="tabular-nums">{formatARS(cost)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted">Margen bruto</dt>
                            <dd className="tabular-nums">
                                {formatARS(margin)} ({formatPct(Number(sale.total) ? margin / Number(sale.total) : null)})
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted">Cobrado en</dt>
                            <dd>{sale.accounts?.name}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted">Cliente</dt>
                            <dd>
                                {sale.customers ? (
                                    <Link href={`/admin/clientes/${sale.customers.id}`} className="text-primary hover:underline">
                                        {sale.customers.name}
                                    </Link>
                                ) : (
                                    "—"
                                )}
                            </dd>
                        </div>
                    </dl>
                    <div className="border-t border-line px-4 py-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Ingresos en caja</p>
                        <ul className="space-y-1 text-sm">
                            {sale.transactions.map(function (t) {
                                return (
                                    <li key={t.id} className="flex justify-between">
                                        <span>
                                            {t.transaction_categories?.name}{" "}
                                            {t.voided_at ? <Badge tone="danger">anulado</Badge> : null}
                                        </span>
                                        <span className="tabular-nums">{formatARS(t.amount)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
}
