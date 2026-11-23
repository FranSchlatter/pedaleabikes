"use server";

import { z } from "zod";
import { check, DbError, runAction } from "@/lib/admin/action";

const text = z
    .string()
    .trim()
    .max(1000)
    .transform(function (v) {
        return v || null;
    })
    .nullable()
    .optional();

const supplierSchema = z.object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "El proveedor necesita nombre.").max(200),
    contact_name: text,
    phone: text,
    email: text,
    terms: text,
    notes: text,
    active: z.boolean().optional(),
});

export type SupplierInput = z.input<typeof supplierSchema>;

export async function saveSupplier(input: SupplierInput) {
    return runAction(supplierSchema, input, async function ({ id, ...fields }, db) {
        if (id) {
            check(await db.from("suppliers").update(fields).eq("id", id));
            return { id };
        }
        const row = check(await db.from("suppliers").insert(fields).select("id").single());
        return { id: row.id };
    });
}

const customerSchema = z.object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "El cliente necesita nombre.").max(200),
    phone: text,
    email: text,
    notes: text,
});

export type CustomerInput = z.input<typeof customerSchema>;

export async function saveCustomer(input: CustomerInput) {
    return runAction(customerSchema, input, async function ({ id, ...fields }, db) {
        if (id) {
            check(await db.from("customers").update(fields).eq("id", id));
            return { id };
        }
        const row = check(await db.from("customers").insert(fields).select("id").single());
        return { id: row.id };
    });
}

const bikeSchema = z.object({
    id: z.uuid().optional(),
    customer_id: z.uuid(),
    brand: text,
    model: text,
    wheel_size: text,
    bike_type: text,
    color: text,
    notes: text,
});

export type BikeInput = z.input<typeof bikeSchema>;

export async function saveBike(input: BikeInput) {
    return runAction(bikeSchema, input, async function ({ id, ...fields }, db) {
        if (id) {
            check(await db.from("bikes").update(fields).eq("id", id));
            return { id };
        }
        const row = check(await db.from("bikes").insert(fields).select("id").single());
        return { id: row.id };
    });
}

const deleteSchema = z.object({ id: z.uuid() });

// Solo clientes sin órdenes (las órdenes son historial del taller). Sus ventas quedan sin cliente
// y sus bicis se borran con él.
export async function deleteCustomer(input: z.infer<typeof deleteSchema>) {
    return runAction(deleteSchema, input, async function (data, db) {
        const { count } = await db
            .from("work_orders")
            .select("id", { count: "exact", head: true })
            .eq("customer_id", data.id);
        if (count) {
            throw new DbError(
                `No se puede eliminar: tiene ${count} órdenes de trabajo en su historial.`,
            );
        }
        check(await db.from("customers").delete().eq("id", data.id));
        return null;
    });
}
