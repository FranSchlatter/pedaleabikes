import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/admin/auth";
import { formatDate, formatDateTime } from "@/lib/admin/dates";
import { bikeLabel } from "@/lib/admin/labels";
import { formatARS } from "@/lib/admin/money";
import { isUuid } from "@/lib/admin/params";
import { getSettings } from "@/lib/admin/queries";
import { statusLabel } from "@/lib/admin/types";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "Comprobante" };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) notFound();
    const db = await getDb();
    const [{ data: wo }, settings] = await Promise.all([
        db
            .from("work_orders")
            .select("*, customers(name, phone), bikes(brand, model, wheel_size, bike_type, color), work_order_items(*)")
            .eq("id", id)
            .maybeSingle(),
        getSettings(db),
    ]);
    if (!wo) notFound();

    const items = [...wo.work_order_items].sort(function (a, b) {
        return a.created_at.localeCompare(b.created_at);
    });
    const total =
        Number(wo.labor_amount) +
        items.reduce(function (s, i) {
            return s + i.quantity * Number(i.unit_price);
        }, 0);
    const charged = wo.final_price !== null ? Number(wo.final_price) : null;

    return (
        <div className="mx-auto max-w-2xl p-6 text-sm text-ink print:p-0">
            <div className="mb-4 flex justify-end print:hidden">
                <PrintButton />
            </div>
            <header className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
                <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="" width={64} height={57} className="rounded bg-ink p-1" />
                    <div>
                        <p className="font-display text-xl font-extrabold uppercase">{settings.business_name}</p>
                        <p>{settings.address}</p>
                        <p>
                            {settings.phone}
                            {settings.tax_id ? ` · CUIT ${settings.tax_id}` : ""}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted">Orden de trabajo</p>
                    <p className="text-2xl font-bold">#{wo.number}</p>
                    <p>Ingreso: {formatDateTime(wo.received_at)}</p>
                    {wo.promised_at ? <p>Prometida: {formatDate(wo.promised_at)}</p> : null}
                    <p>Estado: {statusLabel(wo.status)}</p>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-4 border-b border-line py-3">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Cliente</p>
                    <p className="font-semibold">{wo.customers?.name}</p>
                    <p>{wo.customers?.phone}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Bicicleta</p>
                    <p className="font-semibold">{bikeLabel(wo.bikes)}</p>
                </div>
            </section>

            <section className="space-y-2 border-b border-line py-3">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Problema / pedido</p>
                    <p className="whitespace-pre-line">{wo.problem || "—"}</p>
                </div>
                {wo.diagnosis ? (
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted">Diagnóstico</p>
                        <p className="whitespace-pre-line">{wo.diagnosis}</p>
                    </div>
                ) : null}
                {wo.work_done ? (
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted">Trabajos realizados</p>
                        <p className="whitespace-pre-line">{wo.work_done}</p>
                    </div>
                ) : null}
            </section>

            {items.length > 0 || Number(wo.labor_amount) > 0 ? (
                <table className="mt-3 w-full">
                    <thead>
                        <tr className="border-b border-ink text-left text-xs uppercase tracking-wide">
                            <th className="py-1">Detalle</th>
                            <th className="py-1 text-right">Cant.</th>
                            <th className="py-1 text-right">Precio</th>
                            <th className="py-1 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(function (i) {
                            return (
                                <tr key={i.id} className="border-b border-line">
                                    <td className="py-1">{i.description}</td>
                                    <td className="py-1 text-right">{i.quantity}</td>
                                    <td className="py-1 text-right">{formatARS(i.unit_price)}</td>
                                    <td className="py-1 text-right">{formatARS(i.quantity * Number(i.unit_price))}</td>
                                </tr>
                            );
                        })}
                        {Number(wo.labor_amount) > 0 ? (
                            <tr className="border-b border-line">
                                <td className="py-1">Mano de obra</td>
                                <td className="py-1 text-right">1</td>
                                <td className="py-1 text-right">{formatARS(wo.labor_amount)}</td>
                                <td className="py-1 text-right">{formatARS(wo.labor_amount)}</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            ) : null}

            <div className="mt-3 flex flex-col items-end gap-0.5">
                {wo.budget_amount !== null && charged === null ? (
                    <p>Presupuesto informado: {formatARS(wo.budget_amount)}</p>
                ) : null}
                <p className="text-lg font-bold">
                    {charged !== null ? `Total cobrado: ${formatARS(charged)}` : `Total: ${formatARS(total)}`}
                </p>
            </div>

            {settings.receipt_footer ? (
                <p className="mt-6 border-t border-line pt-3 text-xs text-muted">{settings.receipt_footer}</p>
            ) : null}
            <div className="mt-10 grid grid-cols-2 gap-10 text-center text-xs text-muted">
                <p className="border-t border-ink pt-1">Firma del cliente</p>
                <p className="border-t border-ink pt-1">{settings.business_name}</p>
            </div>
        </div>
    );
}
