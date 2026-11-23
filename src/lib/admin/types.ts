// Tipos compartidos entre server y client del admin.

export type CatalogProduct = {
    id: string;
    sku: string | null;
    name: string;
    price: number;
    cost: number;
    stock: number;
    min_stock: number;
    category: string | null;
    supplier_id: string | null;
};

export type CatalogService = { id: string; name: string; price: number };
export type Option = { id: string; name: string };
export type CustomerOption = { id: string; name: string; phone: string | null };
export type TxCategory = {
    id: string;
    name: string;
    code: string | null;
    type: "income" | "expense";
};

export type Catalog = {
    products: CatalogProduct[];
    services: CatalogService[];
    accounts: Option[];
    customers: CustomerOption[];
    suppliers: Option[];
    categories: TxCategory[];
};

export type WorkOrderStatus =
    "recibida" | "presupuestada" | "en_reparacion" | "lista" | "entregada" | "cancelada";

export const WORK_ORDER_STATUSES: { value: WorkOrderStatus; label: string }[] = [
    { value: "recibida", label: "Recibida" },
    { value: "presupuestada", label: "Presupuestada" },
    { value: "en_reparacion", label: "En reparación" },
    { value: "lista", label: "Lista para retirar" },
    { value: "entregada", label: "Entregada" },
    { value: "cancelada", label: "Cancelada" },
];

export const OPEN_STATUSES: WorkOrderStatus[] = [
    "recibida",
    "presupuestada",
    "en_reparacion",
    "lista",
];

export function statusLabel(status: string) {
    return (
        WORK_ORDER_STATUSES.find(function (s) {
            return s.value === status;
        })?.label ?? status
    );
}

export const MOVEMENT_LABELS: Record<string, string> = {
    initial: "Carga inicial",
    import: "Importación",
    purchase: "Compra",
    sale: "Venta",
    work_order: "Orden de trabajo",
    adjustment: "Ajuste manual",
    void: "Anulación",
};
