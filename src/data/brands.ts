import type { Brand } from "@/types";

// TODO: CONTENIDO — Shimano y Venzo confirmadas, el resto son de ejemplo. Los logos de
// /public/brands son placeholders: reemplazarlos por los SVG oficiales de cada marca.
export const brands: Brand[] = [
    { id: "shimano", name: "Shimano", logo: "/brands/shimano.svg" },
    { id: "venzo", name: "Venzo", logo: "/brands/venzo.svg" },
    { id: "sram", name: "SRAM", logo: "/brands/sram.svg" },
    { id: "raleigh", name: "Raleigh", logo: "/brands/raleigh.svg" },
    { id: "vairo", name: "Vairo", logo: "/brands/vairo.svg" },
    { id: "kenda", name: "Kenda", logo: "/brands/kenda.svg" },
    { id: "maxxis", name: "Maxxis", logo: "/brands/maxxis.svg" },
    { id: "topmega", name: "Topmega", logo: "/brands/topmega.svg" },
];
