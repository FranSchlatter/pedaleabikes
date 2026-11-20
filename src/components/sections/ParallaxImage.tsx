"use client";

import Image from "next/image";
import { useReducedMotion, useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";
import type { ProductImage } from "@/types";

type ParallaxImageProps = {
    image: ProductImage;
    className?: string;
    sizes: string;
    // Desplazamiento total en % de la altura de la imagen. La imagen se agranda lo justo para
    // que el movimiento no deje bordes vacíos.
    strength?: number;
};

export function ParallaxImage({ image, className = "", sizes, strength = 12 }: ParallaxImageProps) {
    const ref = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [`-${strength / 2}%`, `${strength / 2}%`]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <m.div
                className="absolute inset-x-0"
                style={{
                    y: reduceMotion ? 0 : y,
                    top: `-${strength / 2}%`,
                    bottom: `-${strength / 2}%`,
                }}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={sizes}
                    className="object-cover"
                />
            </m.div>
        </div>
    );
}
