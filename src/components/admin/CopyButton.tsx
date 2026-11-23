"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <Button
            variant="secondary"
            onClick={async function () {
                try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    toast.success("Copiado al portapapeles");
                    setTimeout(function () {
                        setCopied(false);
                    }, 2000);
                } catch {
                    toast.error("No se pudo copiar.");
                }
            }}
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {label}
        </Button>
    );
}
