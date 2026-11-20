import type { Service, WorkshopStep } from "@/types";

// TODO: CONTENIDO — descripciones, "incluye" y precios son de ejemplo. Reemplazar por los reales.
export const services: Service[] = [
    {
        id: "svc-base",
        slug: "service-base",
        name: "Service Base",
        description: "Puesta a punto para la bici que usás todos los días.",
        includes: [
            "Regulación de frenos y cambios",
            "Ajuste general de tornillería",
            "Lubricación de cadena",
            "Control y calibración de cubiertas",
        ],
        price: 25000,
        highlighted: false,
        estimatedTime: "24 hs",
    },
    {
        id: "svc-intermedio",
        slug: "service-intermedio",
        name: "Service Intermedio",
        description: "Limpieza a fondo de transmisión y ajuste fino para que vuelva a andar suave.",
        includes: [
            "Todo lo del Service Base",
            "Limpieza y desengrase de transmisión",
            "Centrado de ruedas",
            "Ajuste de dirección y pedalera",
        ],
        price: 45000,
        highlighted: true,
        estimatedTime: "24 a 48 hs",
    },
    {
        id: "svc-full",
        slug: "service-full",
        name: "Service Full",
        description: "Desarme completo, limpieza y engrase de todos los rodamientos. Como nueva.",
        includes: [
            "Todo lo del Service Intermedio",
            "Desarme y lavado completo",
            "Engrase de rodamientos (masas, dirección, caja)",
            "Revisión de cables y fundas",
        ],
        price: 70000,
        highlighted: false,
        estimatedTime: "48 a 72 hs",
    },
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
