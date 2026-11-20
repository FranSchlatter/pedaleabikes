import { business } from "@/data/business";

export function buildWhatsAppLink(message?: string) {
    const base = `https://wa.me/${business.whatsappNumber}`;
    if (!message) {
        return base;
    }
    return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildProductInquiry(productLabel: string) {
    return buildWhatsAppLink(`Hola! Quería consultar por la ${productLabel}`);
}
