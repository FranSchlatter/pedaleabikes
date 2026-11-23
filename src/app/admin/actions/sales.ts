"use server";

import { z } from "zod";
import { check, runAction } from "@/lib/admin/action";

const money = z.number({ error: "Monto inválido." }).min(0, "Los montos no pueden ser negativos.");
const qty = z.number().int("La cantidad tiene que ser entera.").positive("La cantidad tiene que ser mayor a cero.");

const saleItem = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("product"), product_id: z.uuid(), quantity: qty, unit_price: money }),
    z.object({ kind: z.literal("service"), service_id: z.uuid(), quantity: qty, unit_price: money }),
    z.object({
        kind: z.literal("free"),
        description: z.string().trim().min(1, "La línea libre necesita descripción."),
        quantity: qty,
        unit_price: money,
        income_category_id: z.uuid().optional(),
    }),
    z.object({
        kind: z.literal("commission"),
        description: z.string().trim().optional(),
        quantity: z.literal(1),
        unit_price: money.positive("La comisión tiene que ser mayor a cero."),
    }),
]);

const saleSchema = z.object({
    occurred_at: z.string().optional(),
    customer_id: z.uuid().nullable().optional(),
    account_id: z.uuid({ error: "Elegí el medio de pago." }),
    notes: z.string().max(500).optional(),
    items: z.array(saleItem).min(1, "Agregá al menos un ítem."),
});

export type SaleInput = z.infer<typeof saleSchema>;

export async function createSale(input: SaleInput) {
    return runAction(saleSchema, input, async function (data, db) {
        const result = check(await db.rpc("create_sale", { p: data }));
        return result as { id: string; number: number; total: number };
    });
}

const voidSchema = z.object({ id: z.uuid(), reason: z.string().max(300).optional() });

export async function voidSale(input: z.infer<typeof voidSchema>) {
    return runAction(voidSchema, input, async function (data, db) {
        check(await db.rpc("void_sale", { p_sale_id: data.id, p_reason: data.reason ?? "" }));
        return null;
    });
}
