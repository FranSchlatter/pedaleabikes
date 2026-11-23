"use server";

import { z } from "zod";
import { check, runAction } from "@/lib/admin/action";

const purchaseSchema = z.object({
    occurred_at: z.string().optional(),
    supplier_id: z.uuid().nullable().optional(),
    account_id: z.uuid({ error: "Elegí la cuenta con la que pagaste." }),
    invoice_ref: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
    items: z
        .array(
            z.object({
                product_id: z.uuid(),
                quantity: z.number().int().positive("La cantidad tiene que ser mayor a cero."),
                unit_cost: z.number().min(0, "El costo no puede ser negativo."),
            }),
        )
        .min(1, "Agregá al menos un producto."),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;

export async function createPurchase(input: PurchaseInput) {
    return runAction(purchaseSchema, input, async function (data, db) {
        return check(await db.rpc("create_purchase", { p: data })) as {
            id: string;
            number: number;
            total: number;
        };
    });
}

const voidSchema = z.object({ id: z.uuid(), reason: z.string().max(300).optional() });

export async function voidPurchase(input: z.infer<typeof voidSchema>) {
    return runAction(voidSchema, input, async function (data, db) {
        check(await db.rpc("void_purchase", { p_purchase_id: data.id, p_reason: data.reason ?? "" }));
        return null;
    });
}
