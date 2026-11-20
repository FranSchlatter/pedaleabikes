"use client";

import * as m from "motion/react-m";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const HREF = buildWhatsAppLink("Hola! Les escribo desde la web de Pedalea Bikes.");

export function WhatsAppFab() {
    return (
        <m.a
            href={HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            className="group fixed bottom-5 right-5 z-40 inline-flex size-15 items-center justify-center rounded-full bg-[#25D366] text-ink shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] md:bottom-8 md:right-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.6, type: "spring", stiffness: 260, damping: 18 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
        >
            <span
                aria-hidden
                className="absolute inset-0 animate-ping-soft rounded-full bg-[#25D366]"
            />
            <WhatsAppIcon className="relative size-8" />
            <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-chalk opacity-0 transition-opacity group-hover:opacity-100 md:block">
                ¿Consultas? Escribinos
            </span>
        </m.a>
    );
}
