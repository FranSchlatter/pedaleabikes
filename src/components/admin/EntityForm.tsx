"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/action-types";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Field, Input, NativeSelect, Textarea } from "./ui/input";

export type FieldDef = {
    name: string;
    label: string;
    type?: "text" | "textarea" | "select" | "checkbox" | "tel" | "email";
    options?: string[];
    required?: boolean;
    full?: boolean;
    placeholder?: string;
};

type Props = {
    title: string;
    fields: FieldDef[];
    initial?: Record<string, string | boolean | null>;
    triggerLabel: string;
    editing?: boolean;
    // Ruta base a la que ir después de crear: se le agrega el id.
    redirectBase?: string;
    // Server Action (se puede pasar como prop desde un Server Component).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSave: (values: any) => Promise<ActionResult<{ id: string }>>;
    // Valores fijos que se agregan al guardar (id, customer_id, ...).
    extra?: Record<string, string>;
};

// Formulario genérico en modal para ABMs simples (proveedores, clientes, bicis).
export function EntityForm({
    title,
    fields,
    initial = {},
    triggerLabel,
    editing,
    redirectBase,
    onSave,
    extra,
}: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<Record<string, string | boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function start() {
        const v: Record<string, string | boolean> = {};
        for (const f of fields) {
            const init = initial[f.name];
            v[f.name] = f.type === "checkbox" ? init !== false : ((init as string | null) ?? "");
        }
        setValues(v);
        setError(null);
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async function () {
            const result = await onSave({ ...values, ...extra });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast.success("Guardado");
            setOpen(false);
            if (!editing && redirectBase) router.push(redirectBase + result.data.id);
        });
    }

    return (
        <>
            <Button variant={editing ? "secondary" : "default"} onClick={start}>
                {editing ? <PencilIcon /> : <PlusIcon />}
                {triggerLabel}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent size="md">
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                        </DialogHeader>
                        <DialogBody className="grid gap-3 sm:grid-cols-2">
                            {fields.map(function (f, i) {
                                const id = `ef-${f.name}`;
                                if (f.type === "checkbox") {
                                    return (
                                        <label
                                            key={f.name}
                                            className="flex items-center gap-2 text-sm sm:col-span-2"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={values[f.name] === true}
                                                onChange={function (e) {
                                                    setValues({
                                                        ...values,
                                                        [f.name]: e.target.checked,
                                                    });
                                                }}
                                            />
                                            {f.label}
                                        </label>
                                    );
                                }
                                return (
                                    <Field
                                        key={f.name}
                                        label={f.label}
                                        htmlFor={id}
                                        className={f.full ? "sm:col-span-2" : undefined}
                                    >
                                        {f.type === "textarea" ? (
                                            <Textarea
                                                id={id}
                                                value={String(values[f.name] ?? "")}
                                                onChange={function (e) {
                                                    setValues({
                                                        ...values,
                                                        [f.name]: e.target.value,
                                                    });
                                                }}
                                            />
                                        ) : f.type === "select" ? (
                                            <NativeSelect
                                                id={id}
                                                value={String(values[f.name] ?? "")}
                                                onChange={function (e) {
                                                    setValues({
                                                        ...values,
                                                        [f.name]: e.target.value,
                                                    });
                                                }}
                                            >
                                                <option value="">—</option>
                                                {(f.options ?? []).map(function (o) {
                                                    return (
                                                        <option key={o} value={o}>
                                                            {o}
                                                        </option>
                                                    );
                                                })}
                                            </NativeSelect>
                                        ) : (
                                            <Input
                                                id={id}
                                                type={f.type ?? "text"}
                                                required={f.required}
                                                autoFocus={i === 0}
                                                placeholder={f.placeholder}
                                                value={String(values[f.name] ?? "")}
                                                onChange={function (e) {
                                                    setValues({
                                                        ...values,
                                                        [f.name]: e.target.value,
                                                    });
                                                }}
                                            />
                                        )}
                                    </Field>
                                );
                            })}
                            {error ? (
                                <p
                                    role="alert"
                                    className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger sm:col-span-2"
                                >
                                    {error}
                                </p>
                            ) : null}
                        </DialogBody>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={function () {
                                    setOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={pending}>
                                {pending ? "Guardando…" : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
