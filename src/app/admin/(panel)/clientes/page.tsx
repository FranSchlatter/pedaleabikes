import type { Metadata } from "next";
import Link from "next/link";
import { saveCustomer } from "@/app/admin/actions/contacts";
import { EntityForm } from "@/components/admin/EntityForm";
import { ExportLink } from "@/components/admin/ExportLink";
import { Filters } from "@/components/admin/Filters";
import { Input, Label } from "@/components/admin/ui/input";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { formatDate } from "@/lib/admin/dates";
import { CUSTOMER_FIELDS } from "@/lib/admin/forms";
import { param, type SearchParams } from "@/lib/admin/params";
import { fetchAll } from "@/lib/admin/queries";
import { matches } from "@/lib/admin/search";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Clientes" };

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const q = param(params, "q");
    const db = await getDb();
    const customers = await fetchAll(function (from, to) {
        return db
            .from("customers")
            .select(
                "id, name, phone, email, created_at, bikes(id), work_orders(id, received_at), sales(id)",
            )
            .order("name")
            .range(from, to);
    });
    const rows = q
        ? customers.filter(function (c) {
              return matches(`${c.name} ${c.phone ?? ""} ${c.email ?? ""}`, q);
          })
        : customers;

    return (
        <div>
            <PageHeader
                title="Clientes"
                actions={
                    <>
                        <ExportLink table="customers" />
                        <EntityForm
                            title="Nuevo cliente"
                            triggerLabel="Cliente"
                            fields={CUSTOMER_FIELDS}
                            onSave={saveCustomer}
                            redirectBase="/admin/clientes/"
                        />
                    </>
                }
            />
            <Filters action="/admin/clientes" clearHref="/admin/clientes">
                <div className="min-w-64 flex-1">
                    <Label htmlFor="q">Buscar</Label>
                    <Input
                        id="q"
                        name="q"
                        defaultValue={q}
                        placeholder="Nombre, teléfono o email"
                    />
                </div>
            </Filters>
            <Card>
                {rows.length === 0 ? (
                    <EmptyState
                        title={
                            customers.length
                                ? "Nadie coincide con la búsqueda"
                                : "Todavía no hay clientes"
                        }
                        description="Se crean al vuelo desde + Orden."
                    />
                ) : (
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Cliente</Th>
                                    <Th>Teléfono</Th>
                                    <Th className="text-right">Bicis</Th>
                                    <Th className="text-right">Órdenes</Th>
                                    <Th className="text-right">Compras</Th>
                                    <Th>Última orden</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(function (c) {
                                    const last = c.work_orders
                                        .map(function (w) {
                                            return w.received_at;
                                        })
                                        .sort()
                                        .at(-1);
                                    return (
                                        <Tr key={c.id}>
                                            <Td>
                                                <Link
                                                    href={`/admin/clientes/${c.id}`}
                                                    className="font-semibold text-primary hover:underline"
                                                >
                                                    {c.name}
                                                </Link>
                                            </Td>
                                            <Td className="tabular-nums">{c.phone ?? "—"}</Td>
                                            <Td className="text-right tabular-nums">
                                                {c.bikes.length}
                                            </Td>
                                            <Td className="text-right tabular-nums">
                                                {c.work_orders.length}
                                            </Td>
                                            <Td className="text-right tabular-nums">
                                                {c.sales.length}
                                            </Td>
                                            <Td className="tabular-nums text-muted">
                                                {formatDate(last)}
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
