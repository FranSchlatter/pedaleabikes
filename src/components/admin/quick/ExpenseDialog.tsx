"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTransaction } from "@/app/admin/actions/cash";
import { Button } from "@/components/admin/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/admin/ui/dialog";
import { Field, Input, NativeSelect } from "@/components/admin/ui/input";
import { MoneyInput } from "@/components/admin/ui/money-input";
import { cn } from "@/lib/admin/cn";
import { dateInputToTimestamp, todayAR } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import type { Catalog } from "@/lib/admin/types";

export type ExpenseType = "expense" | "income" | "transfer";

const TABS: { value: ExpenseType; label: string }[] = [
    { value: "expense", label: "Gasto" },
    { value: "income", label: "Ingreso" },
    { value: "transfer", label: "Transferencia" },
];

type Props = {
    catalog: Catalog | null;
    initialType: ExpenseType;
    onOpenChange: (open: boolean) => void;
    onDone: () => void;
};

export function ExpenseDialog({ catalog, initialType, onOpenChange, onDone }: Props) {
    const [type, setType] = useState<ExpenseType>(initialType);
    const [categoryId, setCategoryId] = useState("");
    const [accountId, setAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [amount, setAmount] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(todayAR());
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const accounts = catalog?.accounts ?? [];
    const categories = (catalog?.categories ?? []).filter(function (c) {
        return c.type === type;
    });
    const effectiveCategory =
        categoryId &&
        categories.some(function (c) {
            return c.id === categoryId;
        })
            ? categoryId
            : (categories.find(function (c) {
                  return c.code !== "mercaderia";
              })?.id ?? "");
    const effectiveAccount = accountId || accounts[0]?.id || "";
    const effectiveTo =
        toAccountId ||
        accounts.find(function (a) {
            return a.id !== effectiveAccount;
        })?.id ||
        "";
    const isMerch =
        categories.find(function (c) {
            return c.id === effectiveCategory;
        })?.code === "mercaderia";

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!amount || amount <= 0) {
            setError("Ingresá un monto mayor a cero.");
            return;
        }
        startTransition(async function () {
            const occurred_at = dateInputToTimestamp(date);
            const result =
                type === "transfer"
                    ? await createTransaction({
                          type,
                          occurred_at,
                          account_id: effectiveAccount,
                          to_account_id: effectiveTo,
                          amount,
                          description,
                      })
                    : await createTransaction({
                          type,
                          occurred_at,
                          category_id: effectiveCategory,
                          account_id: effectiveAccount,
                          amount,
                          description,
                          supplier_id: type === "expense" && supplierId ? supplierId : null,
                      });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            const label = TABS.find(function (t) {
                return t.value === type;
            })?.label;
            toast.success(`${label} registrado · ${formatARS(amount)}`);
            onDone();
        });
    }

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent size="sm">
                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                    <DialogHeader>
                        <DialogTitle>Movimiento de caja</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="space-y-3">
                        <div
                            role="tablist"
                            className="grid grid-cols-3 rounded-md border border-line-strong p-0.5 text-sm font-semibold"
                        >
                            {TABS.map(function (tab) {
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        role="tab"
                                        aria-selected={type === tab.value}
                                        onClick={function () {
                                            setType(tab.value);
                                        }}
                                        className={cn(
                                            "rounded py-1.5",
                                            type === tab.value
                                                ? "bg-ink text-chalk"
                                                : "text-muted hover:text-ink",
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <Field label="Monto">
                            <MoneyInput
                                value={amount}
                                onValueChange={setAmount}
                                autoFocus
                                className="h-11 text-lg"
                            />
                        </Field>

                        {type === "transfer" ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Desde" htmlFor="tx-from">
                                    <NativeSelect
                                        id="tx-from"
                                        value={effectiveAccount}
                                        onChange={function (e) {
                                            setAccountId(e.target.value);
                                        }}
                                    >
                                        {accounts.map(function (a) {
                                            return (
                                                <option key={a.id} value={a.id}>
                                                    {a.name}
                                                </option>
                                            );
                                        })}
                                    </NativeSelect>
                                </Field>
                                <Field label="Hacia" htmlFor="tx-to">
                                    <NativeSelect
                                        id="tx-to"
                                        value={effectiveTo}
                                        onChange={function (e) {
                                            setToAccountId(e.target.value);
                                        }}
                                    >
                                        {accounts.map(function (a) {
                                            return (
                                                <option key={a.id} value={a.id}>
                                                    {a.name}
                                                </option>
                                            );
                                        })}
                                    </NativeSelect>
                                </Field>
                                <p className="col-span-2 text-xs text-muted">
                                    Las transferencias entre cuentas no cuentan como ingreso ni
                                    gasto.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Categoría" htmlFor="tx-category">
                                    <NativeSelect
                                        id="tx-category"
                                        value={effectiveCategory}
                                        onChange={function (e) {
                                            setCategoryId(e.target.value);
                                        }}
                                    >
                                        {categories.map(function (c) {
                                            return (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            );
                                        })}
                                    </NativeSelect>
                                </Field>
                                <Field
                                    label={type === "expense" ? "Pagado con" : "Cobrado en"}
                                    htmlFor="tx-account"
                                >
                                    <NativeSelect
                                        id="tx-account"
                                        value={effectiveAccount}
                                        onChange={function (e) {
                                            setAccountId(e.target.value);
                                        }}
                                    >
                                        {accounts.map(function (a) {
                                            return (
                                                <option key={a.id} value={a.id}>
                                                    {a.name}
                                                </option>
                                            );
                                        })}
                                    </NativeSelect>
                                </Field>
                                {isMerch ? (
                                    <p className="col-span-2 rounded-md bg-warning-soft px-2 py-1.5 text-xs text-warning">
                                        Para mercadería usá <b>+ Compra</b>: así suma stock y
                                        actualiza costos.
                                    </p>
                                ) : null}
                                {type === "expense" ? (
                                    <Field
                                        label="Proveedor (opcional)"
                                        htmlFor="tx-supplier"
                                        className="col-span-2"
                                    >
                                        <NativeSelect
                                            id="tx-supplier"
                                            value={supplierId}
                                            onChange={function (e) {
                                                setSupplierId(e.target.value);
                                            }}
                                        >
                                            <option value="">—</option>
                                            {(catalog?.suppliers ?? []).map(function (s) {
                                                return (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name}
                                                    </option>
                                                );
                                            })}
                                        </NativeSelect>
                                    </Field>
                                ) : null}
                            </div>
                        )}

                        <div className="grid grid-cols-[1fr_auto] gap-3">
                            <Field label="Descripción" htmlFor="tx-desc">
                                <Input
                                    id="tx-desc"
                                    value={description}
                                    placeholder={type === "expense" ? "Ej.: luz de noviembre" : ""}
                                    onChange={function (e) {
                                        setDescription(e.target.value);
                                    }}
                                />
                            </Field>
                            <Field label="Fecha" htmlFor="tx-date">
                                <Input
                                    id="tx-date"
                                    type="date"
                                    value={date}
                                    onChange={function (e) {
                                        setDate(e.target.value || todayAR());
                                    }}
                                />
                            </Field>
                        </div>

                        {error ? (
                            <p
                                role="alert"
                                className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
                            >
                                {error}
                            </p>
                        ) : null}
                    </DialogBody>
                    <DialogFooter>
                        <Button type="submit" disabled={pending || !catalog}>
                            {pending ? "Guardando…" : "Guardar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
