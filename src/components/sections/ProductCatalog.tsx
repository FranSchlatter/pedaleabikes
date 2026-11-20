"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import type { CategoryOption, Product } from "@/types";
import { ProductCard } from "./ProductCard";

type ProductCatalogProps = {
    id: string;
    products: Product[];
    categories: CategoryOption<string>[];
    tone: "light" | "dark";
    allLabel: string;
};

const ALL = "todas";

function labelFor(categories: CategoryOption<string>[], value: string) {
    const match = categories.find(function (category) {
        return category.value === value;
    });
    return match?.label ?? value;
}

export function ProductCatalog({ id, products, categories, tone, allLabel }: ProductCatalogProps) {
    const [active, setActive] = useState(ALL);
    const dark = tone === "dark";
    const usedCategories = categories.filter(function (category) {
        return products.some(function (product) {
            return product.category === category.value;
        });
    });
    const options = [{ value: ALL, label: allLabel }, ...usedCategories];
    const visible =
        active === ALL
            ? products
            : products.filter(function (product) {
                  return product.category === active;
              });

    return (
        <LayoutGroup id={id}>
            <div
                role="group"
                aria-label="Filtrar por categoría"
                className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
            >
                {options.map(function (option) {
                    const selected = option.value === active;
                    const count =
                        option.value === ALL
                            ? products.length
                            : products.filter(function (product) {
                                  return product.category === option.value;
                              }).length;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={function () {
                                setActive(option.value);
                            }}
                            className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                                selected
                                    ? "text-ink"
                                    : dark
                                      ? "text-chalk/80 ring-1 ring-white/15 hover:text-chalk hover:ring-white/40"
                                      : "text-ink/70 ring-1 ring-ink/15 hover:text-ink hover:ring-ink/40"
                            }`}
                        >
                            {selected && (
                                <m.span
                                    layoutId={`${id}-pill`}
                                    className="absolute inset-0 rounded-full bg-accent"
                                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                />
                            )}
                            <span className="relative">
                                {option.label}
                                <span className="ml-1.5 opacity-60">{count}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="sr-only" aria-live="polite">
                {`Mostrando ${visible.length} ${visible.length === 1 ? "producto" : "productos"}`}
            </p>

            <m.ul
                layout
                className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {visible.map(function (product) {
                        return (
                            <m.li
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <ProductCard
                                    product={product}
                                    categoryLabel={labelFor(categories, product.category)}
                                    tone={tone}
                                />
                            </m.li>
                        );
                    })}
                </AnimatePresence>
            </m.ul>
        </LayoutGroup>
    );
}
