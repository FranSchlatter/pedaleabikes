import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Gestión", template: "%s · Gestión Pedalea" },
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-dvh bg-canvas text-ink">{children}</div>;
}
