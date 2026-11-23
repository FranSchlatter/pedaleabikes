import type { Metadata } from "next";
import Link from "next/link";
import { ExportLink } from "@/components/admin/ExportLink";
import { Filters } from "@/components/admin/Filters";
import { OpenQuickButton } from "@/components/admin/OpenQuickButton";
import { Input, Label, NativeSelect } from "@/components/admin/ui/input";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { addDays, dayBounds, formatDate, isValidDate, todayAR } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import { isUuid, param, type SearchParams } from "@/lib/admin/params";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Compras" };

export default async function PurchasesPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const db = await getDb();
    const today = todayAR();
    const fromDate = isValidDate(param(params, "desde"))
        ? param(params, "desde")!
        : addDays(today, -90);
    const toDate = isValidDate(param(params, "hasta")) ? param(params, "hasta")! : today;
    const supplier = param(params, "proveedor");

    let query = db
        .from("purchases")
        .select(
            "id, number, occurred_at, total, invoice_ref, voided_at, suppliers(id, name), accounts(name), purchase_items(id)",
        )
        .gte("occurred_at", dayBounds(fromDate).from)
        .lt("occurred_at", dayBounds(toDate).to)
        .order("occurred_at", { ascending: false })
        .limit(500);
    if (isUuid(supplier)) query = query.eq("supplier_id", supplier);

    const [{ data }, { data: suppliers }] = await Promise.all([
        query,
        db.from("suppliers").select("id, name").order("name"),
    ]);
    const rows = data ?? [];
    const total = rows
        .filter(function (p) {
            return !p.voided_at;
        })
        .reduce(function (s, p) {
            return s + Number(p.total);
        }, 0);

    return (
        <div>
            <PageHeader
                title="Compras"
                description="Mercadería que entra al stock. No es gasto del mes: su costo se reconoce cuando se vende."
                actions={
                    <>
                        <ExportLink table="purchases" query={`desde=${fromDate}&hasta=${toDate}`} />
                        <OpenQuickButton kind="purchase" label="Compra" />
                    </>
                }
            />
            <Filters action="/admin/compras" clearHref="/admin/compras">
                <div>
                    <Label htmlFor="desde">Desde</Label>
                    <Input id="desde" name="desde" type="date" defaultValue={fromDate} />
                </div>
                <div>
                    <Label htmlFor="hasta">Hasta</Label>
                    <Input id="hasta" name="hasta" type="date" defaultValue={toDate} />
                </div>
                <div>
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <NativeSelect id="proveedor" name="proveedor" defaultValue={supplier ?? ""}>
                        <option value="">Todos</option>
                        {(suppliers ?? []).map(function (s) {
                            return (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </div>
            </Filters>
            <div className="mb-3 grid grid-cols-2 gap-3 md:w-1/2">
                <Stat label="Comprado en el período" value={formatARS(total)} />
                <Stat
                    label="Compras"
                    value={
                        rows.filter(function (p) {
                            return !p.voided_at;
                        }).length
                    }
                />
            </div>
            <Card>
                {rows.length === 0 ? (
                    <EmptyState
                        title="No hay compras en este período"
                        description="Cargá la mercadería que llega con + Compra (tecla C)."
                    />
                ) : (
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>#</Th>
                                    <Th>Fecha</Th>
                                    <Th>Proveedor</Th>
                                    <Th>Factura</Th>
                                    <Th>Ítems</Th>
                                    <Th>Pagado con</Th>
                                    <Th className="text-right">Total</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(function (p) {
                                    return (
                                        <Tr
                                            key={p.id}
                                            className={p.voided_at ? "text-muted" : undefined}
                                        >
                                            <Td>
                                                <Link
                                                    href={`/admin/compras/${p.id}`}
                                                    className="font-semibold text-primary hover:underline"
                                                >
                                                    #{p.number}
                                                </Link>{" "}
                                                {p.voided_at ? (
                                                    <Badge tone="danger">Anulada</Badge>
                                                ) : null}
                                            </Td>
                                            <Td className="tabular-nums">
                                                {formatDate(p.occurred_at)}
                                            </Td>
                                            <Td>{p.suppliers?.name ?? "—"}</Td>
                                            <Td className="text-muted">{p.invoice_ref ?? "—"}</Td>
                                            <Td className="tabular-nums">
                                                {p.purchase_items.length}
                                            </Td>
                                            <Td>{p.accounts?.name}</Td>
                                            <Td className="text-right font-semibold tabular-nums">
                                                {formatARS(p.total)}
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
