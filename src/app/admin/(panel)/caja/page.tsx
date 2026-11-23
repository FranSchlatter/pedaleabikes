import type { Metadata } from "next";
import Link from "next/link";
import { ExportLink } from "@/components/admin/ExportLink";
import { ShowMore } from "@/components/admin/ShowMore";
import { Filters } from "@/components/admin/Filters";
import { OpenQuickButton } from "@/components/admin/OpenQuickButton";
import { VoidButton } from "@/components/admin/VoidButton";
import { Input, Label, NativeSelect } from "@/components/admin/ui/input";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { accountBalance } from "@/lib/admin/calc";
import { cn } from "@/lib/admin/cn";
import { addDays, dayBounds, formatDateTime, isValidDate, todayAR } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import { isUuid, limitParam, param, type SearchParams } from "@/lib/admin/params";
import { fetchAll } from "@/lib/admin/queries";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Caja" };

const TYPE_LABEL: Record<string, string> = {
    income: "Ingreso",
    expense: "Egreso",
    transfer: "Transferencia",
};

export default async function CashPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const db = await getDb();
    const today = todayAR();
    const fromDate = isValidDate(param(params, "desde"))
        ? param(params, "desde")!
        : addDays(today, -30);
    const toDate = isValidDate(param(params, "hasta")) ? param(params, "hasta")! : today;
    const type = param(params, "tipo");
    const category = param(params, "categoria");
    const account = param(params, "cuenta");
    const showVoided = param(params, "anulados") === "1";
    const limit = limitParam(params, 300);

    const [{ data: balances }, { data: categories }, transactions] = await Promise.all([
        db.from("v_account_balances").select("*").order("sort_order"),
        db
            .from("transaction_categories")
            .select("id, name, type")
            .order("type")
            .order("sort_order"),
        fetchAll(function (from, to) {
            let q = db
                .from("transactions")
                .select(
                    "id, occurred_at, type, amount, description, voided_at, sale_id, purchase_id, work_order_id, account_id, to_account_id, category_id, transaction_categories(name, report_group), accounts!transactions_account_id_fkey(name), to:accounts!transactions_to_account_id_fkey(name), suppliers(name)",
                )
                .gte("occurred_at", dayBounds(fromDate).from)
                .lt("occurred_at", dayBounds(toDate).to)
                .order("occurred_at", { ascending: false })
                .range(from, to);
            if (type === "income" || type === "expense" || type === "transfer")
                q = q.eq("type", type);
            if (isUuid(category)) q = q.eq("category_id", category);
            if (isUuid(account)) q = q.or(`account_id.eq.${account},to_account_id.eq.${account}`);
            if (!showVoided) q = q.is("voided_at", null);
            return q;
        }),
    ]);

    let income = 0;
    let expense = 0;
    for (const t of transactions) {
        if (t.voided_at) continue;
        if (t.type === "income") income += Number(t.amount);
        if (t.type === "expense") expense += Number(t.amount);
    }
    const accountsList = balances ?? [];
    const total = accountsList.reduce(function (s, a) {
        return (
            s +
            accountBalance({
                initial_balance: Number(a.initial_balance),
                income: Number(a.income),
                expense: Number(a.expense),
                transfer_in: Number(a.transfer_in),
                transfer_out: Number(a.transfer_out),
            })
        );
    }, 0);

    function origin(t: (typeof transactions)[number]) {
        if (t.sale_id) return { href: `/admin/ventas/${t.sale_id}`, label: "Venta" };
        if (t.purchase_id) return { href: `/admin/compras/${t.purchase_id}`, label: "Compra" };
        if (t.work_order_id) return { href: `/admin/ordenes/${t.work_order_id}`, label: "Orden" };
        return null;
    }

    return (
        <div>
            <PageHeader
                title="Caja"
                actions={
                    <>
                        <ExportLink
                            table="transactions"
                            query={`desde=${fromDate}&hasta=${toDate}`}
                        />
                        <OpenQuickButton
                            kind="expense"
                            expenseType="transfer"
                            label="Transferencia"
                            variant="secondary"
                        />
                        <OpenQuickButton
                            kind="expense"
                            expenseType="income"
                            label="Ingreso"
                            variant="secondary"
                        />
                        <OpenQuickButton kind="expense" expenseType="expense" label="Gasto" />
                    </>
                }
            />

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                {accountsList.map(function (a) {
                    const balance = accountBalance({
                        initial_balance: Number(a.initial_balance),
                        income: Number(a.income),
                        expense: Number(a.expense),
                        transfer_in: Number(a.transfer_in),
                        transfer_out: Number(a.transfer_out),
                    });
                    return (
                        <Stat
                            key={a.id}
                            label={a.name ?? ""}
                            value={formatARS(balance)}
                            tone={balance < 0 ? "negative" : undefined}
                            hint={`Inicial ${formatARS(a.initial_balance)}`}
                        />
                    );
                })}
                <Stat
                    label="Total en cuentas"
                    value={formatARS(total)}
                    className="border-ink bg-ink text-chalk [&_p]:text-chalk"
                />
            </div>

            <Filters action="/admin/caja" clearHref="/admin/caja">
                <div>
                    <Label htmlFor="desde">Desde</Label>
                    <Input id="desde" name="desde" type="date" defaultValue={fromDate} />
                </div>
                <div>
                    <Label htmlFor="hasta">Hasta</Label>
                    <Input id="hasta" name="hasta" type="date" defaultValue={toDate} />
                </div>
                <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <NativeSelect id="tipo" name="tipo" defaultValue={type ?? ""}>
                        <option value="">Todos</option>
                        <option value="income">Ingresos</option>
                        <option value="expense">Egresos</option>
                        <option value="transfer">Transferencias</option>
                    </NativeSelect>
                </div>
                <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <NativeSelect id="categoria" name="categoria" defaultValue={category ?? ""}>
                        <option value="">Todas</option>
                        <optgroup label="Ingresos">
                            {(categories ?? [])
                                .filter(function (c) {
                                    return c.type === "income";
                                })
                                .map(function (c) {
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    );
                                })}
                        </optgroup>
                        <optgroup label="Egresos">
                            {(categories ?? [])
                                .filter(function (c) {
                                    return c.type === "expense";
                                })
                                .map(function (c) {
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    );
                                })}
                        </optgroup>
                    </NativeSelect>
                </div>
                <div>
                    <Label htmlFor="cuenta">Cuenta</Label>
                    <NativeSelect id="cuenta" name="cuenta" defaultValue={account ?? ""}>
                        <option value="">Todas</option>
                        {accountsList.map(function (a) {
                            return (
                                <option key={a.id} value={a.id ?? ""}>
                                    {a.name}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </div>
                <label className="flex h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="anulados" value="1" defaultChecked={showVoided} />
                    Ver anulados
                </label>
            </Filters>

            <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat label="Ingresos del período" value={formatARS(income)} tone="positive" />
                <Stat
                    label="Egresos del período"
                    value={formatARS(expense)}
                    tone="negative"
                    hint="Incluye compras de mercadería"
                />
                <Stat label="Neto" value={formatARS(income - expense)} />
            </div>

            <Card>
                {transactions.length === 0 ? (
                    <EmptyState title="No hay movimientos con esos filtros" />
                ) : (
                    <TableWrap className="max-h-[70dvh]">
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Fecha</Th>
                                    <Th>Tipo</Th>
                                    <Th>Categoría</Th>
                                    <Th>Cuenta</Th>
                                    <Th>Descripción</Th>
                                    <Th className="text-right">Monto</Th>
                                    <Th />
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.slice(0, limit).map(function (t) {
                                    const o = origin(t);
                                    return (
                                        <Tr
                                            key={t.id}
                                            className={
                                                t.voided_at ? "text-muted line-through" : undefined
                                            }
                                        >
                                            <Td className="whitespace-nowrap tabular-nums">
                                                {formatDateTime(t.occurred_at)}
                                            </Td>
                                            <Td>
                                                <Badge
                                                    tone={
                                                        t.type === "income"
                                                            ? "success"
                                                            : t.type === "expense"
                                                              ? "danger"
                                                              : "neutral"
                                                    }
                                                >
                                                    {TYPE_LABEL[t.type]}
                                                </Badge>
                                            </Td>
                                            <Td>{t.transaction_categories?.name ?? "—"}</Td>
                                            <Td className="whitespace-nowrap">
                                                {t.accounts?.name}
                                                {t.type === "transfer" ? ` → ${t.to?.name}` : ""}
                                            </Td>
                                            <Td className="max-w-72 truncate">
                                                {o ? (
                                                    <Link
                                                        href={o.href}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {t.description ?? o.label}
                                                    </Link>
                                                ) : (
                                                    (t.description ?? "—")
                                                )}
                                                {t.suppliers?.name && !o ? (
                                                    <span className="text-muted">
                                                        {" "}
                                                        · {t.suppliers.name}
                                                    </span>
                                                ) : null}
                                            </Td>
                                            <Td
                                                className={cn(
                                                    "text-right font-semibold tabular-nums",
                                                    t.type === "income" && "text-success",
                                                    t.type === "expense" && "text-danger",
                                                )}
                                            >
                                                {t.type === "expense"
                                                    ? "−"
                                                    : t.type === "income"
                                                      ? "+"
                                                      : ""}
                                                {formatARS(t.amount)}
                                            </Td>
                                            <Td className="text-right">
                                                {!o && !t.voided_at ? (
                                                    <VoidButton
                                                        kind="transaction"
                                                        id={t.id}
                                                        size="sm"
                                                    />
                                                ) : null}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </TableWrap>
                )}
                <ShowMore
                    shown={Math.min(limit, transactions.length)}
                    total={transactions.length}
                    step={300}
                    basePath="/admin/caja"
                    params={params}
                />
            </Card>
        </div>
    );
}
