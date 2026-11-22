import type { AboutContent, HeroContent, NavItem, Stat } from "@/types";

export const navItems: NavItem[] = [
    { href: "#taller", label: "Taller" },
    { href: "#turno", label: "Turnos" },
    { href: "#bicis", label: "Bicis" },
    { href: "#accesorios", label: "Accesorios" },
    { href: "#nosotros", label: "Nosotros" },
    { href: "#ubicacion", label: "Ubicación" },
];

export const hero: HeroContent = {
    eyebrow: "Bicicletería · Santa Fe Capital",
    titleLines: ["Rodá más.", "Preocupate menos."],
    subtitle:
        "Bicis, accesorios y un taller que te pasa el presupuesto por WhatsApp antes de tocar nada.",
    // TODO: CONTENIDO — subir /public/videos/hero.mp4 (loop corto, sin audio, ~10 s, < 4 MB).
    video: {
        src: "/videos/hero.mp4",
        poster: "/images/hero-poster.jpg",
        posterMobile: "/images/hero-poster-mobile.jpg",
    },
};

export const marqueeItems: string[] = [
    "Service",
    "Reparación",
    "Bicis",
    "Accesorios",
    "Repuestos",
    "Por encargo",
    "Santa Fe",
];

// Cifras confirmadas por el cliente, salvo "presupuestos antes de arreglar".
export const stats: Stat[] = [
    { id: "repaired", value: 5000, prefix: "+", label: "bicis reparadas" },
    { id: "mechanics", value: 2, label: "mecánicos especializados" },
    {
        id: "order",
        value: 2,
        prefix: "1-",
        label: "días para traer tu bici nueva por encargo",
    },
    { id: "budget", value: 100, suffix: "%", label: "presupuestos antes de arreglar" },
];

// TODO: CONTENIDO — historia, valores y fotos reales del equipo y del local.
export const about: AboutContent = {
    title: "Somos de acá y vivimos sobre dos ruedas",
    paragraphs: [
        "Pedalea Bikes nació de las ganas de tener en el barrio una bicicletería como la que nos hubiese gustado encontrar: atención directa, precios claros y un taller que te explica qué le pasa a tu bici.",
        "Hoy somos un equipo chico, con dos mecánicos especializados que conocen cada bici que entra al local. Vendemos bicis y accesorios, y si no tenemos lo que buscás, te lo conseguimos.",
    ],
    values: [
        {
            id: "v-1",
            title: "Presupuesto primero",
            description: "Nada se toca sin que lo apruebes por WhatsApp.",
        },
        {
            id: "v-2",
            title: "Repuestos de calidad",
            description: "Lo que ponemos en tu bici es lo que pondríamos en la nuestra.",
        },
        {
            id: "v-3",
            title: "Trato cercano y personalizado",
            description:
                "Te conocemos por tu nombre, tu bici y te asesoramos en todo lo que necesites.",
        },
    ],
    images: {
        main: {
            src: "/images/about/local.jpg",
            alt: "Frente del local de Pedalea Bikes en Mitre 4701",
        },
        secondary: { src: "/images/about/taller.jpg", alt: "Mecánico trabajando en el taller" },
        tertiary: { src: "/images/about/equipo.jpg", alt: "Equipo de Pedalea Bikes" },
    },
};
