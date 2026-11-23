"use server";

import { getDb } from "@/lib/admin/auth";
import { fetchAll } from "@/lib/admin/queries";
import type { Catalog } from "@/lib/admin/types";

// Todo lo que necesitan los modales rápidos para autocompletar sin ir a la base en cada tecla.
export async function getCatalog(): Promise<Catalog> {
    const db = await getDb();
    const [products, services, accounts, customers, suppliers, categories] = await Promise.all([
        fetchAll(function (from, to) {
            return db
                .from("products")
                .select(
                    "id, sku, name, price, cost, stock, min_stock, supplier_id, categories(name)",
                )
                .eq("active", true)
                .order("name")
                .range(from, to);
        }),
        db.from("services").select("id, name, price").eq("active", true).order("sort_order"),
        db.from("accounts").select("id, name").eq("active", true).order("sort_order"),
        fetchAll(function (from, to) {
            return db.from("customers").select("id, name, phone").order("name").range(from, to);
        }),
        db.from("suppliers").select("id, name").eq("active", true).order("name"),
        db
            .from("transaction_categories")
            .select("id, name, code, type")
            .eq("active", true)
            .order("sort_order"),
    ]);

    return {
        products: products.map(function (p) {
            return {
                id: p.id,
                sku: p.sku,
                name: p.name,
                price: Number(p.price),
                cost: Number(p.cost),
                stock: p.stock,
                min_stock: p.min_stock,
                supplier_id: p.supplier_id,
                category: p.categories?.name ?? null,
            };
        }),
        services: (services.data ?? []).map(function (s) {
            return { id: s.id, name: s.name, price: Number(s.price) };
        }),
        accounts: accounts.data ?? [],
        customers,
        suppliers: suppliers.data ?? [],
        categories: (categories.data ?? []) as Catalog["categories"],
    };
}

export async function getCustomerBikes(customerId: string) {
    const db = await getDb();
    const { data } = await db
        .from("bikes")
        .select("id, brand, model, wheel_size, bike_type, color")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
    return data ?? [];
}
