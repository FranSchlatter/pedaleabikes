"use client";

import Image from "next/image";
import { AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { NavItem } from "@/types";

type HeaderProps = {
    navItems: NavItem[];
};

const WHATSAPP_HREF = buildWhatsAppLink("Hola! Les escribo desde la web de Pedalea Bikes.");

export function Header({ navItems }: HeaderProps) {
    const { scrollY } = useScroll();
    const [solid, setSolid] = useState(false);
    const [open, setOpen] = useState(false);

    useMotionValueEvent(scrollY, "change", function (latest) {
        const next = latest > 40;
        if (next !== solid) {
            setSolid(next);
        }
    });

    function closeMenu() {
        setOpen(false);
    }

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            {/* Fondo en capa aparte: se anima solo su opacidad, no el blur ni el color del header. */}
            <div
                aria-hidden
                className={`absolute inset-0 border-b border-white/10 bg-ink/80 backdrop-blur-xl transition-opacity duration-500 ${
                    solid || open ? "opacity-100" : "opacity-0"
                }`}
            />
            <div className="container-x relative flex h-16 items-center justify-between md:h-20">
                <a
                    href="#inicio"
                    className="relative z-10 shrink-0"
                    aria-label="Pedalea Bikes, ir al inicio"
                >
                    <Image
                        src="/logo.png"
                        alt="Pedalea Bikes"
                        width={298}
                        height={267}
                        className="h-11 w-auto md:h-14"
                        sizes="64px"
                    />
                </a>

                <nav aria-label="Principal" className="hidden lg:block">
                    <ul className="flex items-center gap-1">
                        {navItems.map(function (item) {
                            return (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        className="group relative inline-block px-3 py-2 text-sm font-semibold uppercase tracking-wider text-chalk/85 transition-colors hover:text-chalk"
                                    >
                                        {item.label}
                                        <span
                                            aria-hidden
                                            className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                                        />
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="flex items-center gap-2">
                    <a
                        href={WHATSAPP_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 md:px-5"
                    >
                        <WhatsAppIcon className="size-4" />
                        Escribinos
                    </a>
                    <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-chalk lg:hidden"
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        aria-label={open ? "Cerrar menú" : "Abrir menú"}
                        onClick={function () {
                            setOpen(!open);
                        }}
                    >
                        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <m.nav
                        id="mobile-menu"
                        aria-label="Menú mobile"
                        className="relative border-b border-white/10 bg-ink/95 backdrop-blur-xl lg:hidden"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                    >
                        <ul className="container-x flex flex-col py-4">
                            {navItems.map(function (item, index) {
                                return (
                                    <m.li
                                        key={item.href}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.04 * index }}
                                    >
                                        <a
                                            href={item.href}
                                            onClick={closeMenu}
                                            className="heading-display flex items-center justify-between border-b border-white/10 py-4 text-2xl text-chalk"
                                        >
                                            {item.label}
                                            <span aria-hidden className="text-base text-accent">
                                                0{index + 1}
                                            </span>
                                        </a>
                                    </m.li>
                                );
                            })}
                        </ul>
                    </m.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
