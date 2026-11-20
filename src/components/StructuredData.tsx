import { siteUrl } from "@/lib/site";
import type { BusinessInfo, Weekday } from "@/types";

const SCHEMA_DAYS: Record<Weekday, string> = {
    0: "https://schema.org/Sunday",
    1: "https://schema.org/Monday",
    2: "https://schema.org/Tuesday",
    3: "https://schema.org/Wednesday",
    4: "https://schema.org/Thursday",
    5: "https://schema.org/Friday",
    6: "https://schema.org/Saturday",
};

function buildOpeningHours(business: BusinessInfo) {
    return business.schedule.flatMap(function (day) {
        return day.ranges.map(function (range) {
            return {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: SCHEMA_DAYS[day.day],
                opens: range.open,
                closes: range.close,
            };
        });
    });
}

export function StructuredData({ business }: { business: BusinessInfo }) {
    const data = {
        "@context": "https://schema.org",
        "@type": "BicycleStore",
        "@id": `${siteUrl}/#store`,
        name: business.name,
        description: business.description,
        url: siteUrl,
        image: `${siteUrl}/opengraph-image.jpg`,
        logo: `${siteUrl}/logo.png`,
        telephone: `+${business.whatsappNumber}`,
        priceRange: "$$",
        paymentAccepted: business.paymentMethods
            .map(function (method) {
                return method.label;
            })
            .join(", "),
        currenciesAccepted: "ARS",
        address: {
            "@type": "PostalAddress",
            streetAddress: business.address.street,
            addressLocality: business.address.city,
            addressRegion: business.address.region,
            postalCode: business.address.postalCode,
            addressCountry: business.address.countryCode,
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: business.geo.latitude,
            longitude: business.geo.longitude,
        },
        openingHoursSpecification: buildOpeningHours(business),
        sameAs: [business.instagramUrl],
    };

    return (
        <script
            type="application/ld+json"
            // Escapa "<" para que ningún string pueda cerrar el <script> (recomendación de la guía JSON-LD de Next).
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
    );
}
