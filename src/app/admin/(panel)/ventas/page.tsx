import type { Metadata } from "next";
import Link from "next/link";
import { ExportLink } from "@/components/admin/ExportLink";
import { Filters } from "@/components/admin/Filters";
import { Card, EmptyState, PageHeader, Badge, Stat } from "@/components/admin/ui/misc";
import { Input, Label, NativeSelect } from "@/components/admin/ui/input";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { addDays, dayBounds, formatDateTime, isValidDate, todayAR } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import { isUuid, param, type SearchParams } from "@/lib/admin/params";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Ventas" };

export default async function SalesPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const db = await getDb();
    const today = todayAR();
    const fromDate = isValidDate(param(params, "desde"))
        ? param(params, "desde")!
        : addDays(today, -30);
    const toDate = isValidDate(param(params, "hasta")) ? param(params, "hasta")! : today;
    const account = param(params, "cuenta");
    const showVoided = param(params, "anuladas") === "1";

    let query = db
        .from("sales")
        .select(
            "id, number, occurred_at, total, voided_at, accounts(name), customers(name), sale_items(description, quantity)",
        )
        .gte("occurred_at", dayBounds(fromDate).from)
        .lt("occurred_at", dayBounds(toDate).to)
        .order("occurred_at", { ascending: false })
        .limit(500);
    if (isUuid(account)) query = query.eq("account_id", account);
    if (!showVoided) query = query.is("voided_at", null);

    const [{ data: sales }, { data: accounts }] = await Promise.all([
        query,
        db.from("accounts").select("id, name").order("sort_order"),
    ]);
    const rows = sales ?? [];
    const valid = rows.filter(function (s) {
        return !s.voided_at;
    });
    const total = valid.reduce(function (sum, s) {
        return sum + Number(s.total);
    }, 0);

    return (
        <div>
            <PageHeader
                title="Ventas"
                description="Ventas de mostrador. Las órdenes de trabajo se cobran desde Órdenes."
                actions={<ExportLink table="sales" query={`desde=${fromDate}&hasta=${toDate}`} />}
            />
            <Filters action="/admin/ventas" clearHref="/admin/ventas">
                <div>
                    <Label htmlFor="desde">Desde</Label>
                    <Input id="desde" name="desde" type="date" defaultValue={fromDate} />
                </div>
                <div>
                    <Label htmlFor="hasta">Hasta</Label>
                    <Input id="hasta" name="hasta" type="date" defaultValue={toDate} />
                </div>
                <div>
                    <Label htmlFor="cuenta">Medio de pago</Label>
                    <NativeSelect id="cuenta" name="cuenta" defaultValue={account ?? ""}>
                        <option value="">Todos</option>
                        {(accounts ?? []).map(function (a) {
                            return (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </div>
                <label className="flex h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="anuladas" value="1" defaultChecked={showVoided} />
                    Mostrar anuladas
                </label>
            </Filters>

            <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                <Stat label="Total del período" value={formatARS(total)} />
                <Stat label="Cantidad" value={valid.length} />
                <Stat
                    label="Ticket promedio"
                    value={formatARS(valid.length ? Math.round(total / valid.length) : 0)}
                />
            </div>

            <Card>
                {rows.length === 0 ? (
                    <EmptyState
                        title="No hay ventas en este período"
                        description="Probá con otras fechas."
                    />
                ) : (
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>#</Th>
                                    <Th>Fecha</Th>
                                    <Th>Detalle</Th>
                                    <Th>Cliente</Th>
                                    <Th>Medio</Th>
                                    <Th className="text-right">Total</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(function (s) {
                                    return (
                                        <Tr
                                            key={s.id}
                                            className={
                                                s.voided_at ? "text-muted line-through" : undefined
                                            }
                                        >
                                            <Td>
                                                <Link
                                                    href={`/admin/ventas/${s.id}`}
                                                    className="font-semibold text-primary hover:underline"
                                                >
                                                    #{s.number}
                                                </Link>
                                            </Td>
                                            <Td className="whitespace-nowrap tabular-nums">
                                                {formatDateTime(s.occurred_at)}
                                            </Td>
                                            <Td className="max-w-md truncate">
                                                {s.voided_at ? (
                                                    <Badge
                                                        tone="danger"
                                                        className="mr-1 no-underline"
                                                    >
                                                        Anulada
                                                    </Badge>
                                                ) : null}
                                                {s.sale_items
                                                    .map(function (i) {
                                                        return i.quantity > 1
                                                            ? `${i.quantity}× ${i.description}`
                                                            : i.description;
                                                    })
                                                    .join(", ")}
                                            </Td>
                                            <Td>{s.customers?.name ?? "—"}</Td>
                                            <Td>{s.accounts?.name}</Td>
                                            <Td className="text-right font-semibold tabular-nums">
                                                {formatARS(s.total)}
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
