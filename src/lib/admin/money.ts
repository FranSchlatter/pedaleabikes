const integerFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

const pctFormatter = new Intl.NumberFormat("es-AR", {
    style: "percent",
    maximumFractionDigits: 1,
});

// $ 1.234.567 (con centavos solo si los hay).
export function formatARS(value: number | null | undefined) {
    const n = Number(value ?? 0);
    return Number.isInteger(Math.round(n * 100) / 100)
        ? integerFormatter.format(n)
        : decimalFormatter.format(n);
}

export function formatNumber(value: number | null | undefined) {
    return numberFormatter.format(Number(value ?? 0));
}

export function formatPct(value: number | null | undefined) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return "—";
    }
    return pctFormatter.format(value);
}

// Interpreta montos escritos a mano: "1.234,50", "1234.5", "$ 12.000", "12000".
export function parseARS(input: string | number | null | undefined) {
    if (typeof input === "number") {
        return Number.isFinite(input) ? input : null;
    }
    if (input === null || input === undefined) {
        return null;
    }
    let s = input.replace(/[$\s ]/g, "");
    if (!s) {
        return null;
    }
    if (s.includes(",")) {
        s = s.replace(/\./g, "").replace(",", ".");
    } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
        // "1.234" o "1.234.567": punto de miles.
        s = s.replace(/\./g, "");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}
