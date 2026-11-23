// Tests de integración contra Supabase (local por defecto): ejercitan las funciones de Postgres
// como lo hace la app, con un usuario autenticado (RLS y pg-safeupdate activos).
// Correr con `npm run test:db` (necesita `npm run db:start` y .env.local con la secret key).
// Crean sus propios datos con prefijo TEST- y los borran al terminar.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { accountBalance } from "@/lib/admin/calc";
import { todayAR } from "@/lib/admin/dates";
import type { Database } from "@/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const secret = process.env.SUPABASE_SECRET_KEY ?? "";
const enabled = Boolean(url && publishable && secret);

const RUN = `TEST-${Date.now()}`;
const EMAIL = "integration-test@pedalea.local";
const PASSWORD = "integration-test-password";

type Db = SupabaseClient<Database>;

let db: Db;
let admin: Db;
const ids = {
    category: "",
    supplier: "",
    product: "",
    cash: "",
    bank: "",
    wallet: "",
    taller: "",
    repuestos: "",
    comision: "",
};

async function product() {
    const { data } = await db.from("products").select("*").eq("id", ids.product).single();
    return data!;
}

async function balance(accountId: string) {
    const { data } = await db.from("v_account_balances").select("*").eq("id", accountId).single();
    return accountBalance({
        initial_balance: Number(data!.initial_balance),
        income: Number(data!.income),
        expense: Number(data!.expense),
        transfer_in: Number(data!.transfer_in),
        transfer_out: Number(data!.transfer_out),
    });
}

async function today() {
    const day = todayAR();
    const { data } = await db.rpc("report_monthly", { p_from: day, p_to: day });
    const row = data![0];
    return {
        revenue: Number(row.revenue),
        cogs: Number(row.cogs),
        merch: Number(row.merchandise_purchases),
    };
}

function rpcOk<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
    if (result.error) throw new Error(result.error.message);
    return result.data as NonNullable<T>;
}

