// Cálculos de negocio puros (sin DB), cubiertos por tests en calc.test.ts. La base de datos
// replica las mismas reglas en SQL (compute_price, deliver_work_order); si cambia una, cambiar
// la otra.

// Trabaja en centavos para no arrastrar errores de punto flotante.
function toCents(value: number) {
    return Math.round(value * 100);
}

// Redondea hacia arriba al múltiplo de `step` (para no perder margen). step 0 → solo centavos.
export function roundPrice(value: number, step: number) {
    const cents = toCents(value);
    if (!step || step <= 0) {
        return cents / 100;
    }
    const stepCents = toCents(step);
    return (Math.ceil(cents / stepCents) * stepCents) / 100;
}

export type PricingSettings = {
    defaultMargin: number;
    rounding: number;
};

export type PricedProduct = {
    cost: number;
    // Recargo sobre el costo (0.8 = 80 %). null → margen por defecto.
    margin: number | null;
    manualPrice: number | null;
};

// Precio = costo × (1 + margen) redondeado, salvo que tenga precio manual.
export function computePrice(product: PricedProduct, settings: PricingSettings) {
    if (product.manualPrice !== null && product.manualPrice !== undefined) {
        return product.manualPrice;
    }
    const margin = product.margin ?? settings.defaultMargin;
    return roundPrice(product.cost * (1 + margin), settings.rounding);
}

// Margen implícito de un precio de venta (para importar listas con precio y costo).
export function impliedMargin(cost: number, price: number) {
    if (cost <= 0 || price <= 0) {
        return null;
    }
    return Math.round((price / cost - 1) * 10000) / 10000;
}

// Margen bruto y % sobre la venta (no sobre el costo).
export function grossMargin(revenue: number, cogs: number) {
    const amount = (toCents(revenue) - toCents(cogs)) / 100;
    return {
        amount,
        pct: revenue > 0 ? amount / revenue : null,
    };
}

export type MonthFigures = {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    withdrawals: number;
};

// Resultado = margen bruto − gastos operativos. Las compras de mercadería no entran (su costo se
// reconoce al vender, vía cogs) y los retiros personales se muestran aparte.
export function monthResult(figures: MonthFigures) {
    const margin = grossMargin(figures.revenue, figures.cogs);
    const result = (toCents(margin.amount) - toCents(figures.operatingExpenses)) / 100;
    return {
        grossMargin: margin.amount,
        grossMarginPct: margin.pct,
        result,
        resultPct: figures.revenue > 0 ? result / figures.revenue : null,
        afterWithdrawals: (toCents(result) - toCents(figures.withdrawals)) / 100,
    };
}

export type AccountMovements = {
    initial_balance: number;
    income: number;
    expense: number;
    transfer_in: number;
    transfer_out: number;
};

// Saldo = inicial + ingresos − egresos + transferencias recibidas − enviadas.
export function accountBalance(account: AccountMovements) {
    return (
        (toCents(account.initial_balance) +
            toCents(account.income) -
            toCents(account.expense) +
            toCents(account.transfer_in) -
            toCents(account.transfer_out)) /
        100
    );
}

export function percentChange(current: number, previous: number) {
    if (!previous) {
        return null;
    }
    return (current - previous) / Math.abs(previous);
}

export function isLowStock(stock: number, minStock: number) {
    return minStock > 0 && stock <= minStock;
}

// Cantidad sugerida para reponer = mínimo × 2 − stock.
export function reorderQuantity(stock: number, minStock: number) {
    return Math.max(minStock * 2 - stock, 0);
}

export type Line = {
    quantity: number;
    unitPrice: number;
};

export function linesTotal(lines: Line[]) {
    return (
        lines.reduce(function (sum, line) {
            return sum + line.quantity * toCents(line.unitPrice);
        }, 0) / 100
    );
}

export type AllocationGroup = {
    key: string;
    amount: number;
};

// Reparte el precio final de una orden entre categorías de ingreso. La diferencia con el total
// calculado (descuento o recargo) va a Taller; si el descuento supera lo de taller, se descuenta
// del resto en orden de mayor a menor. Igual que deliver_work_order() en SQL.
export function allocateWorkOrder(
    groups: AllocationGroup[],
    tallerKey: string,
    finalPrice: number,
) {
    const map = new Map<string, number>();
    for (const group of groups) {
        map.set(group.key, (map.get(group.key) ?? 0) + toCents(group.amount));
    }
    if (!map.has(tallerKey)) {
        map.set(tallerKey, 0);
    }
    const total = Array.from(map.values()).reduce(function (a, b) {
        return a + b;
    }, 0);
    let diff = toCents(finalPrice) - total;
    if (diff >= 0) {
        map.set(tallerKey, (map.get(tallerKey) ?? 0) + diff);
    } else {
        diff = -diff;
        const order = Array.from(map.entries()).sort(function (a, b) {
            if (a[0] === tallerKey) return -1;
            if (b[0] === tallerKey) return 1;
            return b[1] - a[1];
        });
        for (const [key, amount] of order) {
            if (diff <= 0) break;
            const cut = Math.min(amount, diff);
            map.set(key, amount - cut);
            diff -= cut;
        }
    }
    return Array.from(map.entries())
        .filter(function (entry) {
            return entry[1] > 0;
        })
        .map(function ([key, cents]) {
            return { key, amount: cents / 100 };
        });
}
