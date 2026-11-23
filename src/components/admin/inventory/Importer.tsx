"use client";

import { FileSpreadsheetIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { importProducts } from "@/app/admin/actions/inventory";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Label, NativeSelect } from "@/components/admin/ui/input";
import { Card, CardHeader } from "@/components/admin/ui/misc";
import { Table, TableWrap, Td, Th, Tr } from "@/components/admin/ui/table";
import { computePrice } from "@/lib/admin/calc";
import { buildRow, guessMapping, IMPORT_FIELDS, type ImportRow, type Mapping, type PriceMode } from "@/lib/admin/import-mapping";
import { formatARS, formatPct } from "@/lib/admin/money";

type Sheet = { name: string; rows: unknown[][] };

const CHUNK = 500;

export function Importer({ defaultMargin, rounding }: { defaultMargin: number; rounding: number }) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [sheets, setSheets] = useState<Sheet[]>([]);
    const [sheetIndex, setSheetIndex] = useState(0);
    const [headerRow, setHeaderRow] = useState(0);
    const [mapping, setMapping] = useState<Mapping>({});
    const [priceMode, setPriceMode] = useState<PriceMode>("margin");
    const [mode, setMode] = useState<"update" | "skip">("update");
    const [result, setResult] = useState<string | null>(null);
    const [progress, setProgress] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const sheet = sheets[sheetIndex];
    const headers = useMemo(
        function () {
            return (sheet?.rows[headerRow] ?? []).map(function (h, i) {
                return String(h ?? "").trim() || `Columna ${i + 1}`;
            });
        },
        [sheet, headerRow],
    );

    const rows = useMemo<ImportRow[]>(
        function () {
            if (!sheet) return [];
            return sheet.rows
                .slice(headerRow + 1)
                .map(function (cells) {
                    return buildRow(cells, mapping, priceMode);
                })
                .filter(function (r): r is ImportRow {
                    return r !== null;
                });
        },
        [sheet, headerRow, mapping, priceMode],
    );

    async function onFile(file: File) {
        setResult(null);
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const parsed = wb.SheetNames.map(function (name) {
            const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, blankrows: false, defval: "" });
            return { name, rows };
        }).filter(function (s) {
            return s.rows.length > 0;
        });
        if (parsed.length === 0) {
            toast.error("El archivo no tiene datos.");
            return;
        }
        // La fila de encabezados es la primera con al menos 2 celdas de texto en las primeras 10.
        const first = parsed[0];
        const header = Math.max(
            0,
            first.rows.slice(0, 10).findIndex(function (r) {
                return (
                    r.filter(function (c) {
                        return typeof c === "string" && c.trim();
                    }).length >= 2
                );
            }),
        );
        setFileName(file.name);
        setSheets(parsed);
        setSheetIndex(0);
        setHeaderRow(header);
        setMapping(guessMapping((first.rows[header] ?? []).map(String)));
    }

    function changeSheet(index: number) {
        setSheetIndex(index);
        setHeaderRow(0);
        setMapping(guessMapping((sheets[index]?.rows[0] ?? []).map(String)));
    }

    function runImport() {
        if (mapping.name === undefined) {
            toast.error("Elegí qué columna tiene el nombre del producto.");
            return;
        }
        startTransition(async function () {
            const total = { created: 0, updated: 0, skipped: 0, categories_created: 0, suppliers_created: 0 };
            for (let i = 0; i < rows.length; i += CHUNK) {
                setProgress(`Importando ${Math.min(i + CHUNK, rows.length)} de ${rows.length}…`);
                const res = await importProducts({ rows: rows.slice(i, i + CHUNK), mode });
                if (!res.ok) {
                    setProgress(null);
                    toast.error(`Error en las filas ${i + 1}–${i + CHUNK}: ${res.error}`);
                    return;
                }
                for (const key of Object.keys(total) as (keyof typeof total)[]) {
                    total[key] += res.data[key];
                }
            }
            setProgress(null);
            const summary = `${total.created} creados, ${total.updated} actualizados, ${total.skipped} salteados. Categorías nuevas: ${total.categories_created}. Proveedores nuevos: ${total.suppliers_created}.`;
            setResult(summary);
            toast.success("Importación terminada");
        });
    }

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong px-4 py-8 text-center hover:bg-canvas">
                    <FileSpreadsheetIcon className="size-8 text-primary" />
                    <span className="font-semibold">{fileName ?? "Elegí el archivo Excel (.xlsx, .xls o .csv)"}</span>
                    <span className="text-xs text-muted">Se lee en tu compu; no se sube nada hasta que confirmes.</span>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.ods"
                        className="sr-only"
                        onChange={function (e) {
                            const file = e.target.files?.[0];
                            if (file) void onFile(file);
                        }}
                    />
                </label>
            </Card>

            {sheet ? (
                <>
                    <Card>
                        <CardHeader title="1. Columnas" description="Detectadas automáticamente: revisalas." />
                        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                            {sheets.length > 1 ? (
                                <div>
                                    <Label>Hoja</Label>
                                    <NativeSelect
                                        value={sheetIndex}
                                        onChange={function (e) {
                                            changeSheet(Number(e.target.value));
                                        }}
                                    >
                                        {sheets.map(function (s, i) {
                                            return (
                                                <option key={s.name} value={i}>
                                                    {s.name}
                                                </option>
                                            );
                                        })}
                                    </NativeSelect>
                                </div>
                            ) : null}
                            <div>
                                <Label>Fila de encabezados</Label>
                                <NativeSelect
                                    value={headerRow}
                                    onChange={function (e) {
                                        const r = Number(e.target.value);
                                        setHeaderRow(r);
                                        setMapping(guessMapping((sheet.rows[r] ?? []).map(String)));
                                    }}
                                >
                                    {sheet.rows.slice(0, 10).map(function (_, i) {
                                        return (
                                            <option key={i} value={i}>
                                                Fila {i + 1}
                                            </option>
                                        );
                                    })}
                                </NativeSelect>
                            </div>
                            {IMPORT_FIELDS.map(function (f) {
                                return (
                                    <div key={f.field}>
                                        <Label>
                                            {f.label}
                                            {f.required ? " *" : ""}
                                        </Label>
                                        <NativeSelect
                                            value={mapping[f.field] ?? ""}
                                            onChange={function (e) {
                                                const v = e.target.value;
                                                setMapping({ ...mapping, [f.field]: v === "" ? undefined : Number(v) });
                                            }}
                                        >
                                            <option value="">— No importar —</option>
                                            {headers.map(function (h, i) {
                                                return (
                                                    <option key={i} value={i}>
                                                        {h}
                                                    </option>
                                                );
                                            })}
                                        </NativeSelect>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
                            <div>
                                <Label>Precio de venta del Excel</Label>
                                <NativeSelect
                                    value={priceMode}
                                    onChange={function (e) {
                                        setPriceMode(e.target.value as PriceMode);
                                    }}
                                >
                                    <option value="margin">Calcular el margen de cada producto (recomendado)</option>
                                    <option value="manual">Usarlo como precio manual fijo</option>
                                    <option value="ignore">Ignorarlo: usar el margen por defecto</option>
                                </NativeSelect>
                                <p className="mt-1 text-xs text-muted">
                                    Con “calcular margen”, cuando cambie el costo el precio acompaña manteniendo ese
                                    margen.
                                </p>
                            </div>
                            <div>
                                <Label>Productos que ya existen (mismo SKU, o mismo nombre si no hay SKU)</Label>
                                <NativeSelect
                                    value={mode}
                                    onChange={function (e) {
                                        setMode(e.target.value as "update" | "skip");
                                    }}
                                >
                                    <option value="update">Actualizarlos (el stock se ajusta con un movimiento)</option>
                                    <option value="skip">Dejarlos como están</option>
                                </NativeSelect>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader
                            title={`2. Vista previa (${rows.length} productos)`}
                            description="Primeras 25 filas, tal como se van a guardar."
                        />
                        <TableWrap className="max-h-[50dvh]">
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>SKU</Th>
                                        <Th>Nombre</Th>
                                        <Th>Categoría</Th>
                                        <Th>Proveedor</Th>
                                        <Th className="text-right">Costo</Th>
                                        <Th className="text-right">Margen</Th>
                                        <Th className="text-right">Precio</Th>
                                        <Th className="text-right">Stock</Th>
                                        <Th className="text-right">Mín.</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.slice(0, 25).map(function (r, i) {
                                        const price = computePrice(
                                            { cost: r.cost ?? 0, margin: r.margin ?? null, manualPrice: r.manual_price ?? null },
                                            { defaultMargin, rounding },
                                        );
                                        return (
                                            <Tr key={i}>
                                                <Td className="text-muted">{r.sku ?? "—"}</Td>
                                                <Td>{r.name}</Td>
                                                <Td>{r.category ?? "—"}</Td>
                                                <Td>{r.supplier ?? "—"}</Td>
                                                <Td className="text-right tabular-nums">{r.cost === undefined ? "—" : formatARS(r.cost)}</Td>
                                                <Td className="text-right tabular-nums">
                                                    {r.manual_price != null ? "manual" : r.margin != null ? formatPct(r.margin) : "default"}
                                                </Td>
                                                <Td className="text-right font-semibold tabular-nums">{formatARS(price)}</Td>
                                                <Td className="text-right tabular-nums">{r.stock ?? "—"}</Td>
                                                <Td className="text-right tabular-nums">{r.min_stock ?? "—"}</Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </TableWrap>
                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line p-4">
                            {progress ? <span className="text-sm text-muted">{progress}</span> : null}
                            <Button size="lg" onClick={runImport} disabled={pending || rows.length === 0}>
                                {pending ? "Importando…" : `Importar ${rows.length} productos`}
                            </Button>
                        </div>
                    </Card>
                </>
            ) : null}

            {result ? (
                <Card className="border-success/40 p-4">
                    <p className="font-semibold text-success">Listo.</p>
                    <p className="text-sm">{result}</p>
                    <Link href="/admin/inventario" className={buttonVariants({ className: "mt-3" })}>
                        Ver inventario
                    </Link>
                </Card>
            ) : null}
        </div>
    );
}