describe.skipIf(!enabled)("flujo de negocio en la base", function () {
    beforeAll(async function () {
        admin = createClient<Database>(url, secret, { auth: { persistSession: false } });
        await admin.auth.admin.createUser({
            email: EMAIL,
            password: PASSWORD,
            email_confirm: true,
        });
        db = createClient<Database>(url, publishable, { auth: { persistSession: false } });
        const { error } = await db.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
        if (error) throw error;

        const { data: cats } = await db.from("transaction_categories").select("id, code");
        function code(c: string) {
            return cats!.find(function (x) {
                return x.code === c;
            })!.id;
        }
        ids.taller = code("taller");
        ids.repuestos = code("repuestos");
        ids.comision = code("comision");

        const { data: accounts } = await db.from("accounts").select("id, name");
        function account(name: string) {
            return accounts!.find(function (a) {
                return a.name === name;
            })!.id;
        }
        ids.cash = account("Efectivo");
        ids.bank = account("Banco");
        ids.wallet = account("Mercado Pago");

        ids.category = rpcOk(
            await db
                .from("categories")
                .insert({ name: `${RUN} Repuestos`, income_category_id: ids.repuestos })
                .select("id")
                .single(),
        ).id;
        ids.supplier = rpcOk(
            await db
                .from("suppliers")
                .insert({ name: `${RUN} Proveedor` })
                .select("id")
                .single(),
        ).id;
    });

    afterAll(async function () {
        if (!admin) return;
        // Limpieza con la secret key (saltea RLS), en orden de dependencias.
        const { data: sales } = await admin
            .from("sale_items")
            .select("sale_id")
            .eq("product_id", ids.product);
        const { data: purchases } = await admin
            .from("purchases")
            .select("id")
            .eq("supplier_id", ids.supplier);
        const { data: customers } = await admin
            .from("customers")
            .select("id")
            .like("name", `${RUN}%`);
        const saleIds = (sales ?? []).map(function (s) {
            return s.sale_id;
        });
        const purchaseIds = (purchases ?? []).map(function (p) {
            return p.id;
        });
        const customerIds = (customers ?? []).map(function (c) {
            return c.id;
        });
        const { data: orders } = await admin
            .from("work_orders")
            .select("id")
            .in("customer_id", customerIds);
        const orderIds = (orders ?? []).map(function (o) {
            return o.id;
        });
        await admin.from("transactions").delete().in("sale_id", saleIds);
        await admin.from("transactions").delete().in("purchase_id", purchaseIds);
        await admin.from("transactions").delete().in("work_order_id", orderIds);
        await admin.from("transactions").delete().like("description", `${RUN}%`);
        await admin.from("sales").delete().in("id", saleIds);
        await admin.from("purchases").delete().in("id", purchaseIds);
        await admin.from("work_orders").delete().in("id", orderIds);
        await admin.from("customers").delete().in("id", customerIds);
        await admin.from("products").delete().like("sku", `${RUN}%`);
        await admin.from("suppliers").delete().eq("id", ids.supplier);
        await admin.from("categories").delete().eq("id", ids.category);
        const { data: users } = await admin.auth.admin.listUsers();
        const user = users.users.find(function (u) {
            return u.email === EMAIL;
        });
        if (user) await admin.auth.admin.deleteUser(user.id);
    });

    it("sin sesión no se puede leer ni operar (RLS)", async function () {
        const anon = createClient<Database>(url, publishable, { auth: { persistSession: false } });
        const read = await anon.from("products").select("id").limit(1);
        expect(read.error).not.toBeNull();
        const rpc = await anon.rpc("adjust_stock", {
            p_product_id: "00000000-0000-0000-0000-000000000000",
            p_new_stock: 1,
            p_reason: "x",
        });
        expect(rpc.error).not.toBeNull();
    });

    it("calcula el precio con margen, redondeo y precio manual", async function () {
        const row = rpcOk(
            await db
                .from("products")
                .insert({
                    sku: `${RUN}-1`,
                    name: `${RUN} Cubierta`,
                    category_id: ids.category,
                    supplier_id: ids.supplier,
                    cost: 1000,
                    min_stock: 2,
                })
                .select("*")
                .single(),
        );
        ids.product = row.id;
        expect(Number(row.price)).toBe(1800);

        await db.from("products").update({ cost: 1234, margin: 0.5 }).eq("id", ids.product);
        expect(Number((await product()).price)).toBe(1900);

        await db.from("products").update({ manual_price: 4999 }).eq("id", ids.product);
        expect(Number((await product()).price)).toBe(4999);

        await db
            .from("products")
            .update({ manual_price: null, margin: null, cost: 10000 })
            .eq("id", ids.product);
        expect(Number((await product()).price)).toBe(18000);
    });

    it("el stock no se puede tocar sin un movimiento", async function () {
        const { error } = await db.from("products").update({ stock: 99 }).eq("id", ids.product);
        expect(error?.message).toMatch(/movimiento/);
        expect((await product()).stock).toBe(0);
    });

    it("una compra suma stock, actualiza costo y precio y registra el egreso", async function () {
        const before = await today();
        const bankBefore = await balance(ids.bank);
        rpcOk(
            await db.rpc("create_purchase", {
                p: {
                    supplier_id: ids.supplier,
                    account_id: ids.bank,
                    items: [{ product_id: ids.product, quantity: 5, unit_cost: 12000 }],
                },
            }),
        );
        const p = await product();
        expect(p.stock).toBe(5);
        expect(Number(p.cost)).toBe(12000);
        expect(Number(p.price)).toBe(21600);
        expect(await balance(ids.bank)).toBe(bankBefore - 60000);
        const after = await today();
        expect(after.merch - before.merch).toBe(60000);
        // La compra no es costo de lo vendido.
        expect(after.cogs - before.cogs).toBe(0);
    });

    let saleId = "";

    it("una venta descuenta stock, congela el costo y separa los ingresos por categoría", async function () {
        const before = await today();
        const cashBefore = await balance(ids.cash);
        const { data: service } = await db
            .from("services")
            .select("id, price")
            .eq("name", "Service Base")
            .single();
        const sale = rpcOk(
            await db.rpc("create_sale", {
                p: {
                    account_id: ids.cash,
                    items: [
                        {
                            kind: "product",
                            product_id: ids.product,
                            quantity: 2,
                            unit_price: 21600,
                        },
                        {
                            kind: "service",
                            service_id: service!.id,
                            quantity: 1,
                            unit_price: Number(service!.price),
                        },
                        { kind: "commission", quantity: 1, unit_price: 50000 },
                    ],
                },
            }),
        ) as { id: string; total: number };
        saleId = sale.id;
        expect(Number(sale.total)).toBe(43200 + 45000 + 50000);
        expect((await product()).stock).toBe(3);

        const { data: items } = await db
            .from("sale_items")
            .select("kind, unit_cost")
            .eq("sale_id", saleId);
        expect(
            items!.find(function (i) {
                return i.kind === "product";
            })!.unit_cost,
        ).toBe(12000);

        const { data: txs } = await db
            .from("transactions")
            .select("category_id, amount")
            .eq("sale_id", saleId);
        const byCategory = Object.fromEntries(
            txs!.map(function (t) {
                return [t.category_id, Number(t.amount)];
            }),
        );
        expect(byCategory[ids.repuestos]).toBe(43200);
        expect(byCategory[ids.taller]).toBe(45000);
        expect(byCategory[ids.comision]).toBe(50000);

        expect(await balance(ids.cash)).toBe(cashBefore + 138200);
        const after = await today();
        expect(after.revenue - before.revenue).toBe(138200);
        expect(after.cogs - before.cogs).toBe(24000);
    });

    it("anular la venta devuelve stock y saca los ingresos", async function () {
        const before = await today();
        rpcOk(await db.rpc("void_sale", { p_sale_id: saleId, p_reason: "test" }));
        expect((await product()).stock).toBe(5);
        const after = await today();
        expect(before.revenue - after.revenue).toBe(138200);
        expect(before.cogs - after.cogs).toBe(24000);
        const again = await db.rpc("void_sale", { p_sale_id: saleId, p_reason: "" });
        expect(again.error?.message).toMatch(/ya está anulada/);
    });

    it("orden de trabajo: repuestos, descuento a taller, entrega y cancelación", async function () {
        const wo = rpcOk(
            await db.rpc("create_work_order", {
                p: {
                    new_customer: { name: `${RUN} Cliente`, phone: "342 155 1234" },
                    new_bike: { brand: "Trek" },
                },
            }),
        ) as { id: string };
        const itemId = rpcOk(
            await db.rpc("add_work_order_item", {
                p_work_order_id: wo.id,
                p: { kind: "product", product_id: ids.product, quantity: 2 },
            }),
        );
        expect((await product()).stock).toBe(3);
        rpcOk(await db.rpc("remove_work_order_item", { p_item_id: itemId as string }));
        expect((await product()).stock).toBe(5);

        rpcOk(
            await db.rpc("add_work_order_item", {
                p_work_order_id: wo.id,
                p: { kind: "product", product_id: ids.product, quantity: 1 },
            }),
        );
        await db.from("work_orders").update({ labor_amount: 20000 }).eq("id", wo.id);
        rpcOk(await db.rpc("set_work_order_status", { p_id: wo.id, p_status: "lista" }));

        // Total 41.600 (21.600 repuesto + 20.000 mano de obra); se cobra 30.000: el descuento sale de taller.
        const before = await today();
        rpcOk(
            await db.rpc("deliver_work_order", {
                p_id: wo.id,
                p_account_id: ids.wallet,
                p_final_price: 30000,
            }),
        );
        const { data: txs } = await db
            .from("transactions")
            .select("category_id, amount")
            .eq("work_order_id", wo.id);
        const byCategory = Object.fromEntries(
            txs!.map(function (t) {
                return [t.category_id, Number(t.amount)];
            }),
        );
        expect(byCategory[ids.repuestos]).toBe(21600);
        expect(byCategory[ids.taller]).toBe(8400);
        const after = await today();
        expect(after.revenue - before.revenue).toBe(30000);
        expect(after.cogs - before.cogs).toBe(12000);

        const edit = await db.rpc("add_work_order_item", {
            p_work_order_id: wo.id,
            p: { kind: "free", description: "x", quantity: 1, unit_price: 1 },
        });
        expect(edit.error?.message).toMatch(/ya está entregada/);

        rpcOk(await db.rpc("cancel_work_order", { p_id: wo.id, p_reason: "test" }));
        expect((await product()).stock).toBe(5);
        const cancelled = await today();
        expect(cancelled.revenue).toBe(before.revenue);
        expect(cancelled.cogs).toBe(before.cogs);
    });

    it("ajuste manual con motivo y actualización masiva de costos", async function () {
        const noReason = await db.rpc("adjust_stock", {
            p_product_id: ids.product,
            p_new_stock: 4,
            p_reason: "",
        });
        expect(noReason.error).not.toBeNull();
        expect(
            rpcOk(
                await db.rpc("adjust_stock", {
                    p_product_id: ids.product,
                    p_new_stock: 4,
                    p_reason: "Conteo",
                }),
            ),
        ).toBe(4);

        const count = rpcOk(
            await db.rpc("bulk_update_costs", { p_percent: 10, p_supplier_id: ids.supplier }),
        );
        expect(count).toBe(1);
        const p = await product();
        expect(Number(p.cost)).toBe(13200);
        expect(Number(p.price)).toBe(23800); // 13.200 × 1,8 = 23.760 → 23.800

        const { data: movements } = await db
            .from("stock_movements")
            .select("kind, quantity, stock_after")
            .eq("product_id", ids.product)
            .order("created_at");
        const kinds = movements!.map(function (m) {
            return m.kind;
        });
        expect(kinds).toEqual([
            "purchase",
            "sale",
            "void",
            "work_order",
            "work_order",
            "work_order",
            "void",
            "adjustment",
        ]);
        expect(movements!.at(-1)!.stock_after).toBe(4);
    });

    it("importa: actualiza por SKU y crea categorías y proveedores faltantes", async function () {
        const result = rpcOk(
            await db.rpc("import_products", {
                p_rows: [
                    { sku: `${RUN}-1`, name: `${RUN} Cubierta`, stock: 10, cost: 13200 },
                    {
                        sku: `${RUN}-2`,
                        name: `${RUN} Remera`,
                        category: `${RUN} Indumentaria`,
                        supplier: `${RUN} Proveedor`,
                        cost: 1000,
                        margin: 1,
                        stock: 3,
                    },
                ],
                p_mode: "update",
            }),
        ) as Record<string, number>;
        expect(result).toMatchObject({
            created: 1,
            updated: 1,
            categories_created: 1,
            suppliers_created: 0,
        });
        expect((await product()).stock).toBe(10);
        const { data: created } = await db
            .from("products")
            .select("price, stock")
            .eq("sku", `${RUN}-2`)
            .single();
        expect(Number(created!.price)).toBe(2000);
        expect(created!.stock).toBe(3);
        await admin
            .from("categories")
            .delete()
            .eq("name", `${RUN} Indumentaria`)
            .then(function () {
                return null;
            });
    });

    it("las transferencias mueven saldo sin ser ingreso ni egreso", async function () {
        const before = await today();
        const cash = await balance(ids.cash);
        const bank = await balance(ids.bank);
        rpcOk(
            await db.from("transactions").insert({
                type: "transfer",
                account_id: ids.cash,
                to_account_id: ids.bank,
                amount: 1000,
                description: `${RUN} transferencia`,
            }),
        );
        expect(await balance(ids.cash)).toBe(cash - 1000);
        expect(await balance(ids.bank)).toBe(bank + 1000);
        expect((await today()).revenue).toBe(before.revenue);
    });
});
