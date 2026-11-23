"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/admin/ui/button";

export function PrintButton() {
    return (
        <Button
            onClick={function () {
                window.print();
            }}
        >
            <PrinterIcon /> Imprimir
        </Button>
    );
}
