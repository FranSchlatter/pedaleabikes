import type { Service, WorkshopStep } from "@/types";

// Video del IG donde explica qué incluye cada service; se linkea desde las cards.
const SERVICES_VIDEO_URL = "https://www.instagram.com/p/Df7dbo7hp4e/";

// TODO: CONTENIDO — el tiempo de entrega de cada service no lo pasaron; si lo confirman, va en
// estimatedTime y se muestra como chip.
export const services: Service[] = [
    {
        id: "svc-base",
        slug: "service-base",
        name: "Service Base",
        description: "Puesta a punto completa para la bici que usás todos los días.",
        includes: [
            "Limpieza completa",
            "Calibración de cambios",
            "Ajuste de frenos",
            "Ajuste de conos y caja pedalera",
            "Ajustes generales",
            "Lubricación y engrasado",
        ],
        price: 45000,
        highlighted: false,
        videoUrl: SERVICES_VIDEO_URL,
    },
    {
        id: "svc-intermedio",
        slug: "service-intermedio",
        name: "Service Intermedio",
        description: "Limpieza al detalle y mantenimiento de mazas y pedalera con grasa nueva.",
        includes: [
            "Limpieza al detalle",
            "Calibración de cambios",
            "Ajuste de frenos",
            "Mantenimiento completo de mazas (incluye bolillas y grasa nueva)",
            "Mantenimiento completo de caja pedalera (incluye bolillas y grasa nueva)",
            "Lubricación y engrasado",
        ],
        price: 60000,
        highlighted: true,
        videoUrl: SERVICES_VIDEO_URL,
    },
    {
        id: "svc-full",
        slug: "service-full",
        name: "Service Full",
        description:
            "Desarme integral, cada componente al detalle y cables nuevos. Sale como nueva.",
        includes: [
            "Desarme integral",
            "Limpieza al detalle de cada componente",
            "Armado completo",
            "Calibración de cambios",
            "Ajuste de frenos",
            "Mantenimiento de mazas",
            "Mantenimiento de caja pedalera",
            "Mantenimiento del juego de dirección",
            "Centrado de ruedas",
            "Lubricación y engrasado con grasa premium Shimano y aceites a base de ceras",
            "Lustrado y encerado del cuadro con ceras naturales",
            "Incluye cambio de cables",
        ],
        price: 80000,
        highlighted: false,
        videoUrl: SERVICES_VIDEO_URL,
    },
    // TODO: CONTENIDO — no vino en la lista de services; se deja para que el turno tenga la opción
    // de una reparación puntual. Confirmar ítems o sacarla.
    {
        id: "svc-reparaciones",
        slug: "reparaciones-puntuales",
        name: "Reparaciones puntuales",
        description: "Lo que necesites resolver puntualmente, sin hacer un service completo.",
        includes: ["Pinchaduras", "Cambio de repuestos", "Centrado de ruedas", "Ajustes rápidos"],
        price: null,
        highlighted: false,
    },
];

export const workshopSteps: WorkshopStep[] = [
    {
        id: "step-1",
        title: "Traés la bici",
        description: "Pasás por el local en el horario de atención. No hace falta turno exacto.",
    },
    {
        id: "step-2",
        title: "Te mandamos el presupuesto",
        description: "La revisamos y te escribimos por WhatsApp con el detalle y el precio.",
    },
    {
        id: "step-3",
        title: "Si lo aprobás, la arreglamos",
        description: "Nada se toca sin tu OK. Trabajamos con repuestos de calidad.",
    },
    {
        id: "step-4",
        title: "Te avisamos para retirarla",
        description: "Cuando está lista te avisamos y la pasás a buscar.",
    },
];
