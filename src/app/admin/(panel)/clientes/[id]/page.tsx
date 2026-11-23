import { MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveBike, saveCustomer } from "@/app/admin/actions/contacts";
import { EntityForm } from "@/components/admin/EntityForm";
import { OpenQuickButton } from "@/components/admin/OpenQuickButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { buttonVariants } from "@/components/admin/ui/button";
import { Badge, Card, CardHeader, EmptyState, PageHeader, Stat } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { formatDate } from "@/lib/admin/dates";
import { BIKE_FIELDS, CUSTOMER_FIELDS } from "@/lib/admin/forms";
import { bikeLabel } from "@/lib/admin/labels";
import { formatARS } from "@/lib/admin/money";
import { isUuid } from "@/lib/admin/params";
import { whatsAppUrl } from "@/lib/admin/phone";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Cliente" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();
    const db = await getDb();
    const [{ data: c }, { data: orders }, { data: sales }] = await Promise.all([
        db.from("customers").select("*, bikes(*)").eq("id", id).maybeSingle(),
        db
            .from("work_orders")
            .select(
                "id, number, status, received_at, delivered_at, final_price, problem, bikes(brand, model, wheel_size, bike_type, color)",
            )
            .eq("customer_id", id)
            .order("received_at", { ascending: false }),
        db
            .from("sales")
            .select("id, number, occurred_at, total, voided_at, sale_items(description)")
            .eq("customer_id", id)
            .order("occurred_at", { ascending: false }),
    ]);
    if (!c) notFound();

    const spent =
        (orders ?? []).reduce(function (s, o) {
            return s + (o.status === "entregada" ? Number(o.final_price ?? 0) : 0);
        }, 0) +
        (sales ?? []).reduce(function (s, x) {
            return s + (x.voided_at ? 0 : Number(x.total));
        }, 0);

    return (
        <div className="space-y-4">
            <PageHeader
                title={c.name}
                description={
                    [c.phone, c.email].filter(Boolean).join(" · ") || "Sin datos de contacto"
                }
                actions={
                    <>
                        {c.phone ? (
                            <a
                                href={whatsAppUrl(c.phone, `¡Hola ${c.name.split(" ")[0]}! `)}
                                target="_blank"
                                rel="noreferrer"
                                className={buttonVariants({ variant: "secondary" })}
                            >
                                <MessageCircleIcon /> WhatsApp
                            </a>
                        ) : null}
                        <OpenQuickButton
                            kind="sale"
                            label="Venta"
                            customerId={c.id}
                            variant="secondary"
                        />
                        <OpenQuickButton
                            kind="workOrder"
                            label="Orden"
                            customerId={c.id}
                            variant="secondary"
                        />
                        <EntityForm
                            title="Editar cliente"
                            triggerLabel="Editar"
                            editing
                            fields={CUSTOMER_FIELDS}
                            initial={{
                                name: c.name,
                                phone: c.phone,
                                email: c.email,
                                notes: c.notes,
                            }}
                            extra={{ id: c.id }}
                            onSave={saveCustomer}
                        />
                    </>
                }
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Gastado en total" value={formatARS(spent)} />
                <Stat label="Órdenes" value={(orders ?? []).length} />
                <Stat label="Compras de mostrador" value={(sales ?? []).length} />
                <Stat label="Cliente desde" value={formatDate(c.created_at)} />
            </div>
            {c.notes ? <Card className="p-4 text-sm whitespace-pre-line">{c.notes}</Card> : null}

            <Card>
                <CardHeader
                    title="Bicis"
                    action={
                        <EntityForm
                            title="Nueva bici"
                            triggerLabel="Bici"
                            fields={BIKE_FIELDS}
                            extra={{ customer_id: c.id }}
                            onSave={saveBike}
                        />
                    }
                />
                {c.bikes.length === 0 ? (
                    <EmptyState title="Sin bicis cargadas" />
                ) : (
                    <ul className="divide-y divide-line">
                        {c.bikes.map(function (b) {
                            return (
                                <li
                                    key={b.id}
                                    className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
                                >
                                    <span>
                                        {bikeLabel(b)}
                                        {b.notes ? (
                                            <span className="block text-xs text-muted">
                                                {b.notes}
                                            </span>
                                        ) : null}
                                    </span>
                                    <EntityForm
                                        title="Editar bici"
                                        triggerLabel="Editar"
                                        editing
                                        fields={BIKE_FIELDS}
                                        initial={b}
                                        extra={{ id: b.id, customer_id: c.id }}
                                        onSave={saveBike}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader title="Historial de órdenes" />
                    {(orders ?? []).length === 0 ? (
                        <EmptyState title="Sin órdenes" />
                    ) : (
                        <TableWrap>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>#</Th>
                                        <Th>Ingreso</Th>
                                        <Th>Bici / problema</Th>
                                        <Th>Estado</Th>
                                        <Th className="text-right">Cobrado</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(orders ?? []).map(function (o) {
                                        return (
                                            <Tr key={o.id}>
                                                <Td>
                                                    <Link
                                                        href={`/admin/ordenes/${o.id}`}
                                                        className="font-semibold text-primary hover:underline"
                                                    >
                                                        #{o.number}
                                                    </Link>
                                                </Td>
                                                <Td className="tabular-nums">
                                                    {formatDate(o.received_at)}
                                                </Td>
                                                <Td className="max-w-56 text-xs">
                                                    <div className="truncate">
                                                        {bikeLabel(o.bikes)}
                                                    </div>
                                                    <div className="truncate text-muted">
                                                        {o.problem}
                                                    </div>
                                                </Td>
                                                <Td>
                                                    <StatusBadge status={o.status} />
                                                </Td>
                                                <Td className="text-right tabular-nums">
                                                    {o.final_price !== null &&
                                                    o.status === "entregada"
                                                        ? formatARS(o.final_price)
                                                        : "—"}
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
                    <CardHeader title="Compras de mostrador" />
                    {(sales ?? []).length === 0 ? (
                        <EmptyState title="Sin compras" />
                    ) : (
                        <ul className="divide-y divide-line text-sm">
                            {(sales ?? []).map(function (s) {
                                return (
                                    <li key={s.id} className="flex justify-between gap-3 px-4 py-2">
                                        <Link
                                            href={`/admin/ventas/${s.id}`}
                                            className="min-w-0 truncate hover:underline"
                                        >
                                            #{s.number} · {formatDate(s.occurred_at)} ·{" "}
                                            {s.sale_items
                                                .map(function (i) {
                                                    return i.description;
                                                })
                                                .join(", ")}
                                        </Link>
                                        <span className="shrink-0 tabular-nums">
                                            {s.voided_at ? (
                                                <Badge tone="danger">anulada</Badge>
                                            ) : (
                                                formatARS(s.total)
                                            )}
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
