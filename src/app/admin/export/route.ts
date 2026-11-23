import * as XLSX from "xlsx";
import { getDb } from "@/lib/admin/auth";
import { dayBounds, isValidDate, toArDate, todayAR, TIMEZONE } from "@/lib/admin/dates";
import { bikeLabel } from "@/lib/admin/labels";
import { isUuid } from "@/lib/admin/params";
import { fetchAll } from "@/lib/admin/queries";
import { statusLabel } from "@/lib/admin/types";
import type { Db } from "@/lib/supabase/server";

type Sheet = { name: string; rows: Record<string, unknown>[] };

const localDateTime = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

// "2026-11-23 14:05" en hora de Argentina (Excel lo reconoce como fecha).
function dt(value: string | null | undefined) {
    return value ? localDateTime.format(new Date(value)) : "";
}

function n(value: unknown) {
    return value === null || value === undefined ? null : Number(value);
}

const TX_TYPE: Record<string, string> = { income: "Ingreso", expense: "Egreso", transfer: "Transferencia" };

// Tablas completas para el backup (todas las columnas, tal cual están en la base).
const BACKUP_TABLES = [
    "settings",
    "accounts",
    "transaction_categories",
    "categories",
    "suppliers",
    "products",
    "services",
    "customers",
    "bikes",
    "sales",
    "sale_items",
    "purchases",
    "purchase_items",
    "work_orders",
    "work_order_items",
    "stock_movements",
    "transactions",
] as const;

function range(url: URL, fallbackDays: number) {
    const to = isValidDate(url.searchParams.get("hasta")) ? url.searchParams.get("hasta")! : todayAR();
    const fromParam = url.searchParams.get("desde");
    const from = isValidDate(fromParam)
        ? fromParam
        : toArDate(new Date(Date.now() - fallbackDays * 86400000));
    return { from: dayBounds(from).from, to: dayBounds(to).to };
}

