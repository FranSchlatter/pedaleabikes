export const BIKE_TYPES = [
    "MTB",
    "Urbana",
    "Ruta",
    "Paseo",
    "Gravel",
    "Infantil",
    "Eléctrica",
    "Otra",
];

type BikeLike = {
    brand?: string | null;
    model?: string | null;
    wheel_size?: string | null;
    bike_type?: string | null;
    color?: string | null;
};

export function bikeLabel(bike: BikeLike | null | undefined) {
    if (!bike) return "Sin bici cargada";
    const parts = [bike.brand, bike.model].filter(Boolean).join(" ");
    const extra = [bike.wheel_size ? `R${bike.wheel_size}` : null, bike.bike_type, bike.color]
        .filter(Boolean)
        .join(" · ");
    return [parts || "Bici", extra].filter(Boolean).join(" — ");
}

// "1 orden", "3 órdenes".
export function plural(n: number, singular: string, pluralForm: string) {
    return `${n} ${n === 1 ? singular : pluralForm}`;
}
