import type { MetadataRoute } from "next";
import { business } from "@/data/business";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: business.name,
        short_name: "Pedalea",
        description: business.tagline,
        start_url: "/",
        display: "standalone",
        background_color: "#0e0f11",
        theme_color: "#0e0f11",
        lang: "es-AR",
        icons: [
            { src: "/icon.png", sizes: "512x512", type: "image/png" },
            { src: "/apple-icon.png", sizes: "512x512", type: "image/png" },
        ],
    };
}
