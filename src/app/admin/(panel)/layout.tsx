import { Suspense } from "react";
import { Toaster } from "sonner";
import { QuickActionsProvider } from "@/components/admin/quick/QuickActions";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

// Todo el panel depende de la sesión: no tiene sentido validarlo como navegación instantánea.
export const instant = false;

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    return (
        <QuickActionsProvider>
            <div className="flex min-h-dvh">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar />
                    <main id="contenido" className="flex-1 px-3 py-4 sm:px-5 lg:px-6">
                        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
                    </main>
                </div>
            </div>
            <Toaster position="bottom-right" richColors closeButton />
        </QuickActionsProvider>
    );
}
