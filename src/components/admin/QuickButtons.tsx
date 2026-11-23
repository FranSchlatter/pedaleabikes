"use client";

import { ReceiptIcon, ShoppingCartIcon, TruckIcon, WrenchIcon } from "lucide-react";
import { Kbd } from "./ui/misc";
import { useQuickActions, type QuickKind } from "./quick/QuickActions";

const BUTTONS: { kind: QuickKind; label: string; key: string; icon: typeof ShoppingCartIcon }[] = [
    { kind: "sale", label: "Venta", key: "V", icon: ShoppingCartIcon },
    { kind: "workOrder", label: "Orden de trabajo", key: "O", icon: WrenchIcon },
    { kind: "purchase", label: "Compra", key: "C", icon: TruckIcon },
    { kind: "expense", label: "Gasto", key: "G", icon: ReceiptIcon },
];

export function QuickButtons() {
    const { open } = useQuickActions();
    return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {BUTTONS.map(function (b, i) {
                const Icon = b.icon;
                return (
                    <button
                        key={b.kind}
                        type="button"
                        onClick={function () {
                            open(b.kind);
                        }}
                        className={
                            i === 0
                                ? "flex h-16 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-white hover:bg-primary-hover"
                                : "flex h-16 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface text-base font-bold text-ink hover:bg-canvas"
                        }
                    >
                        <Icon className="size-5" />+ {b.label}
                        <span className="hidden sm:inline">
                            <Kbd>{b.key}</Kbd>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
