import { MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveSupplier } from "@/app/admin/actions/contacts";
import { CopyButton } from "@/components/admin/CopyButton";
import { EntityForm } from "@/components/admin/EntityForm";
import { ExportLink } from "@/components/admin/ExportLink";
import { OpenQuickButton } from "@/components/admin/OpenQuickButton";
import { buttonVariants } from "@/components/admin/ui/button";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { isLowStock } from "@/lib/admin/calc";
import { formatDate } from "@/lib/admin/dates";
import { SUPPLIER_FIELDS } from "@/lib/admin/forms";
import { formatARS } from "@/lib/admin/money";
import { isUuid } from "@/lib/admin/params";
import { whatsAppUrl } from "@/lib/admin/phone";
import { getSettings } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Proveedor" };

export default async function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();
    const db = await getDb();
    const [{ data: s }, { data: products }, { data: reorder }, { data: purchases }, settings] = await Promise.all([
        db.from("suppliers").select("*").eq("id", id).maybeSingle(),
        db
            .from("products")
            .select("id, sku, name, cost, price, stock, min_stock, active")
            .eq("supplier_id", id)
            .order("name"),
        db.from("v_low_stock").select("id, sku, name, stock, min_stock, suggested_quantity, cost").eq("supplier_id", id).order("name"),
        db
            .from("purchases")
            .select("id, number, occurred_at, total, voided_at")
            .eq("supplier_id", id)
            .order("occurred_at", { ascending: false })
            .limit(15),
        getSettings(db),
    ]);
    if (!s) notFound();

    const list = reorder ?? [];
    const reorderText = [
        `Hola${s.contact_name ? ` ${s.contact_name}` : ""}! Te paso el pedido de ${settings.business_name}:`,
        "",
        ...list.map(function (p) {
            return `• ${p.suggested_quantity} × ${p.name}${p.sku ? ` (${p.sku})` : ""}`;
        }),
        "",
        "¡Gracias!",
    ].join("\n");
    const reorderCost = list.reduce(function (sum, p) {
        return sum + Number(p.suggested_quantity) * Number(p.cost);
    }, 0);

    return (
        <div className="space-y-4">
            <PageHeader
                title={s.name}
                description={[s.contact_name, s.phone, s.email].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                actions={
                    <>
                        <OpenQuickButton kind="purchase" label="Compra" supplierId={s.id} variant="secondary" />
                        <EntityForm
                            title="Editar proveedor"
                            triggerLabel="Editar"
                            editing
                            fields={SUPPLIER_FIELDS}
                            initial={s}
                            extra={{ id: s.id }}
                            onSave={saveSupplier}
                        />
                    </>
                }
            />
            {s.terms || s.notes ? (
                <Card className="space-y-1 p-4 text-sm">
                    {s.terms ? (
                        <p>
                            <span className="font-semibold">Condiciones:</span> {s.terms}
                        </p>
                    ) : null}
                    {s.notes ? <p className="whitespace-pre-line text-muted">{s.notes}</p> : null}
                </Card>
            ) : null}

            <Card>
                <CardHeader
                    title={`Lista de reposición (${list.length})`}
                    description="Productos en o por debajo del mínimo. Cantidad sugerida = mínimo × 2 − stock."
                    action={
                        list.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                <CopyButton text={reorderText} label="Copiar pedido" />
                                <a
                                    href={whatsAppUrl(s.phone, reorderText)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={buttonVariants({ variant: "secondary" })}
                                >
                                    <MessageCircleIcon /> WhatsApp
                                </a>
                                <ExportLink table="reorder" query={`proveedor=${s.id}`} />
                            </div>
                        ) : null
                    }
                />
                {list.length === 0 ? (
                    <EmptyState title="Nada para reponer" />
                ) : (
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Producto</Th>
                                    <Th className="text-right">Stock</Th>
                                    <Th className="text-right">Mínimo</Th>
                                    <Th className="text-right">Pedir</Th>
                                    <Th className="text-right">Costo estimado</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map(function (p) {
                                    return (
                                        <Tr key={p.id}>
                                            <Td>
                                                <Link href={`/admin/inventario/${p.id}`} className="hover:underline">
                                                    {p.name}
                                                </Link>
                                                <span className="ml-1 text-xs text-muted">{p.sku}</span>
                                            </Td>
                                            <Td className="text-right tabular-nums">{p.stock}</Td>
                                            <Td className="text-right tabular-nums">{p.min_stock}</Td>
                                            <Td className="text-right font-bold tabular-nums">{p.suggested_quantity}</Td>
                                            <Td className="text-right tabular-nums">
                                                {formatARS(Number(p.suggested_quantity) * Number(p.cost))}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                                <Tr>
                                    <Td colSpan={4} className="text-right font-bold">
                                        Total estimado
                                    </Td>
                                    <Td className="text-right font-bold tabular-nums">{formatARS(reorderCost)}</Td>
                                </Tr>
                            </tbody>
                        </Table>
                    </TableWrap>
                )}
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader title={`Productos (${(products ?? []).length})`} />
                    {(products ?? []).length === 0 ? (
                        <EmptyState title="Sin productos asignados" />
                    ) : (
                        <TableWrap className="max-h-[60dvh]">
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Producto</Th>
                                        <Th className="text-right">Costo</Th>
                                        <Th className="text-right">Precio</Th>
                                        <Th className="text-right">Stock</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(products ?? []).map(function (p) {
                                        return (
                                            <Tr key={p.id} className={p.active ? undefined : "opacity-50"}>
                                                <Td>
                                                    <Link href={`/admin/inventario/${p.id}`} className="hover:underline">
                                                        {p.name}
                                                    </Link>
                                                </Td>
                                                <Td className="text-right tabular-nums">{formatARS(p.cost)}</Td>
                                                <Td className="text-right tabular-nums">{formatARS(p.price)}</Td>
                                                <Td className="text-right tabular-nums">
                                                    {isLowStock(p.stock, p.min_stock) ? (
                                                        <Badge tone="warning">{p.stock}</Badge>
                                                    ) : (
                                                        p.stock
                                                    )}
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
                    <CardHeader title="Últimas compras" />
                    {(purchases ?? []).length === 0 ? (
                        <EmptyState title="Sin compras" />
                    ) : (
                        <ul className="divide-y divide-line text-sm">
                            {(purchases ?? []).map(function (p) {
                                return (
                                    <li key={p.id} className="flex justify-between px-4 py-2">
                                        <Link href={`/admin/compras/${p.id}`} className="hover:underline">
                                            #{p.number} · {formatDate(p.occurred_at)} {p.voided_at ? <Badge tone="danger">anulada</Badge> : null}
                                        </Link>
                                        <span className="tabular-nums">{formatARS(p.total)}</span>
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
