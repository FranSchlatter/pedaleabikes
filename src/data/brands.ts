import type { Brand } from "@/types";

// TODO: CONTENIDO — Shimano y Venzo confirmadas; completar con el resto de las marcas que
// trabajan. Para usar logos reales, poner el SVG en /public/brands y cargar `logo`.
export const brands: Brand[] = [
    { id: "shimano", name: "Shimano", category: "Componentes" },
    { id: "venzo", name: "Venzo", category: "Bicis y componentes" },
];
