import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Accessory, AccessoryCategory, CategoryOption } from "@/types";
import { ProductCatalog } from "./ProductCatalog";

type AccessoriesProps = {
    accessories: Accessory[];
    categories: CategoryOption<AccessoryCategory>[];
};

export function Accessories({ accessories, categories }: AccessoriesProps) {
    return (
        <section
            id="accesorios"
            aria-labelledby="accesorios-title"
            className="relative bg-chalk py-24 md:py-32"
        >
            <div className="container-x">
                <div className="mb-12 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
                    <SectionHeading
                        id="accesorios-title"
                        eyebrow="Accesorios"
                        title={
                            <>
                                Equipate
                                <br />
                                <span className="text-accent-ink">para rodar</span>
                            </>
                        }
                    />
                    <Reveal delay={0.1}>
                        <p className="text-lg leading-relaxed text-graphite">
                            Cascos, luces, candados y todo para el mantenimiento. Si no lo ves acá,
                            preguntanos: lo más probable es que lo tengamos o lo consigamos.
                        </p>
                    </Reveal>
                </div>
                <Reveal delay={0.1}>
                    <ProductCatalog
                        id="accessories"
                        products={accessories}
                        categories={categories}
                        tone="light"
                        allLabel="Todos"
                    />
                </Reveal>
            </div>
        </section>
    );
}
