const priceFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
    return priceFormatter.format(value);
}

export function formatRanges(ranges: { open: string; close: string }[]) {
    if (ranges.length === 0) {
        return "Cerrado";
    }
    return ranges
        .map(function (range) {
            return `${range.open} a ${range.close}`;
        })
        .join(" y ");
}
