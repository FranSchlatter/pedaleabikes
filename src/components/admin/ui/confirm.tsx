"use client";

import { AlertDialog } from "radix-ui";
import { useState, useTransition, type ReactNode } from "react";
import { Button } from "./button";
import { Input, Label } from "./input";

type ConfirmProps = {
    trigger: ReactNode;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    // Pide un motivo (anulaciones). Se pasa a onConfirm.
    askReason?: boolean;
    // Exige escribir esta palabra para habilitar el botón (acciones destructivas grandes).
    typeToConfirm?: string;
    destructive?: boolean;
    onConfirm: (reason: string) => Promise<boolean | void> | boolean | void;
};

export function Confirm({
    trigger,
    title,
    description,
    confirmLabel = "Confirmar",
    askReason = false,
    typeToConfirm,
    destructive = true,
    onConfirm,
}: ConfirmProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [typed, setTyped] = useState("");
    const [pending, startTransition] = useTransition();
    const blocked = Boolean(typeToConfirm) && typed !== typeToConfirm;

    function handleConfirm() {
        startTransition(async function () {
            const result = await onConfirm(reason);
            if (result !== false) {
                setOpen(false);
                setReason("");
                setTyped("");
            }
        });
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-ink/50" />
                <AlertDialog.Content className="fixed left-1/2 top-[15vh] z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-lg border border-line bg-surface p-5 shadow-xl">
                    <AlertDialog.Title className="text-base font-bold">{title}</AlertDialog.Title>
                    <AlertDialog.Description asChild>
                        <div className="mt-2 text-sm text-muted">{description}</div>
                    </AlertDialog.Description>
                    {askReason ? (
                        <div className="mt-4">
                            <Label htmlFor="confirm-reason">Motivo (opcional)</Label>
                            <Input
                                id="confirm-reason"
                                autoFocus
                                value={reason}
                                onChange={function (e) {
                                    setReason(e.target.value);
                                }}
                                placeholder="Ej.: cargada por error"
                            />
                        </div>
                    ) : null}
                    {typeToConfirm ? (
                        <div className="mt-4">
                            <Label htmlFor="confirm-type">
                                Escribí {typeToConfirm} para confirmar
                            </Label>
                            <Input
                                id="confirm-type"
                                autoFocus={!askReason}
                                value={typed}
                                autoComplete="off"
                                onChange={function (e) {
                                    setTyped(e.target.value);
                                }}
                            />
                        </div>
                    ) : null}
                    <div className="mt-5 flex justify-end gap-2">
                        <AlertDialog.Cancel asChild>
                            <Button variant="secondary" disabled={pending}>
                                Volver
                            </Button>
                        </AlertDialog.Cancel>
                        <Button
                            variant={destructive ? "danger" : "default"}
                            disabled={pending || blocked}
                            onClick={handleConfirm}
                        >
                            {pending ? "Procesando…" : confirmLabel}
                        </Button>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}
