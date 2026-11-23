"use server";

import { z } from "zod";
import { check, runAction } from "@/lib/admin/action";

const optionalText = z.string().trim().max(2000).optional();
const optionalMoney = z
    .number()
    .min(0, "Los montos no pueden ser negativos.")
    .nullable()
    .optional();

const createSchema = z
    .object({
        customer_id: z.uuid().nullable().optional(),
        new_customer: z
            .object({ name: z.string().trim(), phone: z.string().trim().optional() })
            .optional(),
        bike_id: z.uuid().nullable().optional(),
        new_bike: z
            .object({
                brand: z.string().optional(),
                model: z.string().optional(),
                wheel_size: z.string().optional(),
                bike_type: z.string().optional(),
                color: z.string().optional(),
            })
            .optional(),
        problem: optionalText,
        promised_at: z.string().optional(),
        budget_amount: optionalMoney,
        notes: optionalText,
    })
    .refine(
        function (d) {
            return Boolean(d.customer_id) || Boolean(d.new_customer?.name);
        },
        { message: "Elegí o cargá el cliente." },
    );

export type WorkOrderInput = z.infer<typeof createSchema>;

export async function createWorkOrder(input: WorkOrderInput) {
    return runAction(createSchema, input, async function (data, db) {
        return check(await db.rpc("create_work_order", { p: data })) as {
            id: string;
            number: number;
        };
    });
}

const updateSchema = z.object({
    id: z.uuid(),
    problem: optionalText,
    diagnosis: optionalText,
    work_done: optionalText,
    notes: optionalText,
    labor_amount: z.number().min(0).optional(),
    budget_amount: optionalMoney,
    promised_at: z.string().nullable().optional(),
    bike_id: z.uuid().nullable().optional(),
});

export async function updateWorkOrder(input: z.infer<typeof updateSchema>) {
    return runAction(updateSchema, input, async function ({ id, ...fields }, db) {
        const patch = {
            ...fields,
            promised_at: fields.promised_at === "" ? null : fields.promised_at,
        };
        check(await db.from("work_orders").update(patch).eq("id", id));
        return null;
    });
}

const statusSchema = z.object({
    id: z.uuid(),
    status: z.enum(["recibida", "presupuestada", "en_reparacion", "lista"]),
});

export async function setWorkOrderStatus(input: z.infer<typeof statusSchema>) {
    return runAction(statusSchema, input, async function (data, db) {
        check(await db.rpc("set_work_order_status", { p_id: data.id, p_status: data.status }));
        return null;
    });
}

const itemSchema = z.object({
    work_order_id: z.uuid(),
    item: z.discriminatedUnion("kind", [
        z.object({
            kind: z.literal("product"),
            product_id: z.uuid(),
            quantity: z.number().int().positive(),
            unit_price: z.number().min(0).optional(),
        }),
        z.object({
            kind: z.literal("service"),
            service_id: z.uuid(),
            quantity: z.number().int().positive(),
            unit_price: z.number().min(0).optional(),
        }),
        z.object({
            kind: z.literal("free"),
            description: z.string().trim().min(1, "Falta la descripción."),
            quantity: z.number().int().positive(),
            unit_price: z.number().min(0),
        }),
    ]),
});

export async function addWorkOrderItem(input: z.infer<typeof itemSchema>) {
    return runAction(itemSchema, input, async function (data, db) {
        return check(
            await db.rpc("add_work_order_item", {
                p_work_order_id: data.work_order_id,
                p: data.item,
            }),
        );
    });
}

const removeSchema = z.object({ id: z.uuid() });

export async function removeWorkOrderItem(input: z.infer<typeof removeSchema>) {
    return runAction(removeSchema, input, async function (data, db) {
        check(await db.rpc("remove_work_order_item", { p_item_id: data.id }));
        return null;
    });
}

const deliverSchema = z.object({
    id: z.uuid(),
    account_id: z.uuid({ error: "Elegí la cuenta de cobro." }),
    final_price: z.number().min(0, "El precio final no puede ser negativo."),
    work_done: optionalText,
});

export async function deliverWorkOrder(input: z.infer<typeof deliverSchema>) {
    return runAction(deliverSchema, input, async function (data, db) {
        if (data.work_done !== undefined) {
            check(
                await db
                    .from("work_orders")
                    .update({ work_done: data.work_done })
                    .eq("id", data.id),
            );
        }
        check(
            await db.rpc("deliver_work_order", {
                p_id: data.id,
                p_account_id: data.account_id,
                p_final_price: data.final_price,
            }),
        );
        return null;
    });
}

const cancelSchema = z.object({ id: z.uuid(), reason: z.string().max(300).optional() });

export async function cancelWorkOrder(input: z.infer<typeof cancelSchema>) {
    return runAction(cancelSchema, input, async function (data, db) {
        check(await db.rpc("cancel_work_order", { p_id: data.id, p_reason: data.reason ?? "" }));
        return null;
    });
}
