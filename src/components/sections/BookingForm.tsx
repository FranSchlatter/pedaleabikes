"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNowMinute } from "@/hooks/useNow";
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { getUpcomingBusinessDays } from "@/lib/schedule";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { DaySchedule, Service } from "@/types";
import { SELECT_SERVICE_EVENT } from "./SelectServiceLink";

type BookingFormProps = {
    services: Service[];
    schedule: DaySchedule[];
};

const DAYS_AHEAD = 12;

const bookingSchema = z.object({
    service: z.string().min(1, { error: "Elegí un servicio" }),
    day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Elegí el día en que traés la bici" }),
    name: z
        .string()
        .trim()
        .min(2, { error: "Contanos tu nombre" })
        .max(60, { error: "Máximo 60 caracteres" }),
    bikeModel: z
        .string()
        .trim()
        .min(2, { error: "Contanos qué bici es (marca, modelo o tipo)" })
        .max(80, { error: "Máximo 80 caracteres" }),
    comment: z.string().trim().max(500, { error: "Máximo 500 caracteres" }),
});

type BookingValues = z.infer<typeof bookingSchema>;

function buildMessage(values: BookingValues, serviceName: string, dayLabel: string) {
    const lines = [
        "Hola! Quiero sacar turno para el taller 🔧",
        "",
        `• Servicio: ${serviceName}`,
        `• Día en que dejo la bici: ${dayLabel}`,
        `• Nombre: ${values.name}`,
        `• Bici: ${values.bikeModel}`,
    ];
    if (values.comment) {
        lines.push(`• Comentario: ${values.comment}`);
    }
    return lines.join("\n");
}

function fieldClass(hasError: boolean) {
    return `w-full rounded-2xl border bg-ink-2 px-4 py-3.5 text-base text-chalk placeholder:text-steel/70 transition-colors focus:border-accent focus:outline-none focus-visible:outline-none ${
        hasError ? "border-accent" : "border-white/10 hover:border-white/25"
    }`;
}

function ErrorText({ id, message }: { id: string; message?: string }) {
    return (
        <AnimatePresence initial={false}>
            {message && (
                <m.p
                    id={id}
                    role="alert"
                    className="mt-2 text-sm font-medium text-accent"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    {message}
                </m.p>
            )}
        </AnimatePresence>
    );
}

