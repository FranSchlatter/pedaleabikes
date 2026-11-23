import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdjustStockForm } from "@/components/admin/inventory/AdjustStockForm";
import { ProductFormButton } from "@/components/admin/inventory/ProductForm";
import { Badge, Card, CardHeader, EmptyState, PageHeader, Stat } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { getDb } from "@/lib/admin/auth";
import { isLowStock } from "@/lib/admin/calc";
import { formatDateTime } from "@/lib/admin/dates";
import { formatARS, formatPct } from "@/lib/admin/money";
import { isUuid } from "@/lib/admin/params";
import { getSettings } from "@/lib/admin/queries";
import { MOVEMENT_LABELS } from "@/lib/admin/types";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Producto" };

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();
    const db = await getDb();
    const [{ data: p }, { data: movements }, { data: categories }, { data: suppliers }, settings] =
        await Promise.all([
            db
                .from("products")
                .select("*, categories(name), suppliers(id, name)")
                .eq("id", id)
                .maybeSingle(),
            db
                .from("stock_movements")
                .select(
                    "id, occurred_at, kind, quantity, stock_after, reason, sale_id, purchase_id, work_order_id",
                )
                .eq("product_id", id)
                .order("occurred_at", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(300),
            db.from("categories").select("id, name").order("sort_order").order("name"),
            db.from("suppliers").select("id, name").order("name"),
            getSettings(db),
        ]);
    if (!p) notFound();

    const cost = Number(p.cost);
    const price = Number(p.price);
    const markup = cost > 0 ? price / cost - 1 : null;

    function refLink(m: NonNullable<typeof movements>[number]) {
        if (m.sale_id) return { href: `/admin/ventas/${m.sale_id}`, label: "venta" };
        if (m.purchase_id) return { href: `/admin/compras/${m.purchase_id}`, label: "compra" };
        if (m.work_order_id) return { href: `/admin/ordenes/${m.work_order_id}`, label: "orden" };
        return null;
    }

    return (
        <div className="space-y-4">
            <PageHeader
                plain
                title={p.name}
                description={
                    <>
                        {p.sku ?? "Sin SKU"} · {p.categories?.name ?? "Sin categoría"} ·{" "}
                        {p.suppliers ? (
                            <Link
                                href={`/admin/proveedores/${p.suppliers.id}`}
                                className="text-primary hover:underline"
                            >
                                {p.suppliers.name}
                            </Link>
                        ) : (
                            "Sin proveedor"
                        )}
                        {p.location ? ` · ${p.location}` : ""}{" "}
                        {!p.active ? <Badge tone="danger">Inactivo</Badge> : null}
                    </>
                }
                actions={
                    <ProductFormButton
                        categories={categories ?? []}
                        suppliers={suppliers ?? []}
                        defaultMargin={settings.default_margin}
                        rounding={settings.price_rounding}
                        product={{
                            id: p.id,
                            sku: p.sku ?? "",
                            name: p.name,
                            category_id: p.category_id ?? "",
                            supplier_id: p.supplier_id ?? "",
                            location: p.location ?? "",
                            cost,
                            margin: p.margin === null ? null : Number(p.margin),
                            manual_price: p.manual_price === null ? null : Number(p.manual_price),
                            stock: p.stock,
                            min_stock: p.min_stock,
                            active: p.active,
                            notes: p.notes ?? "",
                        }}
                    />
                }
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat
                    label="Stock"
                    value={p.stock}
                    tone={p.stock <= 0 ? "negative" : undefined}
                    hint={
                        isLowStock(p.stock, p.min_stock)
                            ? `Bajo mínimo (${p.min_stock})`
                            : `Mínimo ${p.min_stock}`
                    }
                />
                <Stat label="Costo" value={formatARS(cost)} />
                <Stat
                    label="Precio"
                    value={formatARS(price)}
                    hint={
                        p.manual_price !== null
                            ? "Precio manual"
                            : `Margen ${formatPct(p.margin ?? settings.default_margin)}${p.margin === null ? " (default)" : ""}`
                    }
                />
                <Stat label="Recargo real" value={formatPct(markup)} hint="precio / costo − 1" />
                <Stat label="Valor en stock" value={formatARS(Math.max(p.stock, 0) * cost)} />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader
                        title="Ajuste manual de stock"
                        description="Conteo, rotura, pérdida, regalo…"
                    />
                    <AdjustStockForm key={p.stock} productId={p.id} currentStock={p.stock} />
                    {p.notes ? (
                        <p className="border-t border-line px-4 py-3 text-sm text-muted">
                            {p.notes}
                        </p>
                    ) : null}
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Historial de movimientos"
                        description="Todo cambio de stock queda registrado."
                    />
                    {(movements ?? []).length === 0 ? (
                        <EmptyState title="Sin movimientos todavía" />
                    ) : (
                        <TableWrap className="max-h-[60dvh]">
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Fecha</Th>
                                        <Th>Tipo</Th>
                                        <Th>Detalle</Th>
                                        <Th className="text-right">Cant.</Th>
                                        <Th className="text-right">Stock</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(movements ?? []).map(function (m) {
                                        const ref = refLink(m);
                                        return (
                                            <Tr key={m.id}>
                                                <Td className="whitespace-nowrap tabular-nums">
                                                    {formatDateTime(m.occurred_at)}
                                                </Td>
                                                <Td>{MOVEMENT_LABELS[m.kind] ?? m.kind}</Td>
                                                <Td className="text-muted">
                                                    {ref ? (
                                                        <Link
                                                            href={ref.href}
                                                            className="text-primary hover:underline"
                                                        >
                                                            {m.reason ?? ref.label}
                                                        </Link>
                                                    ) : (
                                                        m.reason
                                                    )}
                                                </Td>
                                                <Td
                                                    className={
                                                        m.quantity > 0
                                                            ? "text-right font-semibold text-success tabular-nums"
                                                            : "text-right font-semibold text-danger tabular-nums"
                                                    }
                                                >
                                                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                                                </Td>
                                                <Td className="text-right tabular-nums">
                                                    {m.stock_after}
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
        </div>
    );
}
