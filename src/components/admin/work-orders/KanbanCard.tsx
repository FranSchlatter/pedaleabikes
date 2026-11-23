"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { setWorkOrderStatus } from "@/app/admin/actions/work-orders";
import { cn } from "@/lib/admin/cn";
import { formatDate } from "@/lib/admin/dates";
import { formatARS } from "@/lib/admin/money";
import { OPEN_STATUSES, statusLabel, type WorkOrderStatus } from "@/lib/admin/types";

type Props = {
    id: string;
    number: number;
    status: WorkOrderStatus;
    customer: string;
    bike: string;
    problem: string | null;
    days: number;
    promisedAt: string | null;
    total: number;
};

export function KanbanCard({
    id,
    number,
    status,
    customer,
    bike,
    problem,
    days,
    promisedAt,
    total,
}: Props) {
    const [pending, startTransition] = useTransition();
    const index = OPEN_STATUSES.indexOf(status);
    const prev = OPEN_STATUSES[index - 1];
    const next = OPEN_STATUSES[index + 1];

    function move(to: WorkOrderStatus) {
        startTransition(async function () {
            const result = await setWorkOrderStatus({ id, status: to as "recibida" });
            if (!result.ok) toast.error(result.error);
        });
    }

    return (
        <article
            className={cn(
                "rounded-md border border-line bg-surface p-2.5 text-sm shadow-xs",
                pending && "opacity-50",
            )}
        >
            <Link href={`/admin/ordenes/${id}`} className="block">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold">#{number}</span>
                    <span
                        className={cn(
                            "text-xs tabular-nums",
                            days > 5 ? "font-bold text-danger" : "text-muted",
                        )}
                    >
                        hace {days}d
                    </span>
                </div>
                <p className="truncate font-semibold">{customer}</p>
                <p className="truncate text-xs text-muted">{bike}</p>
                {problem ? <p className="mt-1 line-clamp-2 text-xs">{problem}</p> : null}
                <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted">
                        {promisedAt ? `Prometida ${formatDate(promisedAt)}` : ""}
                    </span>
                    <span className="font-semibold tabular-nums">
                        {total ? formatARS(total) : ""}
                    </span>
                </div>
            </Link>
            <div className="mt-2 flex justify-between gap-1 border-t border-line pt-1.5">
                {prev ? (
                    <button
                        type="button"
                        disabled={pending}
                        onClick={function () {
                            move(prev);
                        }}
                        className="flex items-center rounded px-1 py-0.5 text-xs text-muted hover:bg-canvas hover:text-ink"
                        title={`Volver a ${statusLabel(prev)}`}
                    >
                        <ChevronLeftIcon className="size-3.5" />
                        {statusLabel(prev)}
                    </button>
                ) : (
                    <span />
                )}
                {next ? (
                    <button
                        type="button"
                        disabled={pending}
                        onClick={function () {
                            move(next);
                        }}
                        className="flex items-center rounded px-1.5 py-0.5 text-xs font-semibold text-primary hover:bg-info-soft"
                    >
                        {statusLabel(next)}
                        <ChevronRightIcon className="size-3.5" />
                    </button>
                ) : (
                    <Link
                        href={`/admin/ordenes/${id}?entregar=1`}
                        className="flex items-center rounded px-1.5 py-0.5 text-xs font-semibold text-success hover:bg-success-soft"
                    >
                        Entregar y cobrar
                        <ChevronRightIcon className="size-3.5" />
                    </Link>
                )}
            </div>
        </article>
    );
}
