import { describe, expect, it } from "vitest";
import { addMonths, dayBounds, monthBounds } from "./dates";
import { formatARS, parseARS } from "./money";
import { toWhatsAppNumber } from "./phone";

describe("formatARS", function () {
    it("formato es-AR", function () {
        expect(formatARS(1234567).replace(/ /g, " ")).toBe("$ 1.234.567");
        expect(formatARS(1234.5).replace(/ /g, " ")).toBe("$ 1.234,50");
    });
});

describe("parseARS", function () {
    it("entiende los formatos habituales", function () {
        expect(parseARS("1.234,50")).toBe(1234.5);
        expect(parseARS("$ 12.000")).toBe(12000);
        expect(parseARS("1234.5")).toBe(1234.5);
        expect(parseARS("12000")).toBe(12000);
        expect(parseARS("")).toBeNull();
        expect(parseARS("abc")).toBeNull();
    });
});

describe("fechas", function () {
    it("límites de día y mes en hora argentina", function () {
        expect(dayBounds("2026-12-31")).toEqual({
            from: "2026-12-31T00:00:00-03:00",
            to: "2027-01-01T00:00:00-03:00",
        });
        expect(monthBounds("2026-02")).toEqual({ first: "2026-02-01", last: "2026-02-28" });
        expect(addMonths("2026-01", -1)).toBe("2025-12");
    });
});

describe("toWhatsAppNumber", function () {
    it("normaliza teléfonos argentinos", function () {
        expect(toWhatsAppNumber("342 649-3800")).toBe("5493426493800");
        expect(toWhatsAppNumber("0342 15 4123456")).toBe("5493424123456");
        expect(toWhatsAppNumber("+54 9 342 4123456")).toBe("5493424123456");
        expect(toWhatsAppNumber("15 4123456")).toBe("5493424123456");
        expect(toWhatsAppNumber("11 5555-0102")).toBe("5491155550102");
        expect(toWhatsAppNumber("123")).toBeNull();
    });
});