export function BookingForm({ services, schedule }: BookingFormProps) {
    const now = useNowMinute();
    const nowKey = now?.getTime() ?? null;
    const days = useMemo(
        function () {
            return nowKey === null
                ? []
                : getUpcomingBusinessDays(schedule, new Date(nowKey), DAYS_AHEAD);
        },
        [schedule, nowKey],
    );
    const [sentLink, setSentLink] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<BookingValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: { service: "", day: "", name: "", bikeModel: "", comment: "" },
    });

    useEffect(
        function () {
            function onSelect(event: Event) {
                const slug = (event as CustomEvent<string>).detail;
                setValue("service", slug, { shouldValidate: true });
            }
            window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
            return function () {
                window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
            };
        },
        [setValue],
    );

    function onValid(values: BookingValues) {
        const service = services.find(function (item) {
            return item.slug === values.service;
        });
        // Se recalcula al enviar: si el form quedó abierto de un día para otro, el día elegido puede haber pasado.
        const freshDays = getUpcomingBusinessDays(schedule, new Date(), DAYS_AHEAD);
        const day = freshDays.find(function (item) {
            return item.value === values.day;
        });
        if (!service) {
            setError("service", { message: "Elegí un servicio" });
            return;
        }
        if (!day) {
            setError("day", { message: "Ese día ya no está disponible, elegí otro" });
            return;
        }
        const link = buildWhatsAppLink(buildMessage(values, service.name, day.label));
        setSentLink(link);
        window.open(link, "_blank", "noopener,noreferrer");
    }

    return (
        <form
            onSubmit={handleSubmit(onValid)}
            noValidate
            className="relative rounded-[2rem] bg-ink p-6 text-chalk shadow-[0_40px_80px_-40px_rgba(14,15,17,0.9)] sm:p-8 md:p-10"
            aria-describedby="turno-ayuda"
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="service" className="mb-2 block text-sm font-semibold">
                        Servicio
                    </label>
                    <select
                        id="service"
                        className={fieldClass(Boolean(errors.service))}
                        aria-invalid={Boolean(errors.service)}
                        aria-describedby={errors.service ? "service-error" : undefined}
                        {...register("service")}
                    >
                        <option value="">Elegí un servicio</option>
                        {services.map(function (service) {
                            return (
                                <option key={service.id} value={service.slug}>
                                    {service.name}
                                </option>
                            );
                        })}
                    </select>
                    <ErrorText id="service-error" message={errors.service?.message} />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="day" className="mb-2 block text-sm font-semibold">
                        Día en que traés la bici
                    </label>
                    <select
                        id="day"
                        className={fieldClass(Boolean(errors.day))}
                        aria-invalid={Boolean(errors.day)}
                        aria-describedby={errors.day ? "day-error day-help" : "day-help"}
                        disabled={days.length === 0}
                        {...register("day")}
                    >
                        <option value="">
                            {days.length === 0 ? "Cargando días…" : "Elegí un día hábil"}
                        </option>
                        {days.map(function (day) {
                            return (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            );
                        })}
                    </select>
                    <p id="day-help" className="mt-2 text-xs text-steel">
                        Solo días en que el local abre. No es un horario exacto: es el día en que
                        dejás la bici.
                    </p>
                    <ErrorText id="day-error" message={errors.day?.message} />
                </div>

                <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold">
                        Tu nombre
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Ej: Juli"
                        className={fieldClass(Boolean(errors.name))}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        {...register("name")}
                    />
                    <ErrorText id="name-error" message={errors.name?.message} />
                </div>

                <div>
                    <label htmlFor="bikeModel" className="mb-2 block text-sm font-semibold">
                        Modelo de bici
                    </label>
                    <input
                        id="bikeModel"
                        type="text"
                        placeholder="Ej: Venzo MTB rodado 29"
                        className={fieldClass(Boolean(errors.bikeModel))}
                        aria-invalid={Boolean(errors.bikeModel)}
                        aria-describedby={errors.bikeModel ? "bikeModel-error" : undefined}
                        {...register("bikeModel")}
                    />
                    <ErrorText id="bikeModel-error" message={errors.bikeModel?.message} />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="comment" className="mb-2 block text-sm font-semibold">
                        Comentario <span className="font-normal text-steel">(opcional)</span>
                    </label>
                    <textarea
                        id="comment"
                        rows={3}
                        placeholder="Contanos qué le notás: hace ruido, no cambia bien, pinchadura…"
                        className={`${fieldClass(Boolean(errors.comment))} resize-none`}
                        aria-invalid={Boolean(errors.comment)}
                        aria-describedby={errors.comment ? "comment-error" : undefined}
                        {...register("comment")}
                    />
                    <ErrorText id="comment-error" message={errors.comment?.message} />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-base font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
                <WhatsAppIcon className="size-5" />
                Enviar por WhatsApp
                <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
            </button>

            <AnimatePresence>
                {sentLink && (
                    <m.div
                        className="mt-5 flex items-start gap-3 rounded-2xl border border-lime/30 bg-lime/10 p-4 text-sm"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        role="status"
                    >
                        <CheckIcon className="mt-0.5 size-5 shrink-0 text-lime" />
                        <p>
                            Te abrimos WhatsApp con el mensaje listo, solo tenés que enviarlo. ¿No
                            se abrió?{" "}
                            <a
                                href={sentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-lime underline underline-offset-4"
                            >
                                Tocá acá
                            </a>
                            .
                        </p>
                    </m.div>
                )}
            </AnimatePresence>
        </form>
    );
}
