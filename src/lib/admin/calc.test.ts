import { describe, expect, it } from "vitest";
import {
    accountBalance,
    allocateWorkOrder,
    computePrice,
    grossMargin,
    impliedMargin,
    isLowStock,
    linesTotal,
    monthResult,
    percentChange,
    reorderQuantity,
    roundPrice,
} from "./calc";

const settings = { defaultMargin: 0.8, rounding: 100 };

describe("roundPrice", function () {
    it("redondea hacia arriba al múltiplo", function () {
        expect(roundPrice(1801, 100)).toBe(1900);
        expect(roundPrice(1800, 100)).toBe(1800);
        expect(roundPrice(2221.2, 100)).toBe(2300);
        expect(roundPrice(1234.5, 500)).toBe(1500);
    });

    it("sin redondeo deja centavos", function () {
        expect(roundPrice(2221.2, 0)).toBe(2221.2);
        expect(roundPrice(0.1 + 0.2, 0)).toBe(0.3);
    });

    it("no se rompe con errores de punto flotante", function () {
        // 1000 × 1.1 = 1100.0000000000002 en float.
        expect(roundPrice(1000 * 1.1, 100)).toBe(1100);
    });
});

describe("computePrice", function () {
    it("usa el margen por defecto", function () {
        expect(computePrice({ cost: 1000, margin: null, manualPrice: null }, settings)).toBe(1800);
    });

    it("usa el margen propio del producto", function () {
        expect(computePrice({ cost: 1234, margin: 0.5, manualPrice: null }, settings)).toBe(1900);
        expect(computePrice({ cost: 420000, margin: 0.35, manualPrice: null }, settings)).toBe(
            567000,
        );
    });

    it("el precio manual manda", function () {
        expect(computePrice({ cost: 1000, margin: 0.5, manualPrice: 4999 }, settings)).toBe(4999);
        expect(computePrice({ cost: 1000, margin: null, manualPrice: 0 }, settings)).toBe(0);
    });

    it("margen 0 vende al costo redondeado", function () {
        expect(computePrice({ cost: 1050, margin: 0, manualPrice: null }, settings)).toBe(1100);
    });
});

describe("impliedMargin", function () {
    it("calcula el recargo sobre el costo", function () {
        expect(impliedMargin(1000, 1800)).toBe(0.8);
        expect(impliedMargin(3000, 4000)).toBe(0.3333);
    });

    it("sin costo o precio no hay margen", function () {
        expect(impliedMargin(0, 1000)).toBeNull();
        expect(impliedMargin(1000, 0)).toBeNull();
    });
});

describe("grossMargin", function () {
    it("margen bruto y % sobre la venta", function () {
        expect(grossMargin(10000, 4000)).toEqual({ amount: 6000, pct: 0.6 });
    });

    it("sin ventas el % es null", function () {
        expect(grossMargin(0, 0)).toEqual({ amount: 0, pct: null });
    });
});

describe("monthResult", function () {
    it("resultado = margen bruto − gastos operativos; retiros aparte", function () {
        const r = monthResult({
            revenue: 10_879_500,
            cogs: 5_214_080,
            operatingExpenses: 1_908_300,
            withdrawals: 600_000,
        });
        expect(r.grossMargin).toBe(5_665_420);
        expect(r.result).toBe(3_757_120);
        expect(r.afterWithdrawals).toBe(3_157_120);
        expect(r.grossMarginPct).toBeCloseTo(0.5207, 4);
    });

    it("puede dar pérdida", function () {
        const r = monthResult({ revenue: 100, cogs: 80, operatingExpenses: 50, withdrawals: 0 });
        expect(r.result).toBe(-30);
    });
});

describe("accountBalance", function () {
    it("inicial + ingresos − egresos ± transferencias", function () {
        expect(
            accountBalance({
                initial_balance: 1000,
                income: 500.5,
                expense: 200.25,
                transfer_in: 100,
                transfer_out: 300,
            }),
        ).toBe(1100.25);
    });

    it("una transferencia no cambia el total entre cuentas", function () {
        const a = {
            initial_balance: 1000,
            income: 0,
            expense: 0,
            transfer_in: 0,
            transfer_out: 400,
        };
        const b = { initial_balance: 0, income: 0, expense: 0, transfer_in: 400, transfer_out: 0 };
        expect(accountBalance(a) + accountBalance(b)).toBe(1000);
    });
});

describe("stock", function () {
    it("bajo mínimo cuando stock ≤ mínimo (y hay mínimo)", function () {
        expect(isLowStock(2, 2)).toBe(true);
        expect(isLowStock(3, 2)).toBe(false);
        expect(isLowStock(0, 0)).toBe(false);
        expect(isLowStock(-1, 1)).toBe(true);
    });

    it("cantidad sugerida = mínimo × 2 − stock", function () {
        expect(reorderQuantity(1, 5)).toBe(9);
        expect(reorderQuantity(-2, 3)).toBe(8);
        expect(reorderQuantity(20, 5)).toBe(0);
    });
});

describe("linesTotal / percentChange", function () {
    it("suma cantidades × precios sin errores de redondeo", function () {
        expect(
            linesTotal([
                { quantity: 3, unitPrice: 0.1 },
                { quantity: 1, unitPrice: 0.2 },
            ]),
        ).toBe(0.5);
    });

    it("variación contra el período anterior", function () {
        expect(percentChange(120, 100)).toBeCloseTo(0.2);
        expect(percentChange(50, 0)).toBeNull();
        expect(percentChange(-50, -100)).toBeCloseTo(0.5);
    });
});

describe("allocateWorkOrder", function () {
    const groups = [
        { key: "taller", amount: 50000 },
        { key: "repuestos", amount: 6000 },
    ];

    it("sin diferencia respeta cada categoría", function () {
        expect(allocateWorkOrder(groups, "taller", 56000)).toEqual(groups);
    });

    it("el descuento sale primero de taller", function () {
        expect(allocateWorkOrder(groups, "taller", 50000)).toEqual([
            { key: "taller", amount: 44000 },
            { key: "repuestos", amount: 6000 },
        ]);
    });

    it("un descuento mayor a taller sigue con el resto", function () {
        expect(allocateWorkOrder(groups, "taller", 4000)).toEqual([
            { key: "repuestos", amount: 4000 },
        ]);
    });

    it("el recargo va a taller aunque no hubiera mano de obra", function () {
        expect(allocateWorkOrder([{ key: "repuestos", amount: 6000 }], "taller", 8000)).toEqual([
            { key: "repuestos", amount: 6000 },
            { key: "taller", amount: 2000 },
        ]);
    });

    it("precio final 0 (garantía) no genera ingresos", function () {
        expect(allocateWorkOrder(groups, "taller", 0)).toEqual([]);
    });
});
