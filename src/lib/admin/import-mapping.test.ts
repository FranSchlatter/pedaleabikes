import { describe, expect, it } from "vitest";
import { buildRow, guessMapping } from "./import-mapping";

const headers = [
    "Código",
    "Descripción",
    "Rubro",
    "Proveedor",
    "Ubicación",
    "Precio costo",
    "Precio venta",
    "Stock",
    "Stock mín.",
];

describe("guessMapping", function () {
    it("reconoce encabezados habituales", function () {
        expect(guessMapping(headers)).toEqual({
            sku: 0,
            name: 1,
            category: 2,
            supplier: 3,
            location: 4,
            cost: 5,
            price: 6,
            stock: 7,
            min_stock: 8,
        });
    });
});

describe("buildRow", function () {
    const mapping = guessMapping(headers);

    it("calcula el margen desde costo y precio", function () {
        const row = buildRow(
            ["X1", "Prod", "Rep", "Prov", "A1", "$ 1.000", "1.800", 5, 2],
            mapping,
            "margin",
        );
        expect(row).toMatchObject({ sku: "X1", cost: 1000, margin: 0.8, stock: 5, min_stock: 2 });
        expect(row?.manual_price).toBeUndefined();
    });

    it("sin costo usa el precio como manual", function () {
        expect(buildRow(["", "Prod", "", "", "", "", 500, 1, 0], mapping, "margin")).toMatchObject({
            manual_price: 500,
        });
    });

    it("precio menor al costo no da margen negativo", function () {
        expect(
            buildRow(["", "Prod", "", "", "", 1000, 800, 1, 0], mapping, "margin"),
        ).toMatchObject({ manual_price: 800 });
    });

    it("ignora filas sin nombre", function () {
        expect(buildRow(["A", "", "", "", "", 1, 2, 3, 4], mapping, "margin")).toBeNull();
    });
});
