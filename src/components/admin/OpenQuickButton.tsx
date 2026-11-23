"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useQuickActions, type QuickKind } from "./quick/QuickActions";

export function OpenQuickButton({
    kind,
    label,
    supplierId,
    customerId,
    variant = "default",
    expenseType,
}: {
    kind: QuickKind;
    label: string;
    supplierId?: string;
    customerId?: string;
    variant?: "default" | "secondary";
    expenseType?: "expense" | "income" | "transfer";
}) {
    const { open } = useQuickActions();
    return (
        <Button
            variant={variant}
            onClick={function () {
                open(kind, { supplierId, customerId, expenseType });
            }}
        >
            <PlusIcon />
            {label}
        </Button>
    );
}
