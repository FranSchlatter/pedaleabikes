import type { Metadata, Viewport } from "next";
import { Anton, Archivo } from "next/font/google";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { business } from "@/data/business";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const anton = Anton({
    variable: "--font-anton",
    weight: "400",
    subsets: ["latin"],
    display: "swap",
});

const archivo = Archivo({
    variable: "--font-archivo",
    subsets: ["latin"],
    display: "swap",
});

const title = "Pedalea Bikes · Bicicletería y taller en Santa Fe";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: title,
        template: "%s · Pedalea Bikes",
    },
    description: business.description,
    applicationName: business.name,
    keywords: [
        "bicicletería Santa Fe",
        "taller de bicicletas Santa Fe",
        "service de bicicletas",
        "bicis MTB",
        "bicis urbanas",
        "accesorios para bici",
        "Pedalea Bikes",
    ],
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "es_AR",
        url: "/",
        siteName: business.name,
        title,
        description:
            "Bicis, accesorios y taller con presupuesto por WhatsApp. Mitre 4701, Santa Fe.",
    },
    twitter: {
        card: "summary_large_image",
        title,
        description:
            "Bicis, accesorios y taller con presupuesto por WhatsApp. Mitre 4701, Santa Fe.",
    },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
};

export const viewport: Viewport = {
    themeColor: "#0e0f11",
    colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="es-AR" className={`${anton.variable} ${archivo.variable} antialiased`}>
            <body className="min-h-dvh overflow-x-clip">
                <a
                    href="#contenido"
                    className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-accent px-5 py-3 font-semibold text-ink transition-transform focus:translate-y-0"
                >
                    Saltar al contenido
                </a>
                <MotionProvider>{children}</MotionProvider>
            </body>
        </html>
    );
}
