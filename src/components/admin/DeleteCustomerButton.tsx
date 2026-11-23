"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCustomer } from "@/app/admin/actions/contacts";
import { Button } from "./ui/button";
import { Confirm } from "./ui/confirm";

export function DeleteCustomerButton({ id, name }: { id: string; name: string }) {
    const router = useRouter();
    return (
        <Confirm
            title={`¿Eliminar a ${name}?`}
            description="Se borran el cliente y sus bicis. Sus compras de mostrador quedan registradas sin cliente. No se puede deshacer."
            confirmLabel="Eliminar"
            trigger={
                <Button variant="danger-outline">
                    <Trash2Icon /> Eliminar
                </Button>
            }
            onConfirm={async function () {
                const result = await deleteCustomer({ id });
                if (!result.ok) {
                    toast.error(result.error);
                    return false;
                }
                toast.success("Cliente eliminado");
                router.push("/admin/clientes");
            }}
        />
    );
}
