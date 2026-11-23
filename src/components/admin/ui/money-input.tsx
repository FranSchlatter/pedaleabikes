"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/admin/cn";
import { formatNumber, parseARS } from "@/lib/admin/money";
import { fieldClass } from "./input";

type Props = Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
    value: number | null;
    onValueChange: (value: number | null) => void;
};

// Campo de monto: muestra 12.000 y acepta "12000", "12.000" o "12.000,50".
export function MoneyInput({ value, onValueChange, className, onBlur, onFocus, ...props }: Props) {
    const [text, setText] = useState("");
    const [editing, setEditing] = useState(false);
    const formatted = value === null ? "" : formatNumber(value);

    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                $
            </span>
            <input
                {...props}
                type="text"
                inputMode="decimal"
                value={editing ? text : formatted}
                onFocus={function (e) {
                    setText(formatted);
                    setEditing(true);
                    e.target.select();
                    onFocus?.(e);
                }}
                onChange={function (e) {
                    setText(e.target.value);
                    onValueChange(parseARS(e.target.value));
                }}
                onBlur={function (e) {
                    setEditing(false);
                    onBlur?.(e);
                }}
                className={cn(fieldClass, "h-9 pl-6 text-right tabular-nums", className)}
            />
        </div>
    );
}
