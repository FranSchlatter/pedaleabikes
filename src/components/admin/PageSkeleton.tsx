import { Skeleton } from "./ui/misc";

export function PageSkeleton() {
    return (
        <div aria-busy="true" aria-label="Cargando" className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-72" />
        </div>
    );
}
