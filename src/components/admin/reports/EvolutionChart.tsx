"use client";

import { useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { formatMonth } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";

export type EvolutionPoint = { month: string; income: number; expenses: number; result: number };

// Paleta validada (CVD y contraste) para 3 series sobre fondo claro.
const SERIES = [
    { key: "income", name: "Ingresos", color: "#00928a" },
    { key: "expenses", name: "Egresos (costo de lo vendido + gastos)", color: "#d4650a" },
    { key: "result", name: "Resultado", color: "#6b5bd6" },
] as const;

function compact(value: number) {
    if (Math.abs(value) >= 1_000_000) {
        return "$" + (value / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " M";
    }
    if (Math.abs(value) >= 1000) return "$" + Math.round(value / 1000) + " k";
    return "$" + value;
}

export function EvolutionChart({ data }: { data: EvolutionPoint[] }) {
    const [table, setTable] = useState(false);
    return (
        <div>
            <div className="mb-2 flex justify-end">
                <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={function () {
                        setTable(!table);
                    }}
                >
                    {table ? "Ver gráfico" : "Ver como tabla"}
                </button>
            </div>
            {table ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                            <tr className="border-b border-line">
                                <th className="py-1.5">Mes</th>
                                {SERIES.map(function (s) {
                                    return (
                                        <th key={s.key} className="py-1.5 text-right">
                                            {s.name}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(function (d) {
                                return (
                                    <tr key={d.month} className="border-b border-line">
                                        <td className="py-1.5">{formatMonth(d.month)}</td>
                                        <td className="py-1.5 text-right tabular-nums">{formatARS(d.income)}</td>
                                        <td className="py-1.5 text-right tabular-nums">{formatARS(d.expenses)}</td>
                                        <td className="py-1.5 text-right tabular-nums">{formatARS(d.result)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                            <CartesianGrid stroke="#e3e6e1" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickFormatter={function (m: string) {
                                    return formatMonth(m, true);
                                }}
                                tick={{ fontSize: 11, fill: "#56605e" }}
                                axisLine={{ stroke: "#b9c2bf" }}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={compact}
                                tick={{ fontSize: 11, fill: "#56605e" }}
                                axisLine={false}
                                tickLine={false}
                                width={64}
                            />
                            <ReferenceLine y={0} stroke="#b9c2bf" />
                            <Tooltip
                                formatter={function (value) {
                                    return formatARS(Number(value));
                                }}
                                labelFormatter={function (m) {
                                    return formatMonth(String(m));
                                }}
                                contentStyle={{ borderRadius: 6, borderColor: "#dbe0de", fontSize: 12 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
                            {SERIES.map(function (s) {
                                return (
                                    <Line
                                        key={s.key}
                                        type="monotone"
                                        dataKey={s.key}
                                        name={s.name}
                                        stroke={s.color}
                                        strokeWidth={2}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={false}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
