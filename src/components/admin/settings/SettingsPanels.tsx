"use client";

import { DownloadIcon, PlusIcon, SaveIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
    resetBusinessData,
    saveAccount,
    saveCategory,
    saveService,
    saveSettings,
    saveTxCategory,
} from "@/app/admin/actions/settings";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Confirm } from "@/components/admin/ui/confirm";
import { Field, Input, NativeSelect, Textarea } from "@/components/admin/ui/input";
import { Card, CardHeader } from "@/components/admin/ui/misc";
import { MoneyInput } from "@/components/admin/ui/money-input";
import type { ActionResult } from "@/lib/admin/action-types";
import { cn } from "@/lib/admin/cn";
import { formatNumber, parseARS } from "@/lib/admin/money";

// ---------------------------------------------------------------------------------------------
// Precios y negocio
// ---------------------------------------------------------------------------------------------

export type SettingsData = {
    default_margin: number;
    price_rounding: number;
    business_name: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    tax_id: string;
    receipt_footer: string;
};

const ROUNDINGS = [0, 10, 50, 100, 500, 1000];

export function PricingForm({ settings }: { settings: SettingsData }) {
    const [margin, setMargin] = useState(formatNumber(settings.default_margin * 100));
    const [rounding, setRounding] = useState(settings.price_rounding);
    const [pending, startTransition] = useTransition();

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const m = parseARS(margin);
        if (m === null || m < 0) {
            toast.error("Margen inválido.");
            return;
        }
        startTransition(async function () {
            const result = await saveSettings({ default_margin: m / 100, price_rounding: rounding });
            if (result.ok) toast.success("Guardado. Se recalcularon los precios que usan el margen por defecto.");
            else toast.error(result.error);
        });
    }

    return (
        <Card>
            <CardHeader title="Precios" description="Precio = costo × (1 + margen), redondeado hacia arriba." />
            <form onSubmit={submit} className="grid gap-3 p-4 sm:grid-cols-3">
                <Field label="Margen por defecto (%)" htmlFor="set-margin" hint="Recargo sobre el costo">
                    <Input
                        id="set-margin"
                        inputMode="decimal"
                        value={margin}
                        onChange={function (e) {
                            setMargin(e.target.value);
                        }}
                        className="text-right"
                    />
                </Field>
                <Field label="Redondeo" htmlFor="set-round" hint="Hacia arriba, para no perder margen">
                    <NativeSelect
                        id="set-round"
                        value={rounding}
                        onChange={function (e) {
                            setRounding(Number(e.target.value));
                        }}
                    >
                        {ROUNDINGS.map(function (r) {
                            return (
                                <option key={r} value={r}>
                                    {r === 0 ? "Sin redondeo" : `A $${formatNumber(r)}`}
                                </option>
                            );
                        })}
                    </NativeSelect>
                </Field>
                <div className="flex items-end">
                    <Button type="submit" disabled={pending}>
                        <SaveIcon /> Guardar y recalcular
                    </Button>
                </div>
            </form>
        </Card>
    );
}

