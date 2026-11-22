import type { Service, WorkshopStep } from "@/types";

// Video del IG donde explica qué incluye cada service; se linkea desde el encabezado de la sección.
export const servicesVideoUrl = "https://www.instagram.com/p/Df7dbo7hp4e/";

// TODO: CONTENIDO — el tiempo de entrega de cada service no lo pasaron; si lo confirman, va en
// estimatedTime y se muestra como chip.
export const services: Service[] = [
    {
        id: "svc-base",
        slug: "service-base",
        name: "Service Base",
        description:
            "Puesta a punto general, revisión completa para la bici que usás todos los días.",
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
    },
    {
        id: "svc-intermedio",
        slug: "service-intermedio",
        name: "Service Intermedio",
        description: "Limpieza al detalle, mantenimiento completo de rodamientos.",
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
    },
    {
        id: "svc-full",
        slug: "service-full",
        name: "Service Full",
        description:
            "Desarme integral, mantenimiento a cada componente por separado. Sale como nueva.",
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
            "Lubricación con grasa premium Shimano y aceites a base de ceras",
            "Lustrado y encerado del cuadro",
            "Incluye cambio de cables",
        ],
        price: 80000,
        highlighted: false,
    },
    {
        id: "svc-reparaciones",
        slug: "reparaciones-puntuales",
        name: "Reparaciones puntuales",
        description: "Lo que necesites resolver puntualmente, sin hacer un service completo.",
        includes: [
            "Pinchaduras",
            "Cambio de repuestos",
            "Centrado de ruedas",
            "Calibración de cambios",
            "Ajuste de frenos",
            "Ajustes rápidos",
            "Asesoramiento general sin cargo",
        ],
        price: null,
        highlighted: false,
    },
];

export const workshopSteps: WorkshopStep[] = [
    {
        id: "step-1",
        title: "Traés la bici",
        description:
            "Pasás por el local en el horario de atención. Trabajamos por turno y/o orden de llegada.",
    },
    {
        id: "step-2",
        title: "Te mandamos el presupuesto",
        description: "La revisamos y te escribimos por WhatsApp el presupuesto detallado.",
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
