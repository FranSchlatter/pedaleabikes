import { ArrowUpRightIcon, ClockIcon, MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { BusinessInfo } from "@/types";
import { OpenStatus } from "./OpenStatus";
import { ScheduleTable } from "./ScheduleTable";

type LocationProps = {
    business: BusinessInfo;
};

export function Location({ business }: LocationProps) {
    const query = encodeURIComponent(
        `${business.address.street}, ${business.address.city}, ${business.address.region}, ${business.address.country}`,
    );
    const mapSrc = `https://www.google.com/maps?q=${query}&output=embed`;
    const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

    return (
        <section
            id="ubicacion"
            aria-labelledby="ubicacion-title"
            className="relative overflow-hidden bg-ink py-24 text-chalk md:py-32"
        >
            <div className="container-x">
                <SectionHeading
                    id="ubicacion-title"
                    eyebrow="Ubicación y horarios"
                    tone="dark"
                    title={
                        <>
                            Vení a <span className="text-accent">visitarnos</span>
                        </>
                    }
                />
                <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                    <Reveal className="relative min-h-[22rem] overflow-hidden rounded-[2rem] ring-1 ring-white/10 lg:min-h-[32rem]">
                        <iframe
                            title={`Mapa: ${business.name} en ${business.address.street}, ${business.address.city}`}
                            src={mapSrc}
                            className="absolute inset-0 size-full grayscale-[0.6] contrast-[1.05]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </Reveal>
                    <Reveal
                        delay={0.1}
                        className="flex flex-col gap-6 rounded-[2rem] bg-ink-2 p-7 ring-1 ring-white/10 md:p-9"
                    >
                        <div>
                            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-mint">
                                <MapPinIcon className="size-4" /> Dirección
                            </p>
                            <p className="heading-display mt-3 text-3xl md:text-4xl">
                                {business.address.street}
                            </p>
                            <p className="mt-1 text-steel">
                                {business.address.city} Capital, {business.address.region}
                            </p>
                        </div>
                        <div>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-mint">
                                    <ClockIcon className="size-4" /> Horarios
                                </p>
                                <OpenStatus
                                    schedule={business.schedule}
                                    className="!bg-transparent text-xs"
                                />
                            </div>
                            <ScheduleTable schedule={business.schedule} />
                        </div>
                        <div className="mt-auto flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                            <a
                                href={directionsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-bold text-ink transition-transform hover:-translate-y-0.5"
                            >
                                Cómo llegar
                                <ArrowUpRightIcon className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                            <a
                                href={buildWhatsAppLink("Hola! Quería hacer una consulta.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-4 font-bold text-chalk ring-1 ring-white/20 transition-colors hover:bg-chalk hover:text-ink"
                            >
                                <WhatsAppIcon className="size-5" />
                                {business.phoneDisplay}
                            </a>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
