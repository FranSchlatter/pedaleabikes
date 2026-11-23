import type { Metadata } from "next";
import Link from "next/link";
import { Importer } from "@/components/admin/inventory/Importer";
import { PageHeader } from "@/components/admin/ui/misc";
import { getDb } from "@/lib/admin/auth";
import { getSettings } from "@/lib/admin/queries";

// Depende de la sesión: siempre por request.
export const instant = false;

export const metadata: Metadata = { title: "Importar inventario" };

export default async function ImportPage() {
    const db = await getDb();
    const settings = await getSettings(db);
    return (
        <div className="max-w-6xl">
            <PageHeader
                title="Importar inventario"
                description={
                    <>
                        Subí tu Excel, elegí qué columna es cada dato y revisá la vista previa antes
                        de importar.{" "}
                        <Link href="/admin/inventario" className="text-primary hover:underline">
                            Volver al inventario
                        </Link>
                    </>
                }
            />
            <Importer defaultMargin={settings.default_margin} rounding={settings.price_rounding} />
        </div>
    );
}
