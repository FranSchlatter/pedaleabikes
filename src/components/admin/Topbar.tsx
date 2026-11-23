"use client";

import { ReceiptIcon, ShoppingCartIcon, TruckIcon, WrenchIcon } from "lucide-react";
import { cn } from "@/lib/admin/cn";
import { Kbd } from "./ui/misc";
import { useQuickActions, type QuickKind } from "./quick/QuickActions";

const ACTIONS: {
    kind: QuickKind;
    label: string;
    key: string;
    icon: typeof ShoppingCartIcon;
    primary?: boolean;
}[] = [
    { kind: "sale", label: "Venta", key: "V", icon: ShoppingCartIcon, primary: true },
    { kind: "workOrder", label: "Orden", key: "O", icon: WrenchIcon },
    { kind: "purchase", label: "Compra", key: "C", icon: TruckIcon },
    { kind: "expense", label: "Gasto", key: "G", icon: ReceiptIcon },
];

export function Topbar() {
    const { open } = useQuickActions();
    return (
        <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
            {/* En mobile deja lugar al botón de menú (fijo, arriba a la izquierda). */}
            <div className="flex items-center justify-end gap-1.5 py-2 pl-14 pr-2 sm:gap-2 sm:pr-5 lg:px-6">
                {ACTIONS.map(function (action) {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.kind}
                            type="button"
                            onClick={function () {
                                open(action.kind);
                            }}
                            title={`${action.label} (tecla ${action.key})`}
                            aria-label={`Nueva ${action.label.toLowerCase()}`}
                            className={cn(
                                "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md text-sm font-bold",
                                action.primary
                                    ? "bg-primary px-3 text-white hover:bg-primary-hover sm:px-4"
                                    : "border border-line-strong bg-surface px-2.5 text-ink hover:bg-canvas sm:px-3.5",
                            )}
                        >
                            <Icon className="size-4" />
                            {/* En mobile solo el ícono, salvo la venta (la acción más usada). */}
                            <span className={action.primary ? undefined : "hidden sm:inline"}>
                                + {action.label}
                            </span>
                            <span className="hidden md:inline">
                                <Kbd>{action.key}</Kbd>
                            </span>
                        </button>
                    );
                })}
            </div>
        </header>
    );
}