export function BusinessForm({ settings }: { settings: SettingsData }) {
    const [data, setData] = useState(settings);
    const [pending, startTransition] = useTransition();

    function set(key: keyof SettingsData, value: string) {
        setData({ ...data, [key]: value });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async function () {
            const result = await saveSettings({
                business_name: data.business_name,
                address: data.address,
                phone: data.phone,
                whatsapp: data.whatsapp,
                email: data.email,
                tax_id: data.tax_id,
                receipt_footer: data.receipt_footer,
            });
            if (result.ok) toast.success("Datos del negocio guardados");
            else toast.error(result.error);
        });
    }

    const fields: { key: keyof SettingsData; label: string }[] = [
        { key: "business_name", label: "Nombre" },
        { key: "address", label: "Dirección" },
        { key: "phone", label: "Teléfono" },
        { key: "whatsapp", label: "WhatsApp (549…)" },
        { key: "email", label: "Email" },
        { key: "tax_id", label: "CUIT" },
    ];

    return (
        <Card>
            <CardHeader title="Datos del negocio" description="Aparecen en el comprobante y en los mensajes de WhatsApp." />
            <form onSubmit={submit} className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map(function (f) {
                    return (
                        <Field key={f.key} label={f.label} htmlFor={`biz-${f.key}`}>
                            <Input
                                id={`biz-${f.key}`}
                                value={String(data[f.key] ?? "")}
                                onChange={function (e) {
                                    set(f.key, e.target.value);
                                }}
                            />
                        </Field>
                    );
                })}
                <Field label="Pie del comprobante" htmlFor="biz-footer" className="sm:col-span-2 lg:col-span-3">
                    <Textarea
                        id="biz-footer"
                        className="min-h-14"
                        value={data.receipt_footer}
                        onChange={function (e) {
                            set("receipt_footer", e.target.value);
                        }}
                    />
                </Field>
                <div>
                    <Button type="submit" disabled={pending}>
                        <SaveIcon /> Guardar
                    </Button>
                </div>
            </form>
        </Card>
    );
}

// ---------------------------------------------------------------------------------------------
// Listas editables (cuentas, categorías, servicios)
// ---------------------------------------------------------------------------------------------

type Column = {
    key: string;
    label: string;
    type: "text" | "money" | "number" | "select" | "checkbox";
    options?: { value: string; label: string }[];
    className?: string;
    // No editable en filas existentes (p. ej. categorías del sistema).
    lockedWhen?: (row: Row) => boolean;
};

type Row = Record<string, string | number | boolean | null> & { id?: string };

