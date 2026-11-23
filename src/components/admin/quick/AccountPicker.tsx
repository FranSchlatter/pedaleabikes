"use client";

import { cn } from "@/lib/admin/cn";
import type { Option } from "@/lib/admin/types";

// Botones grandes para elegir cuenta/medio de pago con un click.
export function AccountPicker({
    accounts,
    value,
    onChange,
}: {
    accounts: Option[];
    value: string | null;
    onChange: (id: string) => void;
}) {
    return (
        <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {accounts.map(function (account) {
                const selected = account.id === value;
                return (
                    <button
                        key={account.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={function () {
                            onChange(account.id);
                        }}
                        className={cn(
                            "h-10 rounded-md border px-2 text-sm font-semibold transition-colors",
                            selected
                                ? "border-primary bg-primary text-white"
                                : "border-line-strong bg-surface text-ink hover:bg-canvas",
                        )}
                    >
                        {account.name}
                    </button>
                );
            })}
        </div>
    );
}
