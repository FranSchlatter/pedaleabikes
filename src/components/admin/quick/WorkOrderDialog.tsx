"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { getCustomerBikes } from "@/app/admin/actions/catalog";
import { createWorkOrder } from "@/app/admin/actions/work-orders";
import { Button } from "@/components/admin/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/admin/ui/dialog";
import { Field, Input, Label, NativeSelect, Textarea } from "@/components/admin/ui/input";
import { MoneyInput } from "@/components/admin/ui/money-input";
import { cn } from "@/lib/admin/cn";
import { BIKE_TYPES, bikeLabel } from "@/lib/admin/labels";
import type { Catalog } from "@/lib/admin/types";
import { CustomerPicker } from "./CustomerPicker";

type Bike = Awaited<ReturnType<typeof getCustomerBikes>>[number];

type Props = {
    catalog: Catalog | null;
    customerId?: string;
    onOpenChange: (open: boolean) => void;
    onDone: () => void;
};

export function WorkOrderDialog({ catalog, customerId: initialCustomer, onOpenChange, onDone }: Props) {
    const router = useRouter();
    const [mode, setMode] = useState<"existing" | "new">("existing");
    const [customerId, setCustomerId] = useState<string | null>(initialCustomer ?? null);
    const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
    const [bikes, setBikes] = useState<Bike[]>([]);
    const [bikeId, setBikeId] = useState<string | "new">("new");
    const [newBike, setNewBike] = useState({ brand: "", model: "", wheel_size: "", bike_type: "", color: "" });
    const [problem, setProblem] = useState("");
    const [promisedAt, setPromisedAt] = useState("");
    const [budget, setBudget] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    useEffect(
        function () {
            let cancelled = false;
            if (mode === "existing" && customerId) {
                getCustomerBikes(customerId).then(function (list) {
                    if (cancelled) return;
                    setBikes(list);
                    setBikeId(list[0]?.id ?? "new");
                });
            }
            return function () {
                cancelled = true;
            };
        },
        [mode, customerId],
    );

    const visibleBikes = mode === "existing" && customerId ? bikes : [];

    function submit() {
        setError(null);
        if (mode === "existing" && !customerId) {
            setError("Elegí un cliente o cargá uno nuevo.");
            return;
        }
        if (mode === "new" && !newCustomer.name.trim()) {
            setError("Falta el nombre del cliente.");
            return;
        }
        const useNewBike = bikeId === "new" || visibleBikes.length === 0;
        startTransition(async function () {
            const result = await createWorkOrder({
                customer_id: mode === "existing" ? customerId : null,
                new_customer: mode === "new" ? newCustomer : undefined,
                bike_id: useNewBike ? null : bikeId,
                new_bike: useNewBike ? newBike : undefined,
                problem,
                promised_at: promisedAt || undefined,
                budget_amount: budget,
            });
            if (!result.ok) {
                setError(result.error);
                return;
            }
            toast.success(`Orden #${result.data.number} creada`);
            onDone();
            router.push(`/admin/ordenes/${result.data.id}`);
        });
    }

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle>Nueva orden de trabajo</DialogTitle>
                    <DialogDescription>Después de crearla cargás repuestos y servicios.</DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <Label className="mb-0">Cliente</Label>
                            <div className="flex rounded-md border border-line-strong p-0.5 text-xs font-semibold">
                                {(["existing", "new"] as const).map(function (m) {
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={function () {
                                                setMode(m);
                                            }}
                                            className={cn(
                                                "rounded px-2 py-1",
                                                mode === m ? "bg-ink text-chalk" : "text-muted hover:text-ink",
                                            )}
                                        >
                                            {m === "existing" ? "Existente" : "Nuevo"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {mode === "existing" ? (
                            <CustomerPicker
                                customers={catalog?.customers ?? []}
                                value={customerId}
                                onChange={setCustomerId}
                            />
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                <Input
                                    placeholder="Nombre y apellido"
                                    aria-label="Nombre"
                                    autoFocus
                                    value={newCustomer.name}
                                    onChange={function (e) {
                                        setNewCustomer({ ...newCustomer, name: e.target.value });
                                    }}
                                />
                                <Input
                                    placeholder="WhatsApp (342 …)"
                                    aria-label="Teléfono"
                                    inputMode="tel"
                                    value={newCustomer.phone}
                                    onChange={function (e) {
                                        setNewCustomer({ ...newCustomer, phone: e.target.value });
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Bici</Label>
                        {visibleBikes.length > 0 ? (
                            <NativeSelect
                                value={bikeId}
                                onChange={function (e) {
                                    setBikeId(e.target.value);
                                }}
                                className="mb-2"
                            >
                                {visibleBikes.map(function (b) {
                                    return (
                                        <option key={b.id} value={b.id}>
                                            {bikeLabel(b)}
                                        </option>
                                    );
                                })}
                                <option value="new">+ Otra bici…</option>
                            </NativeSelect>
                        ) : null}
                        {bikeId === "new" || visibleBikes.length === 0 ? (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                <Input
                                    placeholder="Marca"
                                    aria-label="Marca"
                                    value={newBike.brand}
                                    onChange={function (e) {
                                        setNewBike({ ...newBike, brand: e.target.value });
                                    }}
                                />
                                <Input
                                    placeholder="Modelo"
                                    aria-label="Modelo"
                                    value={newBike.model}
                                    onChange={function (e) {
                                        setNewBike({ ...newBike, model: e.target.value });
                                    }}
                                />
                                <Input
                                    placeholder="Rodado"
                                    aria-label="Rodado"
                                    value={newBike.wheel_size}
                                    onChange={function (e) {
                                        setNewBike({ ...newBike, wheel_size: e.target.value });
                                    }}
                                />
                                <NativeSelect
                                    aria-label="Tipo"
                                    value={newBike.bike_type}
                                    onChange={function (e) {
                                        setNewBike({ ...newBike, bike_type: e.target.value });
                                    }}
                                >
                                    <option value="">Tipo</option>
                                    {BIKE_TYPES.map(function (t) {
                                        return (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        );
                                    })}
                                </NativeSelect>
                                <Input
                                    placeholder="Color"
                                    aria-label="Color"
                                    value={newBike.color}
                                    onChange={function (e) {
                                        setNewBike({ ...newBike, color: e.target.value });
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>

                    <Field label="Problema / pedido del cliente" htmlFor="wo-problem">
                        <Textarea
                            id="wo-problem"
                            value={problem}
                            placeholder="Ej.: hace ruido la transmisión, service general"
                            onChange={function (e) {
                                setProblem(e.target.value);
                            }}
                        />
                    </Field>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Prometida para (opcional)" htmlFor="wo-promised">
                            <Input
                                id="wo-promised"
                                type="date"
                                value={promisedAt}
                                onChange={function (e) {
                                    setPromisedAt(e.target.value);
                                }}
                            />
                        </Field>
                        <Field label="Presupuesto estimado (opcional)">
                            <MoneyInput value={budget} onValueChange={setBudget} />
                        </Field>
                    </div>

                    {error ? (
                        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                            {error}
                        </p>
                    ) : null}
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={function () {
                            onOpenChange(false);
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={submit} disabled={pending}>
                        {pending ? "Creando…" : "Crear orden"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
