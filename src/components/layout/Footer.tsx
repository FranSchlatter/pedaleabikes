import Image from "next/image";
import { InstagramIcon, MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { formatRanges } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { BusinessInfo, NavItem } from "@/types";

type FooterProps = {
    business: BusinessInfo;
    navItems: NavItem[];
};

export function Footer({ business, navItems }: FooterProps) {
    return (
        <footer className="relative overflow-hidden bg-[#08090a] pt-20 text-chalk">
            <div className="container-x grid gap-12 pb-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
                <div>
                    <Image
                        src="/logo.png"
                        alt="Pedalea Bikes"
                        width={1400}
                        height={400}
                        className="h-12 w-auto"
                        sizes="180px"
                    />
                    <p className="mt-5 max-w-xs leading-relaxed text-steel">{business.tagline}.</p>
                    <div className="mt-6 flex gap-3">
                        <a
                            href={business.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram de Pedalea Bikes"
                            className="flex size-11 items-center justify-center rounded-full ring-1 ring-white/15 transition-colors hover:bg-accent hover:text-ink hover:ring-accent"
                        >
                            <InstagramIcon className="size-5" />
                        </a>
                        <a
                            href={buildWhatsAppLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="WhatsApp de Pedalea Bikes"
                            className="flex size-11 items-center justify-center rounded-full ring-1 ring-white/15 transition-colors hover:bg-accent hover:text-ink hover:ring-accent"
                        >
                            <WhatsAppIcon className="size-5" />
                        </a>
                    </div>
                </div>

                <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
                        Contacto
                    </h2>
                    <ul className="mt-5 space-y-3 text-chalk/85">
                        <li className="flex items-start gap-2">
                            <MapPinIcon className="mt-0.5 size-5 shrink-0 text-accent" />
                            <span>
                                {business.address.street}
                                <br />
                                {business.address.city} Capital, {business.address.region}
                            </span>
                        </li>
                        <li>
                            <a
                                href={buildWhatsAppLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-accent"
                            >
                                <WhatsAppIcon className="size-5 text-accent" />
                                {business.phoneDisplay}
                            </a>
                        </li>
                        <li>
                            <a
                                href={business.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-accent"
                            >
                                <InstagramIcon className="size-5 text-accent" />
                                {business.instagramHandle}
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
                        Horarios
                    </h2>
                    <ul className="mt-5 space-y-2 text-sm text-chalk/85">
                        {business.schedule.map(function (day) {
                            return (
                                <li key={day.day} className="flex justify-between gap-4">
                                    <span className="font-semibold">{day.label}</span>
                                    <span
                                        className={`text-right ${day.ranges.length === 0 ? "text-steel" : ""}`}
                                    >
                                        {formatRanges(day.ranges)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
                        Medios de pago
                    </h2>
                    <ul className="mt-5 flex flex-wrap gap-2">
                        {business.paymentMethods.map(function (method) {
                            return (
                                <li
                                    key={method.id}
                                    className="rounded-full px-3.5 py-1.5 text-sm text-chalk/85 ring-1 ring-white/15"
                                >
                                    {method.label}
                                </li>
                            );
                        })}
                    </ul>
                    <p className="mt-3 text-xs text-steel">
                        Débito y crédito con posnet en el local.
                    </p>

                    <h2 className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-lime">
                        Secciones
                    </h2>
                    <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-chalk/85">
                        {navItems.map(function (item) {
                            return (
                                <li key={item.href}>
                                    <a href={item.href} className="hover:text-accent">
                                        {item.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <p
                aria-hidden
                className="heading-display pointer-events-none select-none whitespace-nowrap text-center text-[22vw] leading-[0.78] text-outline-chalk opacity-[0.12]"
            >
                Pedalea
            </p>

            <div className="border-t border-white/10">
                <div className="container-x flex flex-col gap-2 py-6 pr-24 text-xs text-steel sm:flex-row sm:justify-between">
                    <p>© {business.name} · Santa Fe, Argentina</p>
                    <p>Precios de referencia sujetos a cambios.</p>
                </div>
            </div>
        </footer>
    );
}
