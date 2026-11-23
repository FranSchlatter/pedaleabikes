import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoidButton } from "@/components/admin/VoidButton";
import { Card, CardHeader, PageHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { formatDateTime } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import { isUuid } from "@/lib/admin/params";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Compra" };

export default async function PurchasePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();
    const db = await getDb();
    const { data: p } = await db
        .from("purchases")
        .select("*, suppliers(id, name), accounts(name), purchase_items(*)")
        .eq("id", id)
        .maybeSingle();
    if (!p) notFound();

    return (
        <div className="max-w-4xl">
            <PageHeader
                title={`Compra #${p.number}`}
                description={`${formatDateTime(p.occurred_at)} · ${p.suppliers?.name ?? "Sin proveedor"}${p.invoice_ref ? ` · ${p.invoice_ref}` : ""}`}
                actions={p.voided_at ? null : <VoidButton kind="purchase" id={p.id} />}
            />
            {p.voided_at ? (
                <p className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                    Anulada el {formatDateTime(p.voided_at)}
                    {p.void_reason ? ` · ${p.void_reason}` : ""}
                </p>
            ) : null}
            <Card>
                <CardHeader title="Productos" description={`Pagado con ${p.accounts?.name}`} />
                <TableWrap>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Producto</Th>
                                <Th className="text-right">Cant.</Th>
                                <Th className="text-right">Costo anterior</Th>
                                <Th className="text-right">Costo unit.</Th>
                                <Th className="text-right">Subtotal</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {p.purchase_items.map(function (i) {
                                return (
                                    <Tr key={i.id}>
                                        <Td>
                                            <Link
                                                href={`/admin/inventario/${i.product_id}`}
                                                className="hover:underline"
                                            >
                                                {i.description}
                                            </Link>
                                        </Td>
                                        <Td className="text-right tabular-nums">{i.quantity}</Td>
                                        <Td className="text-right tabular-nums text-muted">
                                            {i.previous_cost === null
                                                ? "—"
                                                : formatARS(i.previous_cost)}
                                        </Td>
                                        <Td className="text-right tabular-nums">
                                            {formatARS(i.unit_cost)}
                                        </Td>
                                        <Td className="text-right font-semibold tabular-nums">
                                            {formatARS(i.quantity * Number(i.unit_cost))}
                                        </Td>
                                    </Tr>
                                );
                            })}
                            <Tr>
                                <Td colSpan={4} className="text-right font-bold">
                                    Total
                                </Td>
                                <Td className="text-right text-base font-bold tabular-nums">
                                    {formatARS(p.total)}
                                </Td>
                            </Tr>
                        </tbody>
                    </Table>
                </TableWrap>
            </Card>
        </div>
    );
}
