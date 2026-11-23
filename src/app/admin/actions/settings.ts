"use server";

import { z } from "zod";
import { check, runAction } from "@/lib/admin/action";

const text = z
    .string()
    .trim()
    .max(1000)
    .transform(function (v) {
        return v || null;
    })
    .nullable()
    .optional();

const settingsSchema = z.object({
    default_margin: z.number().min(0, "El margen no puede ser negativo.").max(100).optional(),
    price_rounding: z.number().int().min(0).max(100000).optional(),
    business_name: z.string().trim().min(1).max(200).optional(),
    address: text,
    phone: text,
    whatsapp: text,
    email: text,
    tax_id: text,
    receipt_footer: text,
});

export async function saveSettings(input: z.input<typeof settingsSchema>) {
    return runAction(settingsSchema, input, async function (data, db) {
        check(await db.from("settings").update(data).eq("id", 1));
        return null;
    });
}

const accountSchema = z.object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "La cuenta necesita nombre.").max(100),
    kind: z.enum(["cash", "bank", "wallet", "card"]),
    initial_balance: z.number(),
    active: z.boolean(),
    sort_order: z.number().int(),
});

export async function saveAccount(input: z.infer<typeof accountSchema>) {
    return runAction(accountSchema, input, async function ({ id, ...fields }, db) {
        if (id) check(await db.from("accounts").update(fields).eq("id", id));
        else check(await db.from("accounts").insert(fields));
        return null;
    });
}

const categorySchema = z.object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "La categoría necesita nombre.").max(100),
    income_category_id: z.uuid({ error: "Elegí la categoría de ingreso." }),
});

export async function saveCategory(input: z.infer<typeof categorySchema>) {
    return runAction(categorySchema, input, async function ({ id, ...fields }, db) {
        if (id) check(await db.from("categories").update(fields).eq("id", id));
        else check(await db.from("categories").insert(fields));
        return null;
    });
}

const txCategorySchema = z.object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "La categoría necesita nombre.").max(100),
    type: z.enum(["income", "expense"]),
    report_group: z.enum(["revenue", "operating", "merchandise", "withdrawal"]),
    active: z.boolean(),
});

export async function saveTxCategory(input: z.infer<typeof txCategorySchema>) {
    return runAction(txCategorySchema, input, async function ({ id, ...fields }, db) {
        const group =
            fields.type === "income"
                ? "revenue"
                : fields.report_group === "revenue"
                  ? "operating"
                  : fields.report_group;
        if (id) {
            // Las categorías del sistema (con código) mantienen tipo y grupo.
            check(
                await db
                    .from("transaction_categories")
                    .update({ name: fields.name, active: fields.active })
                    .eq("id", id)
                    .not("code", "is", null),
            );
            check(
                await db
                    .from("transaction_categories")
                    .update({ ...fields, report_group: group })
                    .eq("id", id)
                    .is("code", null),
            );
        } else {
            check(
                await db
                    .from("transaction_categories")
                    .insert({ ...fields, report_group: group, sort_order: 500 }),
            );
        }
        return null;
    });
}

const serviceSchema = z.object({
    id: z.uuid().optional(),
    name: z.string().trim().min(1, "El servicio necesita nombre.").max(150),
    description: text,
    price: z.number().min(0, "El precio no puede ser negativo."),
    active: z.boolean(),
    sort_order: z.number().int(),
});

export async function saveService(input: z.input<typeof serviceSchema>) {
    return runAction(serviceSchema, input, async function ({ id, ...fields }, db) {
        if (id) check(await db.from("services").update(fields).eq("id", id));
        else check(await db.from("services").insert(fields));
        return null;
    });
}

const resetSchema = z.object({
    confirm: z.literal("BORRAR", { error: "Escribí BORRAR para confirmar." }),
});

export async function resetBusinessData(input: z.infer<typeof resetSchema>) {
    return runAction(resetSchema, input, async function (data, db) {
        check(await db.rpc("reset_business_data", { p_confirm: data.confirm }));
        return null;
    });
}
