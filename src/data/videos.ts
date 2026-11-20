import type { VideoItem } from "@/types";

// TODO: CONTENIDO — subir los mp4 reales a /public/videos con estos nombres (o cambiar src).
// Mientras el archivo no exista, la sección muestra el poster con la etiqueta "Próximamente".
export const videos: VideoItem[] = [
    {
        id: "video-taller",
        title: "Service en vivo",
        description: "Así le devolvemos la vida a una bici en el taller.",
        src: "/videos/taller.mp4",
        poster: "/images/videos/poster-taller.jpg",
    },
    {
        id: "video-local",
        title: "Recorré el local",
        description: "Bicis, accesorios y repuestos en Mitre 4701.",
        src: "/videos/local.mp4",
        poster: "/images/videos/poster-local.jpg",
    },
    {
        id: "video-ruta",
        title: "Salimos a rodar",
        description: "Probamos las bicis donde tienen que andar: en la calle.",
        src: "/videos/ruta.mp4",
        poster: "/images/videos/poster-ruta.jpg",
    },
];
