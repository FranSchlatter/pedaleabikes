// URL pública del sitio para metadata, OG, sitemap y JSON-LD.
// En Vercel se toma sola del dominio de producción; NEXT_PUBLIC_SITE_URL la pisa (dominio propio).
function resolveSiteUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
