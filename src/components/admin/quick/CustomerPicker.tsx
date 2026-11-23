"use client";

import { XIcon } from "lucide-react";
import { useMemo } from "react";
import { SearchSelect } from "@/components/admin/ui/search-select";
import type { CustomerOption } from "@/lib/admin/types";

export function CustomerPicker({
    customers,
    value,
    onChange,
    placeholder = "Buscar por nombre o teléfono…",
}: {
    customers: CustomerOption[];
    value: string | null;
    onChange: (id: string | null) => void;
    placeholder?: string;
}) {
    const options = useMemo(
        function () {
            return customers.map(function (c) {
                return { key: c.id, label: c.name, keywords: c.phone ?? "", sublabel: c.phone ?? undefined };
            });
        },
        [customers],
    );
    const selected = customers.find(function (c) {
        return c.id === value;
    });

    if (selected) {
        return (
            <div className="flex h-10 items-center justify-between gap-2 rounded-md border border-primary/40 bg-info-soft px-3 text-sm">
                <span className="truncate">
                    <span className="font-semibold">{selected.name}</span>
                    {selected.phone ? <span className="text-muted"> · {selected.phone}</span> : null}
                </span>
                <button
                    type="button"
                    className="rounded p-1 text-muted hover:text-ink"
                    aria-label="Quitar cliente"
                    onClick={function () {
                        onChange(null);
                    }}
                >
                    <XIcon className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <SearchSelect
            options={options}
            placeholder={placeholder}
            onSelect={function (o) {
                onChange(o.key);
            }}
        />
    );
}
