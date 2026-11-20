import { ClockIcon, MapPinIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatRanges } from "@/lib/format";
import type { BusinessInfo, Service } from "@/types";
import { BookingForm } from "./BookingForm";

type BookingProps = {
    services: Service[];
    business: BusinessInfo;
};

export function Booking({ services, business }: BookingProps) {
    const openDays = business.schedule.filter(function (day) {
        return day.ranges.length > 0;
    });
    return (
        <section
            id="turno"
            aria-labelledby="turno-title"
            className="relative overflow-hidden bg-chalk-2 py-24 md:py-32"
        >
            <span
                aria-hidden
                className="heading-display pointer-events-none absolute -right-6 top-10 select-none text-[18vw] leading-none bg-brand bg-clip-text text-transparent opacity-[0.1] lg:text-[12rem]"
            >
                Turno
            </span>
            <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <SectionHeading
                        id="turno-title"
                        eyebrow="Turnos"
                        title={
                            <>
                                Sacá turno
                                <br />
                                <span className="text-accent-ink">para el taller</span>
                            </>
                        }
                        description="Completá el formulario y te abrimos WhatsApp con el mensaje listo para mandar."
                    />
                    <Reveal delay={0.1} className="mt-10 space-y-4">
                        <div
                            id="turno-ayuda"
                            className="rounded-3xl border-2 border-dashed border-ink/20 p-6"
                        >
                            <p className="heading-display text-2xl">Ojo: no es un horario exacto</p>
                            <p className="mt-2 leading-relaxed text-graphite">
                                Elegís el{" "}
                                <strong className="text-ink">día en que dejás la bici</strong>. La
                                traés cuando te quede cómodo dentro del horario de atención y te
                                mandamos el presupuesto por WhatsApp.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 text-sm text-graphite sm:flex-row sm:gap-8">
                            <p className="flex items-center gap-2">
                                <MapPinIcon className="size-5 text-accent-ink" />
                                {business.address.street}, {business.address.city}
                            </p>
                            <p className="flex items-center gap-2">
                                <ClockIcon className="size-5 text-accent-ink" />
                                {openDays.length} días hábiles por semana
                            </p>
                        </div>
                        <ul className="grid grid-cols-1 gap-1 text-sm text-graphite sm:grid-cols-2">
                            {openDays.map(function (day) {
                                return (
                                    <li key={day.day}>
                                        <span className="font-semibold text-ink">{day.label}:</span>{" "}
                                        {formatRanges(day.ranges)}
                                    </li>
                                );
                            })}
                        </ul>
                    </Reveal>
                </div>
                <Reveal delay={0.15}>
                    <BookingForm services={services} schedule={business.schedule} />
                </Reveal>
            </div>
        </section>
    );
}
