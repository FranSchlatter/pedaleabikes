import Link from "next/link";
import { buttonVariants } from "@/components/admin/ui/button";

export default function AdminNotFound() {
    return (
        <div className="mx-auto mt-10 max-w-md rounded-lg border border-line bg-surface p-6 text-center">
            <p className="font-bold text-ink">No encontramos lo que buscás.</p>
            <p className="mt-2 text-sm text-muted">
                Puede que se haya eliminado o que el link esté incompleto.
            </p>
            <Link href="/admin" className={buttonVariants({ className: "mt-4" })}>
                Volver a Hoy
            </Link>
        </div>
    );
}
