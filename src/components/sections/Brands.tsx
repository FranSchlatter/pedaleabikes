import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Brand } from "@/types";

type BrandsProps = {
    brands: Brand[];
};

function BrandPlate({ brand }: { brand: Brand }) {
    return (
        <div className="group flex h-full flex-col items-start justify-between gap-6 rounded-3xl bg-white p-6 ring-1 ring-ink/5 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(14,15,17,0.5)] md:p-8">
            {brand.logo ? (
                <span className="relative block h-12 w-full md:h-14">
                    <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        sizes="240px"
                        className="object-contain object-left"
                    />
                </span>
            ) : (
                <span className="heading-display text-4xl text-ink transition-colors group-hover:text-accent-ink md:text-5xl">
                    {brand.name}
                </span>
            )}
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-graphite">
                {brand.category}
            </span>
        </div>
    );
}

export function Brands({ brands }: BrandsProps) {
    if (brands.length === 0) {
        return null;
    }
    return (
        <section
            id="marcas"
            aria-labelledby="marcas-title"
            className="relative bg-chalk-2 py-20 md:py-28"
        >
            <div className="container-x grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-center">
                <SectionHeading
                    id="marcas-title"
                    eyebrow="Marcas"
                    title={
                        <>
                            Con las que
                            <br />
                            <span className="text-accent-ink">trabajamos</span>
                        </>
                    }
                    description="Repuestos y bicis de marcas que conocemos de punta a punta."
                />
                {/* auto-fit estira las placas para llenar la fila, así se ve bien con 2 o con 10. */}
                <Stagger
                    as="ul"
                    className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-4 md:gap-5"
                >
                    {brands.map(function (brand) {
                        return (
                            <StaggerItem key={brand.id} as="li" className="h-full">
                                <BrandPlate brand={brand} />
                            </StaggerItem>
                        );
                    })}
                </Stagger>
            </div>
        </section>
    );
}
