"use client";

import type { ReactNode } from "react";

export const SELECT_SERVICE_EVENT = "pedalea:select-service";

type SelectServiceLinkProps = {
    serviceSlug: string;
    className?: string;
    children: ReactNode;
};

// Baja al formulario de turno con el servicio ya elegido (el form escucha este evento).
export function SelectServiceLink({ serviceSlug, className, children }: SelectServiceLinkProps) {
    return (
        <a
            href="#turno"
            className={className}
            onClick={function () {
                window.dispatchEvent(
                    new CustomEvent(SELECT_SERVICE_EVENT, { detail: serviceSlug }),
                );
            }}
        >
            {children}
        </a>
    );
}
