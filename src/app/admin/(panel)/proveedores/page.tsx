import type { Metadata } from "next";
import Link from "next/link";
import { saveSupplier } from "@/app/admin/actions/contacts";
import { EntityForm } from "@/components/admin/EntityForm";
import { ExportLink } from "@/components/admin/ExportLink";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { SUPPLIER_FIELDS } from "@/lib/admin/forms";
import { formatARS } from "@/lib/admin/money";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Proveedores" };

export default async function SuppliersPage() {
    const db = await getDb();
    const [{ data: suppliers }, { data: low }, { data: products }] = await Promise.all([
        db.from("suppliers").select("*").order("name"),
        db.from("v_low_stock").select("supplier_id"),
        db.from("products").select("supplier_id, stock, cost").eq("active", true),
    ]);
    const lowBy = new Map<string, number>();
    for (const l of low ?? []) {
        if (l.supplier_id) lowBy.set(l.supplier_id, (lowBy.get(l.supplier_id) ?? 0) + 1);
    }
    const stats = new Map<string, { count: number; value: number }>();
    for (const p of products ?? []) {
        if (!p.supplier_id) continue;
        const s = stats.get(p.supplier_id) ?? { count: 0, value: 0 };
        s.count += 1;
        s.value += Math.max(p.stock, 0) * Number(p.cost);
        stats.set(p.supplier_id, s);
    }

    return (
        <div>
            <PageHeader
                title="Proveedores"
                actions={
                    <>
                        <ExportLink table="suppliers" />
                        <EntityForm
                            title="Nuevo proveedor"
                            triggerLabel="Proveedor"
                            fields={SUPPLIER_FIELDS}
                            onSave={saveSupplier}
                            redirectBase="/admin/proveedores/"
                        />
                    </>
                }
            />
            <Card>
                {(suppliers ?? []).length === 0 ? (
                    <EmptyState
                        title="Todavía no hay proveedores"
                        description="Se crean solos al importar el Excel, o cargalos acá."
                    />
                ) : (
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Proveedor</Th>
                                    <Th>Contacto</Th>
                                    <Th>Condiciones</Th>
                                    <Th className="text-right">Productos</Th>
                                    <Th className="text-right">Valor en stock</Th>
                                    <Th className="text-right">A reponer</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {(suppliers ?? []).map(function (s) {
                                    const st = stats.get(s.id);
                                    const lowCount = lowBy.get(s.id) ?? 0;
                                    return (
                                        <Tr
                                            key={s.id}
                                            className={s.active ? undefined : "opacity-50"}
                                        >
                                            <Td>
                                                <Link
                                                    href={`/admin/proveedores/${s.id}`}
                                                    className="font-semibold text-primary hover:underline"
                                                >
                                                    {s.name}
                                                </Link>
                                                {!s.active ? (
                                                    <Badge className="ml-1">inactivo</Badge>
                                                ) : null}
                                            </Td>
                                            <Td className="text-sm">
                                                {s.contact_name ?? "—"}
                                                <div className="text-xs text-muted">{s.phone}</div>
                                            </Td>
                                            <Td className="max-w-64 truncate text-sm text-muted">
                                                {s.terms ?? "—"}
                                            </Td>
                                            <Td className="text-right tabular-nums">
                                                {st?.count ?? 0}
                                            </Td>
                                            <Td className="text-right tabular-nums">
                                                {formatARS(st?.value ?? 0)}
                                            </Td>
                                            <Td className="text-right">
                                                {lowCount ? (
                                                    <Badge tone="warning">{lowCount}</Badge>
                                                ) : (
                                                    <span className="text-muted">—</span>
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
        </div>
    );
}
