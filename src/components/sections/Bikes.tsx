import { ArrowUpRightIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Bike, BikeCategory, CategoryOption } from "@/types";
import { ProductCatalog } from "./ProductCatalog";

type BikesProps = {
    bikes: Bike[];
    categories: CategoryOption<BikeCategory>[];
    customOrderDays: string;
    stockUrl: string;
};

// El stock cambia seguido y no hay base de datos: la destacada de IG es la fuente de verdad y la
// grilla de abajo queda como catálogo de modelos por encargo.
function StockCard({ url }: { url: string }) {
    return (
        <Reveal delay={0.1} className="mt-10">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-ink-3 p-6 ring-1 ring-white/10 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(79,179,174,0.5)] hover:ring-accent/50 md:flex-row md:items-center md:justify-between md:p-8"
            >
                <div>
                    <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.25em] text-mint">
                        <span aria-hidden className="relative flex size-2.5">
                            <span className="absolute inset-0 animate-ping-soft rounded-full bg-mint" />
                            <span className="relative size-2.5 rounded-full bg-mint" />
                        </span>
                        Entrega inmediata
                    </p>
                    <p className="heading-display mt-3 text-2xl md:text-3xl">
                        Lo que hay hoy en el local, con precio
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-steel">
                        El stock lo actualizamos en las destacadas de Instagram cada vez que entra o
                        sale una bici.
                    </p>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center gap-2.5 self-start rounded-full bg-accent px-6 py-3.5 font-bold text-ink transition-colors group-hover:bg-mint md:self-auto">
                    <InstagramIcon className="size-5" />
                    Ver stock en Instagram
                    <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
            </a>
        </Reveal>
    );
}

function CatalogIntro({ days }: { days: string }) {
    return (
        <Reveal className="mb-8 mt-16 max-w-2xl md:mt-20">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-mint">Por encargo</p>
            <p className="heading-display mt-3 text-3xl md:text-4xl">
                ¿No está en stock? La traemos
            </p>
            <p className="mt-3 leading-relaxed text-steel">
                Estas son algunas de las opciones que podemos conseguirte en {days}. Consultanos
                precio y disponibilidad por WhatsApp.
            </p>
        </Reveal>
    );
}

function CustomOrderBanner({ days }: { days: string }) {
    return (
        <Reveal className="mt-16 md:mt-20">
            <div className="group relative overflow-hidden rounded-[2rem] bg-accent p-8 text-ink md:p-12">
                <div aria-hidden className="speed-lines absolute inset-0 text-ink opacity-60" />
                <span
                    aria-hidden
                    className="heading-display pointer-events-none absolute -bottom-10 -right-4 select-none text-[8rem] leading-none bg-ink bg-clip-text text-transparent opacity-10 transition-transform duration-700 ease-out-expo group-hover:-translate-x-6 md:text-[12rem]"
                >
                    {days}
                </span>
                <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.3em]">Otro modelo</p>
                        <p className="heading-display mt-3 text-3xl sm:text-4xl lg:text-5xl">
                            ¿Buscás algo que no está acá?
                        </p>
                        <p className="mt-3 text-lg font-medium md:text-xl">
                            Decinos qué necesitás y te lo conseguimos en <strong>{days}</strong>.
                        </p>
                    </div>
                    <a
                        href={buildWhatsAppLink(
                            "Hola! Estoy buscando una bici que no vi en la web: ",
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/cta inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 font-bold text-chalk transition-transform hover:-translate-y-0.5"
                    >
                        <WhatsAppIcon className="size-5" />
                        Pedila por WhatsApp
                        <ArrowUpRightIcon className="size-5 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                    </a>
                </div>
            </div>
        </Reveal>
    );
}

export function Bikes({ bikes, categories, customOrderDays, stockUrl }: BikesProps) {
    return (
        <section
            id="bicis"
            aria-labelledby="bicis-title"
            className="relative overflow-hidden bg-ink py-24 text-chalk md:py-32"
        >
            <div aria-hidden className="grid-lines absolute inset-0 text-chalk" />
            <div className="container-x relative">
                <SectionHeading
                    id="bicis-title"
                    eyebrow="Bicis"
                    tone="dark"
                    title={
                        <>
                            Tu próxima <span className="text-accent">bici</span>
                        </>
                    }
                    description="Urbanas, MTB, ruta, infantiles y eléctricas. Llevátela hoy o te la traemos por encargo."
                />
                <StockCard url={stockUrl} />
                <CatalogIntro days={customOrderDays} />
                <Reveal delay={0.1}>
                    <ProductCatalog
                        id="bikes"
                        products={bikes}
                        categories={categories}
                        tone="dark"
                        allLabel="Todas"
                    />
                </Reveal>
                <CustomOrderBanner days={customOrderDays} />
            </div>
        </section>
    );
}