function EditableList({
    title,
    description,
    columns,
    rows,
    blank,
    onSave,
}: {
    title: string;
    description?: string;
    columns: Column[];
    rows: Row[];
    blank: Row;
    onSave: (row: Row) => Promise<ActionResult<null>>;
}) {
    const [adding, setAdding] = useState(false);
    return (
        <Card>
            <CardHeader
                title={title}
                description={description}
                action={
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={function () {
                            setAdding(true);
                        }}
                    >
                        <PlusIcon /> Agregar
                    </Button>
                }
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-canvas text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                        <tr>
                            {columns.map(function (c) {
                                return (
                                    <th key={c.key} className={cn("px-3 py-2", c.className)}>
                                        {c.label}
                                    </th>
                                );
                            })}
                            <th className="w-24" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(function (row) {
                            return <EditableRow key={String(row.id)} row={row} columns={columns} onSave={onSave} />;
                        })}
                        {adding ? (
                            <EditableRow
                                row={blank}
                                columns={columns}
                                isNew
                                onSave={async function (r) {
                                    const result = await onSave(r);
                                    if (result.ok) setAdding(false);
                                    return result;
                                }}
                                onCancel={function () {
                                    setAdding(false);
                                }}
                            />
                        ) : null}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function EditableRow({
    row,
    columns,
    onSave,
    isNew = false,
    onCancel,
}: {
    row: Row;
    columns: Column[];
    onSave: (row: Row) => Promise<ActionResult<null>>;
    isNew?: boolean;
    onCancel?: () => void;
}) {
    const [data, setData] = useState<Row>(row);
    const [pending, startTransition] = useTransition();
    const dirty =
        isNew ||
        columns.some(function (c) {
            return data[c.key] !== row[c.key];
        });

    function save() {
        startTransition(async function () {
            const result = await onSave(data);
            if (result.ok) toast.success("Guardado");
            else toast.error(result.error);
        });
    }

    return (
        <tr className={cn("border-t border-line", isNew && "bg-info-soft/50")}>
            {columns.map(function (c) {
                const locked = !isNew && c.lockedWhen?.(row);
                const value = data[c.key];
                function set(v: string | number | boolean | null) {
                    setData({ ...data, [c.key]: v });
                }
                return (
                    <td key={c.key} className={cn("px-3 py-1.5", c.className)}>
                        {c.type === "checkbox" ? (
                            <input
                                type="checkbox"
                                aria-label={c.label}
                                checked={value === true}
                                disabled={locked}
                                onChange={function (e) {
                                    set(e.target.checked);
                                }}
                            />
                        ) : c.type === "select" ? (
                            <NativeSelect
                                aria-label={c.label}
                                value={String(value ?? "")}
                                disabled={locked}
                                onChange={function (e) {
                                    set(e.target.value);
                                }}
                                className="h-8"
                            >
                                {(c.options ?? []).map(function (o) {
                                    return (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    );
                                })}
                            </NativeSelect>
                        ) : c.type === "money" ? (
                            <MoneyInput
                                aria-label={c.label}
                                value={value === null || value === "" ? null : Number(value)}
                                onValueChange={function (v) {
                                    set(v ?? 0);
                                }}
                                className="h-8"
                            />
                        ) : (
                            <Input
                                aria-label={c.label}
                                type={c.type === "number" ? "number" : "text"}
                                value={String(value ?? "")}
                                disabled={locked}
                                autoFocus={isNew && c === columns[0]}
                                onChange={function (e) {
                                    set(c.type === "number" ? Number(e.target.value) : e.target.value);
                                }}
                                className="h-8"
                            />
                        )}
                    </td>
                );
            })}
            <td className="px-3 py-1.5 text-right whitespace-nowrap">
                {dirty ? (
                    <Button size="sm" onClick={save} disabled={pending}>
                        Guardar
                    </Button>
                ) : null}
                {isNew && onCancel ? (
                    <Button size="sm" variant="ghost" onClick={onCancel}>
                        ✕
                    </Button>
                ) : null}
            </td>
        </tr>
    );
}

const ACCOUNT_KINDS = [
    { value: "cash", label: "Efectivo" },
    { value: "bank", label: "Banco" },
    { value: "wallet", label: "Billetera virtual" },
    { value: "card", label: "Tarjetas / Posnet" },
];

export function AccountsEditor({ rows }: { rows: Row[] }) {
    return (
        <EditableList
            title="Cuentas"
            description="Medios de cobro y pago. El saldo inicial es lo que había al empezar a usar el sistema."
            rows={rows}
            blank={{ name: "", kind: "bank", initial_balance: 0, active: true, sort_order: 50 }}
            columns={[
                { key: "name", label: "Nombre", type: "text" },
                { key: "kind", label: "Tipo", type: "select", options: ACCOUNT_KINDS },
                { key: "initial_balance", label: "Saldo inicial", type: "money", className: "w-40" },
                { key: "sort_order", label: "Orden", type: "number", className: "w-20" },
                { key: "active", label: "Activa", type: "checkbox", className: "w-16" },
            ]}
            onSave={function (r) {
                return saveAccount({
                    id: r.id,
                    name: String(r.name),
                    kind: r.kind as "cash",
                    initial_balance: Number(r.initial_balance),
                    active: Boolean(r.active),
                    sort_order: Number(r.sort_order) || 0,
                });
            }}
        />
    );
}

export function CategoriesEditor({ rows, incomeCategories }: { rows: Row[]; incomeCategories: { value: string; label: string }[] }) {
    return (
        <EditableList
            title="Categorías de productos"
            description="Cada una se asocia a la categoría de ingreso donde caen sus ventas."
            rows={rows}
            blank={{ name: "", income_category_id: incomeCategories[1]?.value ?? incomeCategories[0]?.value ?? "" }}
            columns={[
                { key: "name", label: "Nombre", type: "text" },
                { key: "income_category_id", label: "Ingreso en", type: "select", options: incomeCategories },
            ]}
            onSave={function (r) {
                return saveCategory({
                    id: r.id,
                    name: String(r.name),
                    income_category_id: String(r.income_category_id),
                });
            }}
        />
    );
}

const GROUPS = [
    { value: "operating", label: "Gasto operativo" },
    { value: "withdrawal", label: "Retiro (fuera del resultado)" },
    { value: "merchandise", label: "Mercadería (no es gasto)" },
    { value: "revenue", label: "Ingreso" },
];

export function TxCategoriesEditor({ rows }: { rows: Row[] }) {
    return (
        <EditableList
            title="Categorías de caja"
            description="Las del sistema (usadas por las automatizaciones) solo permiten cambiar el nombre."
            rows={rows}
            blank={{ name: "", type: "expense", report_group: "operating", active: true, code: null }}
            columns={[
                { key: "name", label: "Nombre", type: "text" },
                {
                    key: "type",
                    label: "Tipo",
                    type: "select",
                    options: [
                        { value: "income", label: "Ingreso" },
                        { value: "expense", label: "Egreso" },
                    ],
                    lockedWhen: function (r) {
                        return Boolean(r.code);
                    },
                },
                {
                    key: "report_group",
                    label: "En reportes",
                    type: "select",
                    options: GROUPS,
                    lockedWhen: function (r) {
                        return Boolean(r.code);
                    },
                },
                {
                    key: "active",
                    label: "Activa",
                    type: "checkbox",
                    className: "w-16",
                    lockedWhen: function (r) {
                        return Boolean(r.code);
                    },
                },
            ]}
            onSave={function (r) {
                return saveTxCategory({
                    id: r.id,
                    name: String(r.name),
                    type: r.type as "income",
                    report_group: r.report_group as "operating",
                    active: Boolean(r.active),
                });
            }}
        />
    );
}

export function ServicesEditor({ rows }: { rows: Row[] }) {
    return (
        <EditableList
            title="Servicios de taller"
            description="Precio fijo. En cada venta u orden se puede cambiar el precio de la línea."
            rows={rows}
            blank={{ name: "", description: "", price: 0, active: true, sort_order: 100 }}
            columns={[
                { key: "name", label: "Servicio", type: "text" },
                { key: "description", label: "Descripción", type: "text" },
                { key: "price", label: "Precio", type: "money", className: "w-36" },
                { key: "sort_order", label: "Orden", type: "number", className: "w-20" },
                { key: "active", label: "Activo", type: "checkbox", className: "w-16" },
            ]}
            onSave={function (r) {
                return saveService({
                    id: r.id,
                    name: String(r.name),
                    description: String(r.description ?? ""),
                    price: Number(r.price),
                    active: Boolean(r.active),
                    sort_order: Number(r.sort_order) || 0,
                });
            }}
        />
    );
}

// ---------------------------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------------------------

export function DataPanel() {
    return (
        <Card>
            <CardHeader title="Tus datos" />
            <div className="grid gap-4 p-4 md:grid-cols-2">
                <div>
                    <p className="font-semibold">Backup completo</p>
                    <p className="mb-2 text-sm text-muted">
                        Descarga todas las tablas en un Excel (una hoja por tabla). Conviene hacerlo una vez por semana.
                    </p>
                    <a href="/admin/export?table=backup" className={buttonVariants()} download>
                        <DownloadIcon /> Descargar backup
                    </a>
                </div>
                <div>
                    <p className="font-semibold text-danger">Borrar datos de ejemplo</p>
                    <p className="mb-2 text-sm text-muted">
                        Para empezar a usarlo en serio: borra ventas, compras, órdenes, caja, productos, clientes y
                        proveedores. Conserva configuración, cuentas (saldo inicial en 0), categorías y servicios.
                    </p>
                    <Confirm
                        title="¿Borrar todos los datos?"
                        description="Esto no se puede deshacer. Descargá un backup antes si tenés algo que quieras conservar."
                        confirmLabel="Borrar todo"
                        typeToConfirm="BORRAR"
                        trigger={<Button variant="danger-outline">Borrar datos de ejemplo</Button>}
                        onConfirm={async function () {
                            const result = await resetBusinessData({ confirm: "BORRAR" });
                            if (!result.ok) {
                                toast.error(result.error);
                                return false;
                            }
                            toast.success("Datos borrados. Ya podés importar tu inventario.");
                        }}
                    />
                </div>
            </div>
        </Card>
    );
}
