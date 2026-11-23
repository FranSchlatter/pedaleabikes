import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkOrderEditor } from "@/components/admin/work-orders/WorkOrderEditor";
import { getDb } from "@/lib/admin/auth";
import { bikeLabel } from "@/lib/admin/labels";
import { isUuid, param, type SearchParams } from "@/lib/admin/params";
import { getSettings } from "@/lib/admin/queries";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Orden de trabajo" };

export default async function WorkOrderPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: SearchParams;
}) {
    const { id } = await params;
    const sp = await searchParams;
    if (!isUuid(id)) notFound();
    const db = await getDb();
    const [{ data: wo }, settings, { data: categories }] = await Promise.all([
        db
            .from("work_orders")
            .select(
                "*, customers(id, name, phone), bikes(id, brand, model, wheel_size, bike_type, color), accounts(name), work_order_items(*), transactions(id, amount, voided_at, transaction_categories(name))",
            )
            .eq("id", id)
            .maybeSingle(),
        getSettings(db),
        db.from("transaction_categories").select("id, code").eq("code", "taller"),
    ]);
    if (!wo) notFound();

    const { data: bikes } = await db
        .from("bikes")
        .select("id, brand, model, wheel_size, bike_type, color")
        .eq("customer_id", wo.customer_id);

    const items = [...wo.work_order_items]
        .sort(function (a, b) {
            return a.created_at.localeCompare(b.created_at);
        })
        .map(function (i) {
            return {
                id: i.id,
                kind: i.kind as "product" | "service" | "free",
                description: i.description,
                quantity: i.quantity,
                unit_price: Number(i.unit_price),
                unit_cost: Number(i.unit_cost),
                income_category_id: i.income_category_id,
            };
        });

    return (
        <WorkOrderEditor
            order={{
                id: wo.id,
                number: wo.number,
                status: wo.status as never,
                received_at: wo.received_at,
                delivered_at: wo.delivered_at,
                promised_at: wo.promised_at,
                problem: wo.problem ?? "",
                diagnosis: wo.diagnosis ?? "",
                work_done: wo.work_done ?? "",
                notes: wo.notes ?? "",
                labor_amount: Number(wo.labor_amount),
                budget_amount: wo.budget_amount === null ? null : Number(wo.budget_amount),
                final_price: wo.final_price === null ? null : Number(wo.final_price),
                account_name: wo.accounts?.name ?? null,
                void_reason: wo.void_reason,
                bike_id: wo.bike_id,
            }}
            customer={wo.customers!}
            bikeText={bikeLabel(wo.bikes)}
            bikes={(bikes ?? []).map(function (b) {
                return { id: b.id, label: bikeLabel(b) };
            })}
            items={items}
            transactions={wo.transactions.map(function (t) {
                return {
                    id: t.id,
                    amount: Number(t.amount),
                    voided: Boolean(t.voided_at),
                    category: t.transaction_categories?.name ?? "",
                };
            })}
            tallerCategoryId={categories?.[0]?.id ?? ""}
            businessName={settings.business_name}
            businessAddress={settings.address}
            openDeliver={param(sp, "entregar") === "1"}
        />
    );
}
