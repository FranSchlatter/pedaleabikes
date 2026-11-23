import { impliedMargin } from "./calc";
import { parseARS } from "./money";
import { normalize } from "./search";

export type ImportField =
    | "sku"
    | "name"
    | "category"
    | "supplier"
    | "location"
    | "cost"
    | "price"
    | "margin"
    | "stock"
    | "min_stock";

export const IMPORT_FIELDS: {
    field: ImportField;
    label: string;
    required?: boolean;
    synonyms: string[];
}[] = [
    {
        field: "sku",
        label: "SKU / código",
        synonyms: ["sku", "codigo", "cod", "cod.", "código", "articulo", "id", "ref", "referencia"],
    },
    {
        field: "name",
        label: "Nombre / descripción",
        required: true,
        synonyms: [
            "nombre",
            "descripcion",
            "descripción",
            "producto",
            "detalle",
            "articulo descripcion",
            "item",
        ],
    },
    {
        field: "category",
        label: "Categoría / rubro",
        synonyms: ["categoria", "rubro", "familia", "tipo", "linea", "grupo"],
    },
    {
        field: "supplier",
        label: "Proveedor / marca",
        synonyms: ["proveedor", "prov", "distribuidor", "marca"],
    },
    {
        field: "location",
        label: "Ubicación",
        synonyms: ["ubicacion", "ubicación", "lugar", "estante", "deposito", "posicion"],
    },
    {
        field: "cost",
        label: "Costo unitario",
        synonyms: [
            "costo",
            "precio costo",
            "costo unitario",
            "p. costo",
            "precio de costo",
            "compra",
            "precio compra",
            "neto",
        ],
    },
    {
        field: "price",
        label: "Precio de venta",
        synonyms: [
            "precio",
            "precio venta",
            "precio de venta",
            "pvp",
            "venta",
            "p. venta",
            "precio final",
            "lista",
        ],
    },
    {
        field: "margin",
        label: "Margen %",
        synonyms: ["margen", "margen %", "recargo", "markup", "ganancia", "%"],
    },
    {
        field: "stock",
        label: "Stock",
        synonyms: ["stock", "cantidad", "existencia", "cant", "cant.", "unidades", "stock actual"],
    },
    {
        field: "min_stock",
        label: "Stock mínimo",
        synonyms: [
            "minimo",
            "mínimo",
            "stock minimo",
            "stock mín.",
            "stock min",
            "min",
            "punto de pedido",
            "reposicion",
        ],
    },
];

export type Mapping = Partial<Record<ImportField, number>>;

// Adivina el mapeo por nombre de columna: primero coincidencia exacta, después parcial.
export function guessMapping(headers: string[]): Mapping {
    const normalized = headers.map(function (h) {
        return normalize(String(h ?? ""))
            .replace(/\s+/g, " ")
            .trim();
    });
    const mapping: Mapping = {};
    const used = new Set<number>();
    for (const pass of ["exact", "partial"] as const) {
        for (const { field, synonyms } of IMPORT_FIELDS) {
            if (mapping[field] !== undefined) continue;
            const syns = synonyms.map(normalize);
            const index = normalized.findIndex(function (h, i) {
                if (used.has(i) || !h) return false;
                return pass === "exact"
                    ? syns.includes(h)
                    : syns.some(function (s) {
                          return s.length > 2 && h.includes(s);
                      });
            });
            if (index >= 0) {
                mapping[field] = index;
                used.add(index);
            }
        }
    }
    return mapping;
}

// Qué hacer con la columna de precio de venta cuando también hay costo.
export type PriceMode = "margin" | "manual" | "ignore";

export type ImportRow = {
    sku?: string;
    name: string;
    category?: string;
    supplier?: string;
    location?: string;
    cost?: number;
    margin?: number | null;
    manual_price?: number | null;
    stock?: number;
    min_stock?: number;
};

function text(value: unknown) {
    if (value === null || value === undefined) return undefined;
    const s = String(value).trim();
    return s || undefined;
}

function num(value: unknown) {
    if (value === null || value === undefined || value === "") return undefined;
    const n = typeof value === "number" ? value : parseARS(String(value));
    return n === null || !Number.isFinite(n) ? undefined : n;
}

// Margen escrito como 80, "80%" o 0.8 → 0.8.
function marginValue(value: unknown) {
    const n = num(typeof value === "string" ? value.replace("%", "") : value);
    if (n === undefined) return undefined;
    return n > 5 ? n / 100 : n;
}

export function buildRow(
    cells: unknown[],
    mapping: Mapping,
    priceMode: PriceMode,
): ImportRow | null {
    function cell(field: ImportField) {
        const i = mapping[field];
        return i === undefined ? undefined : cells[i];
    }
    const name = text(cell("name"));
    if (!name) return null;
    const row: ImportRow = { name };
    const sku = text(cell("sku"));
    if (sku) row.sku = sku;
    const category = text(cell("category"));
    if (category) row.category = category;
    const supplier = text(cell("supplier"));
    if (supplier) row.supplier = supplier;
    const location = text(cell("location"));
    if (location) row.location = location;
    const cost = num(cell("cost"));
    if (cost !== undefined) row.cost = Math.max(cost, 0);
    const stock = num(cell("stock"));
    if (stock !== undefined) row.stock = Math.round(stock);
    const min = num(cell("min_stock"));
    if (min !== undefined) row.min_stock = Math.max(Math.round(min), 0);

    const margin = marginValue(cell("margin"));
    const price = num(cell("price"));
    if (margin !== undefined) {
        row.margin = margin;
    } else if (price !== undefined && priceMode !== "ignore") {
        const implied = cost !== undefined ? impliedMargin(cost, price) : null;
        if (priceMode === "margin" && implied !== null && implied >= 0) {
            row.margin = implied;
        } else {
            row.manual_price = price;
        }
    }
    return row;
}
