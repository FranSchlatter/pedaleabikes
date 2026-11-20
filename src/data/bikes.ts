import type { Bike, BikeCategory, CategoryOption } from "@/types";

export const bikeCategories: CategoryOption<BikeCategory>[] = [
    { value: "urbana", label: "Urbana" },
    { value: "mtb", label: "MTB" },
    { value: "ruta", label: "Ruta" },
    { value: "infantil", label: "Infantil" },
    { value: "electrica", label: "Eléctrica" },
];

// TODO: CONTENIDO — modelos de ejemplo con fotos placeholder. Reemplazar por los modelos reales.
export const bikes: Bike[] = [
    {
        id: "bike-001",
        kind: "bike",
        slug: "venzo-raptor-exo-29",
        name: "Raptor EXO",
        brand: "Venzo",
        category: "mtb",
        wheelSize: "29",
        shortDescription:
            "Cuadro de aluminio, 21 velocidades, frenos a disco mecánicos y suspensión delantera.",
        image: {
            src: "/images/bikes/venzo-raptor-exo-29.jpg",
            alt: "Bicicleta MTB Venzo Raptor EXO rodado 29",
        },
        featured: true,
        supplier: "Venzo Argentina",
    },
    {
        id: "bike-002",
        kind: "bike",
        slug: "olmo-wish-290",
        name: "Wish 290",
        brand: "Olmo",
        category: "mtb",
        wheelSize: "29",
        shortDescription:
            "Ideal para arrancar en el MTB: liviana, 24 velocidades y frenos hidráulicos.",
        image: {
            src: "/images/bikes/olmo-wish-290.jpg",
            alt: "Bicicleta MTB Olmo Wish 290 rodado 29",
        },
        featured: true,
        supplier: "Olmo",
    },
    {
        id: "bike-003",
        kind: "bike",
        slug: "topmega-sunshine-26",
        name: "Sunshine",
        brand: "Topmega",
        category: "urbana",
        wheelSize: "26",
        shortDescription:
            "Paseo urbano con canasto, guardabarros y posición cómoda para ir a todos lados.",
        image: {
            src: "/images/bikes/topmega-sunshine-26.jpg",
            alt: "Bicicleta urbana Topmega Sunshine rodado 26",
        },
        featured: false,
        supplier: "Topmega",
    },
    {
        id: "bike-004",
        kind: "bike",
        slug: "raleigh-urban-2-700",
        name: "Urban 2.0",
        brand: "Raleigh",
        category: "urbana",
        wheelSize: "700c",
        shortDescription:
            "Híbrida rápida para la ciudad: cuadro de aluminio y cubiertas lisas de baja resistencia.",
        image: {
            src: "/images/bikes/raleigh-urban-2-700.jpg",
            alt: "Bicicleta urbana Raleigh Urban 2.0 rodado 700",
        },
        featured: true,
        supplier: "Raleigh Argentina",
    },
    {
        id: "bike-005",
        kind: "bike",
        slug: "venzo-strada-700",
        name: "Strada",
        brand: "Venzo",
        category: "ruta",
        wheelSize: "700c",
        shortDescription:
            "Ruta de aluminio con horquilla de carbono y grupo Shimano Claris de 16 velocidades.",
        image: {
            src: "/images/bikes/venzo-strada-700.jpg",
            alt: "Bicicleta de ruta Venzo Strada rodado 700",
        },
        featured: false,
        supplier: "Venzo Argentina",
    },
    {
        id: "bike-006",
        kind: "bike",
        slug: "firebird-kids-16",
        name: "Kids",
        brand: "FireBird",
        category: "infantil",
        wheelSize: "16",
        shortDescription:
            "La primera bici: rueditas desmontables, cubrecadena y freno contrapedal.",
        image: {
            src: "/images/bikes/firebird-kids-16.jpg",
            alt: "Bicicleta infantil FireBird Kids rodado 16",
        },
        featured: false,
        supplier: "Distribuidora del Litoral",
    },
    {
        id: "bike-007",
        kind: "bike",
        slug: "topmega-flash-20",
        name: "Flash",
        brand: "Topmega",
        category: "infantil",
        wheelSize: "20",
        shortDescription: "Para los que ya pedalean solos: 6 velocidades y frenos V-brake.",
        image: {
            src: "/images/bikes/topmega-flash-20.jpg",
            alt: "Bicicleta infantil Topmega Flash rodado 20",
        },
        featured: false,
        supplier: "Topmega",
    },
    {
        id: "bike-008",
        kind: "bike",
        slug: "slp-e-city-26",
        name: "E-City",
        brand: "SLP",
        category: "electrica",
        wheelSize: "26",
        shortDescription:
            "Asistencia eléctrica al pedaleo, batería extraíble y hasta 50 km de autonomía.",
        image: {
            src: "/images/bikes/slp-e-city-26.jpg",
            alt: "Bicicleta eléctrica SLP E-City rodado 26",
        },
        featured: true,
        supplier: "SLP",
    },
];
