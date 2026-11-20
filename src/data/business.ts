import type { BusinessInfo } from "@/types";

export const business: BusinessInfo = {
    name: "Pedalea Bikes",
    legalName: "Pedalea Bikes",
    tagline: "Bicis, accesorios y taller en Santa Fe",
    description:
        "Bicicletería en Santa Fe Capital: venta de bicis urbanas, MTB, ruta, infantiles y eléctricas, accesorios y taller de mantenimiento con presupuesto por WhatsApp.",
    address: {
        street: "Mitre 4701",
        city: "Santa Fe",
        region: "Santa Fe",
        country: "Argentina",
        countryCode: "AR",
        postalCode: "3000",
    },
    // TODO: CONTENIDO — coordenadas aproximadas, confirmar con Google Maps (clic derecho sobre el local).
    geo: {
        latitude: -31.6118,
        longitude: -60.7065,
    },
    phoneDisplay: "342 649-3800",
    whatsappNumber: "5493426493800",
    instagramUrl: "https://www.instagram.com/pedalea_bikes/",
    instagramHandle: "@pedalea_bikes",
    timezone: "America/Argentina/Buenos_Aires",
    schedule: [
        { day: 1, label: "Lunes", ranges: [{ open: "09:00", close: "15:00" }] },
        {
            day: 2,
            label: "Martes",
            ranges: [
                { open: "09:00", close: "12:30" },
                { open: "16:00", close: "19:00" },
            ],
        },
        { day: 3, label: "Miércoles", ranges: [{ open: "09:00", close: "15:00" }] },
        {
            day: 4,
            label: "Jueves",
            ranges: [
                { open: "09:00", close: "12:30" },
                { open: "16:00", close: "19:00" },
            ],
        },
        { day: 5, label: "Viernes", ranges: [{ open: "09:00", close: "15:00" }] },
        { day: 6, label: "Sábado", ranges: [] },
        { day: 0, label: "Domingo", ranges: [] },
    ],
    paymentMethods: [
        { id: "efectivo", label: "Efectivo" },
        { id: "transferencia", label: "Transferencia" },
        { id: "debito", label: "Débito" },
        { id: "credito", label: "Crédito" },
    ],
    customOrderDays: "1 a 2 días",
};
