import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Sin lastModified: con cacheComponents, new Date() en prerender rompe el build, y una fecha
// fija hardcodeada quedaría mintiendo después del primer cambio.
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: siteUrl,
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
