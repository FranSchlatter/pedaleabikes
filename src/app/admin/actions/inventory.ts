"use server";

import { z } from "zod";
import { check, DbError, runAction } from "@/lib/admin/action";

const nullableText = z
    .string()
    .trim()
    .max(300)
    .transform(function (v) {
        return v || null;
    })
    .nullable()
    .optional();

const productSchema = z.object({
    id: z.uuid().optional(),
    sku: nullableText,
    name: z.string().trim().min(1, "El producto necesita nombre.").max(200),
    category_id: z.uuid().nullable().optional(),
    supplier_id: z.uuid().nullable().optional(),
    location: nullableText,
    cost: z.number().min(0, "El costo no puede ser negativo."),
    margin: z.number().min(0, "El margen no puede ser negativo.").max(100).nullable(),
    manual_price: z.number().min(0).nullable(),
    min_stock: z.number().int().min(0),
    stock: z.number().int().optional(),
    active: z.boolean().optional(),
    notes: nullableText,
});

export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(input: ProductInput) {
    return runAction(productSchema, input, async function ({ id, stock, ...fields }, db) {
        if (id) {
            check(await db.from("products").update(fields).eq("id", id));
            return { id };
        }
        // El stock inicial queda registrado como movimiento "Carga inicial" (trigger).
        const row = check(
            await db
                .from("products")
                .insert({ ...fields, stock: stock ?? 0 })
                .select("id")
                .single(),
        );
        return { id: row.id };
    });
}

const quickSchema = z.discriminatedUnion("field", [
    z.object({ id: z.uuid(), field: z.literal("cost"), value: z.number().min(0) }),
    z.object({ id: z.uuid(), field: z.literal("margin"), value: z.number().min(0).max(100).nullable() }),
    z.object({ id: z.uuid(), field: z.literal("manual_price"), value: z.number().min(0).nullable() }),
    z.object({ id: z.uuid(), field: z.literal("min_stock"), value: z.number().int().min(0) }),
    z.object({ id: z.uuid(), field: z.literal("stock"), value: z.number().int() }),
]);

// Edición inline desde la tabla. El stock pasa por un ajuste con motivo.
export async function quickUpdateProduct(input: z.infer<typeof quickSchema>) {
    return runAction(quickSchema, input, async function (data, db) {
        if (data.field === "stock") {
            check(
                await db.rpc("adjust_stock", {
                    p_product_id: data.id,
                    p_new_stock: data.value,
                    p_reason: "Corrección desde la tabla de inventario",
                }),
            );
        } else {
            const patch =
                data.field === "cost"
                    ? { cost: data.value }
                    : data.field === "margin"
                      ? { margin: data.value }
                      : data.field === "manual_price"
                        ? { manual_price: data.value }
                        : { min_stock: data.value };
            check(await db.from("products").update(patch).eq("id", data.id));
        }
        const row = check(await db.from("products").select("price").eq("id", data.id).single());
        return { price: Number(row.price) };
    });
}

const adjustSchema = z.object({
    id: z.uuid(),
    new_stock: z.number().int(),
    reason: z.string().trim().min(1, "Indicá el motivo del ajuste.").max(300),
});

export async function adjustStock(input: z.infer<typeof adjustSchema>) {
    return runAction(adjustSchema, input, async function (data, db) {
        check(
            await db.rpc("adjust_stock", {
                p_product_id: data.id,
                p_new_stock: data.new_stock,
                p_reason: data.reason,
            }),
        );
        return null;
    });
}

const bulkSchema = z
    .object({
        percent: z.number().gt(-100, "Porcentaje inválido.").lt(1000, "Porcentaje inválido."),
        supplier_id: z.uuid().nullable(),
        category_id: z.uuid().nullable(),
    })
    .refine(
        function (d) {
            return d.percent !== 0;
        },
        { message: "Ingresá un porcentaje distinto de cero." },
    );

export async function bulkUpdateCosts(input: z.infer<typeof bulkSchema>) {
    return runAction(bulkSchema, input, async function (data, db) {
        const count = check(
            await db.rpc("bulk_update_costs", {
                p_percent: data.percent,
                p_supplier_id: data.supplier_id ?? undefined,
                p_category_id: data.category_id ?? undefined,
            }),
        );
        return { count: Number(count) };
    });
}

const importRow = z.object({
    sku: z.string().optional(),
    name: z.string(),
    category: z.string().optional(),
    supplier: z.string().optional(),
    location: z.string().optional(),
    cost: z.number().optional(),
    margin: z.number().nullable().optional(),
    manual_price: z.number().nullable().optional(),
    stock: z.number().optional(),
    min_stock: z.number().optional(),
});

const importSchema = z.object({
    rows: z.array(importRow).min(1, "No hay filas para importar.").max(10000),
    mode: z.enum(["update", "skip"]),
});

export async function importProducts(input: z.infer<typeof importSchema>) {
    return runAction(importSchema, input, async function (data, db) {
        if (data.rows.length === 0) throw new DbError("No hay filas para importar.");
        return check(await db.rpc("import_products", { p_rows: data.rows, p_mode: data.mode })) as {
            created: number;
            updated: number;
            skipped: number;
            categories_created: number;
            suppliers_created: number;
        };
    });
}
