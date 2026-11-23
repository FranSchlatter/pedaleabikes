"use client";

import Link from "next/link";
import { useState, useTransition, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { quickUpdateProduct } from "@/app/admin/actions/inventory";
import { Badge } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { isLowStock } from "@/lib/admin/calc";
import { cn } from "@/lib/admin/cn";
import { formatARS, formatNumber, parseARS } from "@/lib/admin/money";

export type InventoryRow = {
    id: string;
    sku: string | null;
    name: string;
    location: string | null;
    category: string | null;
    supplier: string | null;
    cost: number;
    margin: number | null;
    manual_price: number | null;
    price: number;
    stock: number;
    min_stock: number;
    active: boolean;
};

type Field = "cost" | "margin" | "stock" | "min_stock";

export function InventoryTable({ rows, defaultMargin }: { rows: InventoryRow[]; defaultMargin: number }) {
    return (
        <TableWrap className="max-h-[70dvh]">
            <Table>
                <thead>
                    <tr>
                        <Th>Producto</Th>
                        <Th>Categoría / proveedor</Th>
                        <Th>Ubicación</Th>
                        <Th className="text-right">Costo</Th>
                        <Th className="text-right">Margen %</Th>
                        <Th className="text-right">Precio</Th>
                        <Th className="text-right">Stock</Th>
                        <Th className="text-right">Mín.</Th>
                        <Th className="text-right">Valor</Th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(function (row) {
                        return <Row key={row.id} row={row} defaultMargin={defaultMargin} />;
                    })}
                </tbody>
            </Table>
        </TableWrap>
    );
}

function Row({ row, defaultMargin }: { row: InventoryRow; defaultMargin: number }) {
    const [pending, startTransition] = useTransition();
    const [price, setPrice] = useState(row.price);
    const low = isLowStock(row.stock, row.min_stock);

    function commit(field: Field, raw: string) {
        const text = raw.trim();
        let value: number | null;
        if (field === "margin") {
            value = text === "" ? null : (parseARS(text) ?? NaN) / 100;
        } else if (field === "cost") {
            value = parseARS(text);
        } else {
            value = text === "" ? NaN : Math.trunc(Number(text));
        }
        const current = field === "margin" ? row.margin : row[field];
        if (value !== null && Number.isNaN(value)) {
            toast.error("Valor inválido.");
            return false;
        }
        if (field !== "margin" && value === null) {
            toast.error("Valor inválido.");
            return false;
        }
        if (value === current || (value !== null && current !== null && Math.abs(value - current) < 1e-9)) return true;
        startTransition(async function () {
            const result = await quickUpdateProduct({ id: row.id, field, value } as never);
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            setPrice(result.data.price);
            if (field === "stock") toast.success(`Stock de ${row.name}: ${value} (ajuste registrado)`);
        });
        return true;
    }

    return (
        <Tr className={cn(!row.active && "opacity-50", pending && "opacity-60")}>
            <Td className="min-w-56">
                <Link href={`/admin/inventario/${row.id}`} className="font-medium hover:text-primary hover:underline">
                    {row.name}
                </Link>
                <div className="text-xs text-muted">
                    {row.sku ?? "sin SKU"}
                    {!row.active ? " · inactivo" : ""}
                </div>
            </Td>
            <Td className="text-xs">
                <div>{row.category ?? "—"}</div>
                <div className="text-muted">{row.supplier ?? "—"}</div>
            </Td>
            <Td className="text-xs text-muted">{row.location ?? "—"}</Td>
            <Td className="text-right">
                <InlineCell
                    initial={formatNumber(row.cost)}
                    onCommit={function (v) {
                        return commit("cost", v);
                    }}
                    label={`Costo de ${row.name}`}
                    className="w-24"
                />
            </Td>
            <Td className="text-right">
                <InlineCell
                    initial={row.margin === null ? "" : formatNumber(row.margin * 100)}
                    placeholder={formatNumber(defaultMargin * 100)}
                    onCommit={function (v) {
                        return commit("margin", v);
                    }}
                    label={`Margen de ${row.name}`}
                    className="w-16"
                />
            </Td>
            <Td className="whitespace-nowrap text-right font-semibold tabular-nums">
                {formatARS(price)}
                {row.manual_price !== null ? (
                    <Badge tone="warning" className="ml-1" title="Precio manual">
                        M
                    </Badge>
                ) : null}
            </Td>
            <Td className="text-right">
                <InlineCell
                    initial={String(row.stock)}
                    onCommit={function (v) {
                        return commit("stock", v);
                    }}
                    label={`Stock de ${row.name}`}
                    className={cn("w-16", row.stock <= 0 ? "text-danger font-bold" : low && "text-warning font-bold")}
                />
            </Td>
            <Td className="text-right">
                <InlineCell
                    initial={String(row.min_stock)}
                    onCommit={function (v) {
                        return commit("min_stock", v);
                    }}
                    label={`Stock mínimo de ${row.name}`}
                    className="w-14"
                />
            </Td>
            <Td className="text-right tabular-nums text-muted">{formatARS(Math.max(row.stock, 0) * row.cost)}</Td>
        </Tr>
    );
}

function InlineCell({
    initial,
    onCommit,
    label,
    className,
    placeholder,
}: {
    initial: string;
    onCommit: (value: string) => boolean;
    label: string;
    className?: string;
    placeholder?: string;
}) {
    const [value, setValue] = useState(initial);

    function handleKey(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            setValue(initial);
            e.currentTarget.blur();
        }
    }

    return (
        <input
            aria-label={label}
            value={value}
            placeholder={placeholder}
            inputMode="decimal"
            onChange={function (e) {
                setValue(e.target.value);
            }}
            onKeyDown={handleKey}
            onFocus={function (e) {
                e.target.select();
            }}
            onBlur={function () {
                if (value === initial) return;
                if (!onCommit(value)) setValue(initial);
            }}
            className={cn(
                "h-7 rounded border border-transparent bg-transparent px-1.5 text-right text-sm tabular-nums hover:border-line-strong focus:border-primary focus:bg-surface focus:outline-none",
                className,
            )}
        />
    );
}
