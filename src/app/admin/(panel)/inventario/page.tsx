import { UploadIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExportLink } from "@/components/admin/ExportLink";
import { ShowMore } from "@/components/admin/ShowMore";
import { Filters } from "@/components/admin/Filters";
import { BulkPriceDialog } from "@/components/admin/inventory/BulkPriceDialog";
import { InventoryTable } from "@/components/admin/inventory/InventoryTable";
import { ProductFormButton } from "@/components/admin/inventory/ProductForm";
import { buttonVariants } from "@/components/admin/ui/button";
import { Input, Label, NativeSelect } from "@/components/admin/ui/input";
import { Card, CardHeader, EmptyState, PageHeader, Stat } from "@/components/admin/ui/misc";
import { getDb } from "@/lib/admin/auth";
import { isLowStock } from "@/lib/admin/calc";
import { formatARS, formatNumber } from "@/lib/admin/money";
import { isUuid, limitParam, param, type SearchParams } from "@/lib/admin/params";
import { fetchAll, getSettings } from "@/lib/admin/queries";
import { matches } from "@/lib/admin/search";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Inventario" };

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const db = await getDb();
    const q = param(params, "q");
    const category = param(params, "categoria");
    const supplier = param(params, "proveedor");
    const stock = param(params, "stock");
    const inactive = param(params, "inactivos") === "1";
    const limit = limitParam(params, 200);

    const [products, { data: categories }, { data: suppliers }, { data: value }, settings] =
        await Promise.all([
            fetchAll(function (from, to) {
                return db
                    .from("products")
                    .select(
                        "id, sku, name, location, cost, margin, manual_price, price, stock, min_stock, active, category_id, supplier_id, categories(name), suppliers(name)",
                    )
                    .order("name")
                    .range(from, to);
            }),
            db.from("categories").select("id, name").order("sort_order").order("name"),
            db.from("suppliers").select("id, name").order("name"),
            db.rpc("inventory_value"),
            getSettings(db),
        ]);

    const rows = products.filter(function (p) {
        if (!inactive && !p.active) return false;
        if (isUuid(category) && p.category_id !== category) return false;
        if (isUuid(supplier) && p.supplier_id !== supplier) return false;
        if (stock === "bajo" && !isLowStock(p.stock, p.min_stock)) return false;
        if (stock === "sin" && p.stock > 0) return false;
        if (q && !matches(`${p.name} ${p.sku ?? ""} ${p.location ?? ""}`, q)) return false;
        return true;
    });

    const totalValue = (value ?? []).reduce(function (s, v) {
        return s + Number(v.value);
    }, 0);
    const totalUnits = (value ?? []).reduce(function (s, v) {
        return s + Number(v.units);
    }, 0);
    const lowCount = products.filter(function (p) {
        return p.active && isLowStock(p.stock, p.min_stock);
    }).length;

    const categoryOptions = categories ?? [];
    const supplierOptions = suppliers ?? [];

    return (
        <div>
            <PageHeader
                title="Inventario"
                actions={
                    <>
                        <ExportLink table="products" />
                        <Link
                            href="/admin/inventario/importar"
                            className={buttonVariants({ variant: "secondary" })}
                        >
                            <UploadIcon /> Importar Excel
                        </Link>
                        <BulkPriceDialog categories={categoryOptions} suppliers={supplierOptions} />
                        <ProductFormButton
                            categories={categoryOptions}
                            suppliers={supplierOptions}
                            defaultMargin={settings.default_margin}
                            rounding={settings.price_rounding}
                        />
                    </>
                }
            />

            <div className="mb-3 grid gap-3 lg:grid-cols-[1fr_2fr]">
                <div className="grid grid-cols-2 gap-3">
                    <Stat
                        label="Valor del inventario"
                        value={formatARS(totalValue)}
                        hint="Σ stock × costo"
                        className="col-span-2"
                    />
                    <Stat label="Unidades" value={formatNumber(totalUnits)} />
                    <Stat
                        label="Bajo mínimo"
                        value={
                            <Link href="/admin/inventario?stock=bajo" className="hover:underline">
                                {lowCount}
                            </Link>
                        }
                    />
                </div>
                <Card>
                    <CardHeader title="Valor por categoría" />
                    <ul className="grid gap-x-6 px-4 py-2 text-sm sm:grid-cols-2">
                        {(value ?? []).map(function (v) {
                            const pct = totalValue ? (Number(v.value) / totalValue) * 100 : 0;
                            return (
                                <li key={v.category_id ?? "none"} className="py-1">
                                    <div className="flex justify-between gap-2">
                                        <span className="truncate">{v.category_name}</span>
                                        <span className="font-semibold tabular-nums">
                                            {formatARS(v.value)}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-1.5 rounded bg-canvas">
                                        <div
                                            className="h-1.5 rounded bg-primary"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            </div>

            <Filters action="/admin/inventario" clearHref="/admin/inventario">
                <div className="min-w-48 flex-1">
                    <Label htmlFor="q">Buscar</Label>
                    <Input id="q" name="q" defaultValue={q} placeholder="Nombre, SKU o ubicación" />
                </div>
                <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <NativeSelect id="categoria" name="categoria" defaultValue={category ?? ""}>
                        <option value="">Todas</option>
                        {categoryOptions.map(function (c) {
                            return (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </div>
                <div>
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <NativeSelect id="proveedor" name="proveedor" defaultValue={supplier ?? ""}>
                        <option value="">Todos</option>
                        {supplierOptions.map(function (s) {
                            return (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </div>
                <div>
                    <Label htmlFor="stock">Stock</Label>
                    <NativeSelect id="stock" name="stock" defaultValue={stock ?? ""}>
                        <option value="">Todos</option>
                        <option value="bajo">Bajo mínimo</option>
                        <option value="sin">Sin stock</option>
                    </NativeSelect>
                </div>
                <label className="flex h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="inactivos" value="1" defaultChecked={inactive} />
                    Incluir inactivos
                </label>
            </Filters>

            <Card>
                {rows.length === 0 ? (
                    <EmptyState
                        title={
                            products.length === 0
                                ? "Todavía no hay productos"
                                : "Ningún producto coincide"
                        }
                        description={
                            products.length === 0
                                ? "Cargá uno con “Nuevo producto” o importá tu Excel de inventario."
                                : "Probá con otros filtros."
                        }
                    />
                ) : (
                    <InventoryTable
                        rows={rows.slice(0, limit).map(function (p) {
                            return {
                                id: p.id,
                                sku: p.sku,
                                name: p.name,
                                location: p.location,
                                category: p.categories?.name ?? null,
                                supplier: p.suppliers?.name ?? null,
                                cost: Number(p.cost),
                                margin: p.margin === null ? null : Number(p.margin),
                                manual_price:
                                    p.manual_price === null ? null : Number(p.manual_price),
                                price: Number(p.price),
                                stock: p.stock,
                                min_stock: p.min_stock,
                                active: p.active,
                            };
                        })}
                        defaultMargin={settings.default_margin}
                    />
                )}
                <ShowMore
                    shown={Math.min(limit, rows.length)}
                    total={rows.length}
                    step={200}
                    basePath="/admin/inventario"
                    params={params}
                />
            </Card>
            <p className="mt-2 text-xs text-muted">
                {rows.length} productos. Margen = recargo sobre el costo (vacío ={" "}
                {Math.round(settings.default_margin * 100)} % por defecto). Precio = costo × (1 +
                margen), redondeado hacia arriba a ${settings.price_rounding}, salvo precio manual.
            </p>
        </div>
    );
}
