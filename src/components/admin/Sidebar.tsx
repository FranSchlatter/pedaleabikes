"use client";

import {
    Building2Icon,
    ChartColumnIcon,
    HouseIcon,
    LogOutIcon,
    MenuIcon,
    PackageIcon,
    SettingsIcon,
    ShoppingCartIcon,
    TruckIcon,
    UsersIcon,
    WalletIcon,
    WrenchIcon,
    XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/admin/actions/auth";
import { cn } from "@/lib/admin/cn";

const NAV = [
    { href: "/admin", label: "Hoy", icon: HouseIcon },
    { href: "/admin/ventas", label: "Ventas", icon: ShoppingCartIcon },
    { href: "/admin/ordenes", label: "Órdenes de trabajo", icon: WrenchIcon },
    { href: "/admin/inventario", label: "Inventario", icon: PackageIcon },
    { href: "/admin/compras", label: "Compras", icon: TruckIcon },
    { href: "/admin/proveedores", label: "Proveedores", icon: Building2Icon },
    { href: "/admin/clientes", label: "Clientes", icon: UsersIcon },
    { href: "/admin/caja", label: "Caja", icon: WalletIcon },
    { href: "/admin/reportes", label: "Reportes", icon: ChartColumnIcon },
    { href: "/admin/configuracion", label: "Configuración", icon: SettingsIcon },
];

function isActive(pathname: string, href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className="fixed left-2 top-2 z-40 flex size-10 items-center justify-center rounded-md bg-ink text-chalk lg:hidden"
                onClick={function () {
                    setOpen(true);
                }}
                aria-label="Abrir menú"
            >
                <MenuIcon className="size-5" />
            </button>
            {open ? (
                <div
                    className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
                    onClick={function () {
                        setOpen(false);
                    }}
                />
            ) : null}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col bg-ink text-chalk transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <Image src="/logo.png" alt="" width={40} height={36} />
                        <span className="font-display text-lg font-extrabold uppercase leading-none tracking-tight">
                            Pedalea
                            <span className="block text-[11px] font-sans font-semibold normal-case tracking-normal text-steel">
                                Gestión
                            </span>
                        </span>
                    </Link>
                    <button
                        type="button"
                        className="rounded-md p-1.5 text-steel hover:text-chalk lg:hidden"
                        onClick={function () {
                            setOpen(false);
                        }}
                        aria-label="Cerrar menú"
                    >
                        <XIcon className="size-5" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Secciones">
                    <ul className="space-y-0.5">
                        {NAV.map(function (item) {
                            const active = isActive(pathname, item.href);
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        onClick={function () {
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-chalk/80 hover:bg-ink-3 hover:text-chalk",
                                            active &&
                                                "bg-accent font-semibold text-ink hover:bg-accent hover:text-ink",
                                        )}
                                    >
                                        <Icon className="size-4 shrink-0" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <form action={signOut} className="border-t border-ink-3 p-2">
                    <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-steel hover:bg-ink-3 hover:text-chalk"
                    >
                        <LogOutIcon className="size-4" />
                        Cerrar sesión
                    </button>
                </form>
            </aside>
        </>
    );
}
