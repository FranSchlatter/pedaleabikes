import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Brand } from "@/types";

type BrandsProps = {
    brands: Brand[];
};

// El loop desplaza -50%, así que cada copia tiene que ser más ancha que la pantalla: con pocas
// marcas se repite la lista hasta llegar a MIN_ITEMS.
const MIN_ITEMS = 10;

function fillTrack(brands: Brand[]) {
    const track: Brand[] = [];
    while (track.length < MIN_ITEMS) {
        track.push(...brands);
    }
    return track;
}

function BrandItem({ brand }: { brand: Brand }) {
    return (
        <li className="flex w-32 shrink-0 flex-col items-center gap-3 md:w-40">
            <Image
                src={brand.logo}
                alt=""
                width={56}
                height={56}
                unoptimized
                className="size-12 object-contain opacity-70 transition-opacity duration-300 group-hover/brands:opacity-100 md:size-14"
            />
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-graphite">
                {brand.name}
            </span>
        </li>
    );
}

export function Brands({ brands }: BrandsProps) {
    if (brands.length === 0) {
        return null;
    }
    const track = fillTrack(brands);
    const copies = [false, true];
    return (
        <section aria-labelledby="marcas-title" className="relative bg-chalk-2 py-14 md:py-20">
            <Reveal className="container-x">
                <h2
                    id="marcas-title"
                    className="text-center text-xs font-bold uppercase tracking-[0.3em] text-accent-ink"
                >
                    Marcas con las que trabajamos
                </h2>
            </Reveal>
            {/* Lista accesible aparte; el slider es decorativo y se repite. */}
            <ul className="sr-only">
                {brands.map(function (brand) {
                    return <li key={brand.id}>{brand.name}</li>;
                })}
            </ul>
            <div
                aria-hidden
                className="group/brands mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
            >
                <div className="flex w-max animate-marquee group-hover/brands:[animation-play-state:paused]">
                    {copies.map(function (isCopy) {
                        return (
                            <ul key={String(isCopy)} className="flex shrink-0">
                                {track.map(function (brand, index) {
                                    return <BrandItem key={`${brand.id}-${index}`} brand={brand} />;
                                })}
                            </ul>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
