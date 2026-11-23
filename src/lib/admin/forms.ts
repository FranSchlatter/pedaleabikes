import type { FieldDef } from "@/components/admin/EntityForm";
import { BIKE_TYPES } from "./labels";

export const SUPPLIER_FIELDS: FieldDef[] = [
    { name: "name", label: "Nombre", required: true, full: true },
    { name: "contact_name", label: "Contacto" },
    { name: "phone", label: "Teléfono / WhatsApp", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "terms", label: "Condiciones", placeholder: "Ej.: 30 días, 5 % contado" },
    { name: "notes", label: "Notas", type: "textarea", full: true },
    { name: "active", label: "Activo", type: "checkbox" },
];

export const CUSTOMER_FIELDS: FieldDef[] = [
    { name: "name", label: "Nombre y apellido", required: true, full: true },
    { name: "phone", label: "Teléfono / WhatsApp", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "notes", label: "Notas", type: "textarea", full: true },
];

export const BIKE_FIELDS: FieldDef[] = [
    { name: "brand", label: "Marca" },
    { name: "model", label: "Modelo" },
    { name: "wheel_size", label: "Rodado", placeholder: "29, 26, 700c…" },
    { name: "bike_type", label: "Tipo", type: "select", options: BIKE_TYPES },
    { name: "color", label: "Color" },
    { name: "notes", label: "Notas", type: "textarea", full: true },
];
