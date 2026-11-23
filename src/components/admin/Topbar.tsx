"use client";

import { PlusIcon } from "lucide-react";
import { Kbd } from "./ui/misc";
import { useQuickActions, type QuickKind } from "./quick/QuickActions";

const ACTIONS: { kind: QuickKind; label: string; key: string; primary?: boolean }[] = [
    { kind: "sale", label: "Venta", key: "V", primary: true },
    { kind: "workOrder", label: "Orden", key: "O" },
    { kind: "purchase", label: "Compra", key: "C" },
    { kind: "expense", label: "Gasto", key: "G" },
];

export function Topbar() {
    const { open } = useQuickActions();
    return (
        <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
            <div className="flex items-center justify-end gap-1.5 py-2 pl-14 pr-3 sm:gap-2 sm:pr-5 lg:px-6">
                {ACTIONS.map(function (action) {
                    return (
                        <button
                            key={action.kind}
                            type="button"
                            onClick={function () {
                                open(action.kind);
                            }}
                            title={`${action.label} (tecla ${action.key})`}
                            className={
                                action.primary
                                    ? "inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-bold text-white hover:bg-primary-hover sm:px-4"
                                    : "inline-flex h-10 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-2.5 text-sm font-bold text-ink hover:bg-canvas sm:px-3.5"
                            }
                        >
                            <PlusIcon className="size-4" />
                            {action.label}
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
