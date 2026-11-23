"use server";

import { z } from "zod";
import { check, DbError, runAction } from "@/lib/admin/action";

const txSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.enum(["income", "expense"]),
        occurred_at: z.string().optional(),
        category_id: z.uuid({ error: "Elegí la categoría." }),
        account_id: z.uuid({ error: "Elegí la cuenta." }),
        amount: z.number().positive("El monto tiene que ser mayor a cero."),
        description: z.string().max(300).optional(),
        supplier_id: z.uuid().nullable().optional(),
    }),
    z.object({
        type: z.literal("transfer"),
        occurred_at: z.string().optional(),
        account_id: z.uuid({ error: "Elegí la cuenta de origen." }),
        to_account_id: z.uuid({ error: "Elegí la cuenta de destino." }),
        amount: z.number().positive("El monto tiene que ser mayor a cero."),
        description: z.string().max(300).optional(),
    }),
]);

export type TransactionInput = z.infer<typeof txSchema>;

export async function createTransaction(input: TransactionInput) {
    return runAction(txSchema, input, async function (data, db) {
        if (data.type === "transfer" && data.account_id === data.to_account_id) {
            throw new DbError("Elegí dos cuentas distintas.");
        }
        check(
            await db.from("transactions").insert({
                ...data,
                occurred_at: data.occurred_at || new Date().toISOString(),
                description: data.description?.trim() || null,
            }),
        );
        return null;
    });
}

const voidSchema = z.object({ id: z.uuid() });

// Solo movimientos manuales: los de ventas, compras y órdenes se anulan desde su origen.
export async function voidTransaction(input: z.infer<typeof voidSchema>) {
    return runAction(voidSchema, input, async function (data, db) {
        const tx = check(
            await db
                .from("transactions")
                .select("sale_id, purchase_id, work_order_id, voided_at")
                .eq("id", data.id)
                .single(),
        );
        if (tx.sale_id || tx.purchase_id || tx.work_order_id) {
            throw new DbError(
                "Este movimiento viene de una venta, compra u orden: anulalo desde ahí.",
            );
        }
        if (tx.voided_at) {
            throw new DbError("El movimiento ya está anulado.");
        }
        check(
            await db
                .from("transactions")
                .update({ voided_at: new Date().toISOString() })
                .eq("id", data.id),
        );
        return null;
    });
}
