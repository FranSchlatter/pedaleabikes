"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { getCatalog } from "@/app/admin/actions/catalog";
import type { Catalog } from "@/lib/admin/types";
import { ExpenseDialog, type ExpenseType } from "./ExpenseDialog";
import { PurchaseDialog } from "./PurchaseDialog";
import { SaleDialog } from "./SaleDialog";
import { WorkOrderDialog } from "./WorkOrderDialog";

export type QuickKind = "sale" | "workOrder" | "purchase" | "expense";

type OpenOptions = { expenseType?: ExpenseType; supplierId?: string; customerId?: string };

type QuickContext = {
    open: (kind: QuickKind, options?: OpenOptions) => void;
    catalog: Catalog | null;
    reloadCatalog: () => void;
};

const Context = createContext<QuickContext | null>(null);

export function useQuickActions() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useQuickActions fuera de QuickActionsProvider");
    return ctx;
}

const SHORTCUTS: Record<string, QuickKind> = {
    v: "sale",
    o: "workOrder",
    c: "purchase",
    g: "expense",
};

function isTyping(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        Boolean(target.closest("[role=dialog], [role=alertdialog]"))
    );
}

export function QuickActionsProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<{ kind: QuickKind; options: OpenOptions } | null>(null);
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const loading = useRef(false);

    const reloadCatalog = useCallback(function reloadCatalog() {
        if (loading.current) return;
        loading.current = true;
        getCatalog()
            .then(setCatalog)
            .catch(function (error) {
                console.error(error);
            })
            .finally(function () {
                loading.current = false;
            });
    }, []);

    const open = useCallback(
        function open(kind: QuickKind, options: OpenOptions = {}) {
            setCurrent({ kind, options });
            // Muestra lo que ya hay y refresca en segundo plano (stock y precios cambian).
            reloadCatalog();
        },
        [reloadCatalog],
    );

    useEffect(
        function () {
            function onKey(e: KeyboardEvent) {
                if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
                if (isTyping(e.target) || document.querySelector("[role=dialog], [role=alertdialog]")) {
                    return;
                }
                const kind = SHORTCUTS[e.key.toLowerCase()];
                if (kind) {
                    e.preventDefault();
                    open(kind);
                }
            }
            window.addEventListener("keydown", onKey);
            return function () {
                window.removeEventListener("keydown", onKey);
            };
        },
        [open],
    );

    const value = useMemo(
        function () {
            return { open, catalog, reloadCatalog };
        },
        [open, catalog, reloadCatalog],
    );

    function close(isOpen: boolean) {
        if (!isOpen) setCurrent(null);
    }

    function done() {
        setCurrent(null);
        reloadCatalog();
    }

    return (
        <Context value={value}>
            {children}
            {current?.kind === "sale" ? (
                <SaleDialog
                    catalog={catalog}
                    customerId={current.options.customerId}
                    onOpenChange={close}
                    onDone={done}
                />
            ) : null}
            {current?.kind === "workOrder" ? (
                <WorkOrderDialog
                    catalog={catalog}
                    customerId={current.options.customerId}
                    onOpenChange={close}
                    onDone={done}
                />
            ) : null}
            {current?.kind === "purchase" ? (
                <PurchaseDialog
                    catalog={catalog}
                    supplierId={current.options.supplierId}
                    onOpenChange={close}
                    onDone={done}
                />
            ) : null}
            {current?.kind === "expense" ? (
                <ExpenseDialog
                    catalog={catalog}
                    initialType={current.options.expenseType ?? "expense"}
                    onOpenChange={close}
                    onDone={done}
                />
            ) : null}
        </Context>
    );
}
