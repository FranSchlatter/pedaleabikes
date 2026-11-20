import { ArrowRightIcon, CheckIcon, ClockIcon, InstagramIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/types";
import { SelectServiceLink } from "./SelectServiceLink";

type ServicesProps = {
    services: Service[];
};

// Todos los services comparten el mismo video, así que el link del encabezado usa el primero.
function getSectionVideoUrl(services: Service[]) {
    return services.find(function (service) {
        return service.videoUrl;
    })?.videoUrl;
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
    const dark = service.highlighted;
    return (
        <article
            className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-2 md:p-8 ${
                dark
                    ? "bg-ink text-chalk shadow-[0_30px_60px_-30px_rgba(14,15,17,0.8)] hover:shadow-[0_40px_80px_-30px_rgba(79,179,174,0.45)]"
                    : "bg-white text-ink shadow-[0_20px_50px_-35px_rgba(14,15,17,0.5)] ring-1 ring-ink/5 hover:shadow-[0_35px_70px_-35px_rgba(14,15,17,0.55)]"
            }`}
        >
            {dark && (
                <span className="absolute right-6 top-6 rounded-full bg-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                    Más elegido
                </span>
            )}
            <div className="flex items-end justify-between gap-4">
                <span
                    aria-hidden
                    className={`heading-display text-7xl leading-none ${dark ? "text-outline-chalk opacity-30" : "text-outline-ink opacity-15"}`}
                >
                    0{index + 1}
                </span>
                {service.videoUrl && (
                    <a
                        href={service.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver en Instagram el video de qué incluye el ${service.name}`}
                        title="¿Qué incluye? Mirá el video"
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors ${
                            dark
                                ? "bg-white/10 text-chalk hover:bg-accent hover:text-ink"
                                : "bg-chalk text-ink hover:bg-ink hover:text-chalk"
                        }`}
                    >
                        ?
                    </a>
                )}
            </div>
            <h3 className="heading-display mt-4 text-2xl hyphens-auto md:text-3xl xl:text-[1.7rem]">
                {service.name}
            </h3>
            <p className={`mt-3 leading-relaxed ${dark ? "text-steel" : "text-graphite"}`}>
                {service.description}
            </p>

            {service.estimatedTime && (
                <p
                    className={`mt-4 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold ${
                        dark ? "bg-white/10 text-chalk" : "bg-chalk text-graphite"
                    }`}
                >
                    <ClockIcon className="size-3.5" />
                    Listo en {service.estimatedTime}
                </p>
            )}
            <ul className="mb-8 mt-6 space-y-2.5 text-sm">
                {service.includes.map(function (item) {
                    return (
                        <li key={item} className="flex gap-2.5">
                            <CheckIcon
                                className={`mt-0.5 size-4 shrink-0 ${dark ? "text-mint" : "text-accent-ink"}`}
                            />
                            {item}
                        </li>
                    );
                })}
            </ul>

            <div className={`mt-auto border-t pt-6 ${dark ? "border-white/10" : "border-ink/10"}`}>
                <div>
                    <p>
                        <span
                            className={`block text-xs font-semibold uppercase tracking-wider ${dark ? "text-steel" : "text-graphite"}`}
                        >
                            Precio
                        </span>
                        <span
                            className={`heading-display text-3xl md:text-4xl ${dark ? "text-accent" : "text-ink"}`}
                        >
                            {service.price === null ? "Consultar" : formatPrice(service.price)}
                        </span>
                    </p>
                </div>
                <SelectServiceLink
                    serviceSlug={service.slug}
                    className={`mt-5 flex items-center justify-between rounded-full px-5 py-3.5 text-sm font-bold transition-colors ${
                        dark
                            ? "bg-accent text-ink hover:bg-mint"
                            : "bg-ink text-chalk hover:bg-accent hover:text-ink"
                    }`}
                >
                    {service.price === null ? "Consultar y sacar turno" : "Sacar turno"}
                    <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </SelectServiceLink>
            </div>
        </article>
    );
}

export function Services({ services }: ServicesProps) {
    const videoUrl = getSectionVideoUrl(services);
    return (
        <section
            id="taller"
            aria-labelledby="taller-title"
            className="relative bg-chalk py-24 md:py-32"
        >
            <div className="container-x">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading
                        id="taller-title"
                        eyebrow="Taller"
                        title={
                            <>
                                Tu bici,
                                <br />
                                <span className="text-accent-ink">como nueva</span>
                            </>
                        }
                        description="Elegí el service según cómo usás la bici. Siempre te pasamos el presupuesto por WhatsApp antes de arrancar."
                    />
                    <div className="flex max-w-xs flex-col gap-4 lg:items-end lg:text-right">
                        {videoUrl && (
                            <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 self-start rounded-full bg-ink py-2 pl-2 pr-5 text-sm font-bold text-chalk transition-colors hover:bg-accent-ink lg:self-end"
                            >
                                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-ink">
                                    <InstagramIcon className="size-4" />
                                </span>
                                Mirá qué incluye cada service
                            </a>
                        )}
                        <p className="text-sm text-graphite">
                            Los repuestos que haga falta cambiar se presupuestan aparte.
                        </p>
                    </div>
                </div>

                <Stagger className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:items-start">
                    {services.map(function (service, index) {
                        return (
                            <StaggerItem
                                key={service.id}
                                className={`h-full ${service.highlighted ? "xl:-mt-6 xl:mb-6" : ""}`}
                            >
                                <ServiceCard service={service} index={index} />
                            </StaggerItem>
                        );
                    })}
                </Stagger>
            </div>
        </section>
    );
}
