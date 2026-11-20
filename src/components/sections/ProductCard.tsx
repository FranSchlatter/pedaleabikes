import Image from "next/image";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Product } from "@/types";

type ProductCardProps = {
    product: Product;
    categoryLabel: string;
    tone: "light" | "dark";
};

function inquiryMessage(product: Product) {
    if (product.kind === "bike") {
        return `Hola! Quería consultar por la ${product.brand} ${product.name} (rodado ${product.wheelSize})`;
    }
    return `Hola! Quería consultar por el accesorio: ${product.name} ${product.brand}`;
}

function sizeBadge(product: Product) {
    if (product.kind === "bike") {
        return `R${product.wheelSize}`;
    }
    return product.size && `Talle ${product.size}`;
}

export function ProductCard({ product, categoryLabel, tone }: ProductCardProps) {
    const dark = tone === "dark";
    const badge = sizeBadge(product);
    const isBike = product.kind === "bike";
    return (
        <article
            className={`group relative flex h-full flex-col overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-2 focus-within:-translate-y-2 ${
                dark
                    ? "bg-ink-2 ring-1 ring-white/10 hover:shadow-[0_40px_70px_-35px_rgba(255,91,31,0.5)]"
                    : "bg-white ring-1 ring-ink/5 shadow-[0_20px_50px_-35px_rgba(14,15,17,0.45)] hover:shadow-[0_40px_70px_-35px_rgba(14,15,17,0.55)]"
            }`}
        >
            <div
                className={`relative overflow-hidden ${isBike ? "aspect-[4/3]" : "aspect-square"}`}
            >
                <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 520px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.07]"
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-chalk/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                        {categoryLabel}
                    </span>
                    {product.featured && (
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                            Top
                        </span>
                    )}
                </div>
                {badge && (
                    <span className="heading-display absolute bottom-3 right-4 text-4xl text-chalk drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                        {badge}
                    </span>
                )}
            </div>

            <div className="relative flex flex-1 flex-col p-5 md:p-6">
                <p
                    className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-lime" : "text-accent-ink"}`}
                >
                    {product.brand}
                </p>
                <h3 className={`heading-display mt-1 text-3xl ${dark ? "text-chalk" : "text-ink"}`}>
                    {product.name}
                </h3>
                <p
                    className={`mt-2 text-sm leading-relaxed ${dark ? "text-steel" : "text-graphite"}`}
                >
                    {product.shortDescription}
                </p>

                {/* En pantallas con hover el botón entra deslizando; en touch/teclado está siempre visible. */}
                <div className="mt-auto pt-5">
                    <a
                        href={buildWhatsAppLink(inquiryMessage(product))}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Consultar por ${product.brand} ${product.name} por WhatsApp`}
                        className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-500 ease-out-expo [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 ${
                            dark
                                ? "bg-accent text-ink hover:bg-lime"
                                : "bg-ink text-chalk hover:bg-accent hover:text-ink"
                        }`}
                    >
                        <WhatsAppIcon className="size-4" />
                        Consultar
                    </a>
                </div>
            </div>
        </article>
    );
}
