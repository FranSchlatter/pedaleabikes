// Tipos de dominio. Están pensados para mapear 1:1 con tablas de Supabase más adelante
// (snake_case en la DB → camelCase acá, la conversión vive en src/lib/data.ts).

export type BikeCategory = "urbana" | "mtb" | "ruta" | "infantil" | "electrica";

export type AccessoryCategory = "cascos" | "luces" | "seguridad" | "mantenimiento";

export type ProductImage = {
    src: string;
    alt: string;
};

type ProductBase = {
    id: string;
    slug: string;
    name: string;
    brand: string;
    shortDescription: string;
    image: ProductImage;
    featured: boolean;
    // Proveedor: no se muestra en la web, queda para el futuro sistema de stock.
    supplier: string;
};

export type Bike = ProductBase & {
    kind: "bike";
    category: BikeCategory;
    // Rodado como texto ("29", "700c", "16") porque mezcla pulgadas y medidas de ruta.
    wheelSize: string;
};

export type Accessory = ProductBase & {
    kind: "accessory";
    category: AccessoryCategory;
    size?: string;
};

export type Product = Bike | Accessory;

export type CategoryOption<T extends string> = {
    value: T;
    label: string;
};

export type Service = {
    id: string;
    slug: string;
    name: string;
    description: string;
    includes: string[];
    // null → se muestra "Consultar".
    price: number | null;
    highlighted: boolean;
    estimatedTime?: string;
    // Post/reel de Instagram que explica el service.
    videoUrl?: string;
};

export type WorkshopStep = {
    id: string;
    title: string;
    description: string;
};

export type Testimonial = {
    id: string;
    name: string;
    context: string;
    quote: string;
    rating: 1 | 2 | 3 | 4 | 5;
};

export type VideoItem = {
    id: string;
    title: string;
    description: string;
    src: string;
    poster: string;
};

// 0 = domingo … 6 = sábado (igual que Date#getDay).
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Horas en formato "HH:MM", 24 hs, hora de Argentina.
export type TimeRange = {
    open: string;
    close: string;
};

export type DaySchedule = {
    day: Weekday;
    label: string;
    ranges: TimeRange[];
};

export type PaymentMethod = {
    id: string;
    label: string;
};

export type BusinessInfo = {
    name: string;
    legalName: string;
    tagline: string;
    description: string;
    address: {
        street: string;
        city: string;
        region: string;
        country: string;
        countryCode: string;
        postalCode: string;
    };
    geo: {
        latitude: number;
        longitude: number;
    };
    phoneDisplay: string;
    whatsappNumber: string;
    instagramUrl: string;
    instagramHandle: string;
    timezone: string;
    schedule: DaySchedule[];
    paymentMethods: PaymentMethod[];
    customOrderDays: string;
    // Destacada de IG con el stock para entrega inmediata: es la fuente de verdad del stock
    // mientras no haya base de datos.
    stockUrl: string;
};

export type Brand = {
    id: string;
    name: string;
    // Qué se trabaja de la marca ("Componentes", "Bicis"...).
    category: string;
    // SVG en /public/brands; sin logo se muestra el nombre como wordmark.
    logo?: string;
};

export type Stat = {
    id: string;
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
};

export type AboutValue = {
    id: string;
    title: string;
    description: string;
};

export type AboutContent = {
    title: string;
    paragraphs: string[];
    values: AboutValue[];
    images: {
        main: ProductImage;
        secondary: ProductImage;
        tertiary: ProductImage;
    };
};

export type HeroContent = {
    eyebrow: string;
    titleLines: string[];
    subtitle: string;
    video: {
        src: string;
        poster: string;
        posterMobile: string;
    };
};

export type NavItem = {
    href: string;
    label: string;
};