async function buildSheets(db: Db, table: string, url: URL): Promise<Sheet[] | null> {
    switch (table) {
        case "products": {
            const rows = await fetchAll(function (a, b) {
                return db
                    .from("products")
                    .select("*, categories(name), suppliers(name)")
                    .order("name")
                    .range(a, b);
            });
            return [
                {
                    name: "Inventario",
                    rows: rows.map(function (p) {
                        return {
                            SKU: p.sku,
                            Nombre: p.name,
                            Categoría: p.categories?.name,
                            Proveedor: p.suppliers?.name,
                            Ubicación: p.location,
                            Costo: n(p.cost),
                            "Margen %": p.margin === null ? null : Number(p.margin) * 100,
                            "Precio manual": n(p.manual_price),
                            Precio: n(p.price),
                            Stock: p.stock,
                            "Stock mínimo": p.min_stock,
                            "Valor (stock × costo)": Math.max(p.stock, 0) * Number(p.cost),
                            Activo: p.active ? "Sí" : "No",
                        };
                    }),
                },
            ];
        }
        case "sales": {
            const { from, to } = range(url, 31);
            const rows = await fetchAll(function (a, b) {
                return db
                    .from("sales")
                    .select("*, accounts(name), customers(name), sale_items(*, transaction_categories(name))")
                    .gte("occurred_at", from)
                    .lt("occurred_at", to)
                    .order("occurred_at")
                    .range(a, b);
            });
            return [
                {
                    name: "Ventas",
                    rows: rows.map(function (s) {
                        return {
                            "N°": s.number,
                            Fecha: dt(s.occurred_at),
                            Cliente: s.customers?.name,
                            "Cobrado en": s.accounts?.name,
                            Total: n(s.total),
                            Anulada: s.voided_at ? "Sí" : "",
                            Notas: s.notes,
                        };
                    }),
                },
                {
                    name: "Detalle",
                    rows: rows.flatMap(function (s) {
                        return s.sale_items.map(function (i) {
                            return {
                                "Venta N°": s.number,
                                Fecha: dt(s.occurred_at),
                                Ítem: i.description,
                                Tipo: i.kind,
                                Categoría: i.transaction_categories?.name,
                                Cantidad: i.quantity,
                                "Precio unit.": n(i.unit_price),
                                "Costo unit.": n(i.unit_cost),
                                Subtotal: i.quantity * Number(i.unit_price),
                                Anulada: s.voided_at ? "Sí" : "",
                            };
                        });
                    }),
                },
            ];
        }
        case "purchases": {
            const { from, to } = range(url, 92);
            const rows = await fetchAll(function (a, b) {
                return db
                    .from("purchases")
                    .select("*, accounts(name), suppliers(name), purchase_items(*)")
                    .gte("occurred_at", from)
                    .lt("occurred_at", to)
                    .order("occurred_at")
                    .range(a, b);
            });
            return [
                {
                    name: "Compras",
                    rows: rows.map(function (p) {
                        return {
                            "N°": p.number,
                            Fecha: dt(p.occurred_at),
                            Proveedor: p.suppliers?.name,
                            Factura: p.invoice_ref,
                            "Pagado con": p.accounts?.name,
                            Total: n(p.total),
                            Anulada: p.voided_at ? "Sí" : "",
                        };
                    }),
                },
                {
                    name: "Detalle",
                    rows: rows.flatMap(function (p) {
                        return p.purchase_items.map(function (i) {
                            return {
                                "Compra N°": p.number,
                                Fecha: dt(p.occurred_at),
                                Producto: i.description,
                                Cantidad: i.quantity,
                                "Costo unit.": n(i.unit_cost),
                                "Costo anterior": n(i.previous_cost),
                                Subtotal: i.quantity * Number(i.unit_cost),
                            };
                        });
                    }),
                },
            ];
        }
        case "work_orders": {
            const rows = await fetchAll(function (a, b) {
                return db
                    .from("work_orders")
                    .select("*, customers(name, phone), bikes(brand, model, wheel_size, bike_type, color), work_order_items(*)")
                    .order("number")
                    .range(a, b);
            });
            return [
                {
                    name: "Órdenes",
                    rows: rows.map(function (w) {
                        return {
                            "N°": w.number,
                            Ingreso: dt(w.received_at),
                            Cliente: w.customers?.name,
                            Teléfono: w.customers?.phone,
                            Bici: bikeLabel(w.bikes),
                            Estado: statusLabel(w.status),
                            Problema: w.problem,
                            Diagnóstico: w.diagnosis,
                            "Trabajos realizados": w.work_done,
                            "Mano de obra": n(w.labor_amount),
                            "Repuestos y servicios": w.work_order_items.reduce(function (s, i) {
                                return s + i.quantity * Number(i.unit_price);
                            }, 0),
                            Presupuesto: n(w.budget_amount),
                            "Precio final": n(w.final_price),
                            Entrega: dt(w.delivered_at),
                        };
                    }),
                },
                {
                    name: "Ítems",
                    rows: rows.flatMap(function (w) {
                        return w.work_order_items.map(function (i) {
                            return {
                                "Orden N°": w.number,
                                Ítem: i.description,
                                Tipo: i.kind,
                                Cantidad: i.quantity,
                                "Precio unit.": n(i.unit_price),
                                "Costo unit.": n(i.unit_cost),
                            };
                        });
                    }),
                },
            ];
        }
        case "transactions": {
            const { from, to } = range(url, 31);
            const rows = await fetchAll(function (a, b) {
                return db
                    .from("transactions")
                    .select(
                        "*, transaction_categories(name), accounts!transactions_account_id_fkey(name), to:accounts!transactions_to_account_id_fkey(name), suppliers(name)",
                    )
                    .gte("occurred_at", from)
                    .lt("occurred_at", to)
                    .order("occurred_at")
                    .range(a, b);
            });
            return [
                {
                    name: "Caja",
                    rows: rows.map(function (t) {
                        return {
                            Fecha: dt(t.occurred_at),
                            Tipo: TX_TYPE[t.type],
                            Categoría: t.transaction_categories?.name,
                            Cuenta: t.accounts?.name,
                            "Cuenta destino": t.to?.name,
                            Monto: n(t.amount),
                            Descripción: t.description,
                            Proveedor: t.suppliers?.name,
                            Origen: t.sale_id ? "Venta" : t.purchase_id ? "Compra" : t.work_order_id ? "Orden" : "Manual",
                            Anulado: t.voided_at ? "Sí" : "",
                        };
                    }),
                },
            ];
        }
        case "suppliers": {
            const { data } = await db.from("suppliers").select("*").order("name");
            return [
                {
                    name: "Proveedores",
                    rows: (data ?? []).map(function (s) {
                        return {
                            Nombre: s.name,
                            Contacto: s.contact_name,
                            Teléfono: s.phone,
                            Email: s.email,
                            Condiciones: s.terms,
                            Notas: s.notes,
                            Activo: s.active ? "Sí" : "No",
                        };
                    }),
                },
            ];
        }
        case "customers": {
            const rows = await fetchAll(function (a, b) {
                return db.from("customers").select("*, bikes(*)").order("name").range(a, b);
            });
            return [
                {
                    name: "Clientes",
                    rows: rows.map(function (c) {
                        return {
                            Nombre: c.name,
                            Teléfono: c.phone,
                            Email: c.email,
                            Bicis: c.bikes.map(bikeLabel).join(" | "),
                            Notas: c.notes,
                            Alta: dt(c.created_at),
                        };
                    }),
                },
            ];
        }
        case "reorder": {
            const supplier = url.searchParams.get("proveedor");
            let q = db.from("v_low_stock").select("*").order("supplier_name").order("name");
            if (isUuid(supplier ?? undefined)) q = q.eq("supplier_id", supplier!);
            const { data } = await q;
            return [
                {
                    name: "Reposición",
                    rows: (data ?? []).map(function (p) {
                        return {
                            Proveedor: p.supplier_name,
                            SKU: p.sku,
                            Producto: p.name,
                            Stock: p.stock,
                            Mínimo: p.min_stock,
                            "Cantidad sugerida": p.suggested_quantity,
                            "Costo unit.": n(p.cost),
                            "Costo estimado": Number(p.suggested_quantity) * Number(p.cost),
                        };
                    }),
                },
            ];
        }
        case "backup": {
            const sheets: Sheet[] = [];
            for (const name of BACKUP_TABLES) {
                const rows = await fetchAll(function (a, b) {
                    return db.from(name).select("*").range(a, b);
                });
                sheets.push({ name, rows: rows as Record<string, unknown>[] });
            }
            return sheets;
        }
        default:
            return null;
    }
}

const FILE_NAMES: Record<string, string> = {
    products: "inventario",
    sales: "ventas",
    purchases: "compras",
    work_orders: "ordenes",
    transactions: "caja",
    suppliers: "proveedores",
    customers: "clientes",
    reorder: "reposicion",
    backup: "backup-completo",
};

export async function GET(request: Request) {
    const db = await getDb();
    const url = new URL(request.url);
    const table = url.searchParams.get("table") ?? "";
    const sheets = await buildSheets(db, table, url);
    if (!sheets) {
        return new Response("Tabla desconocida", { status: 400 });
    }
    const wb = XLSX.utils.book_new();
    for (const sheet of sheets) {
        const ws = XLSX.utils.json_to_sheet(sheet.rows.length ? sheet.rows : [{ "(sin datos)": "" }]);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
    }
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const fileName = `pedalea-${FILE_NAMES[table]}-${todayAR()}.xlsx`;
    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Cache-Control": "no-store",
        },
    });
}
