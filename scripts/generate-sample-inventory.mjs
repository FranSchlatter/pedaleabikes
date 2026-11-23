// Genera data/inventario-ejemplo.xlsx: un Excel con encabezados "de bicicletería" para probar
// el importador (el inventario real del cliente no está en el repo).
import * as XLSX from "xlsx";
import { writeFileSync } from "node:fs";

const rows = [
    ["Listado de stock - Pedalea Bikes"],
    [],
    ["Código", "Descripción", "Rubro", "Proveedor", "Ubicación", "Precio costo", "Precio venta", "Stock", "Stock mín."],
    ["CAM-275", "Cámara 27.5x2.10 válvula presta", "Repuestos", "Rodados del Sur", "Estante A1", 5400, 9800, 10, 4],
    ["CUB-275", "Cubierta Kenda 27.5x2.20", "Repuestos", "Rodados del Sur", "Pared cubiertas", "$ 23.900", "$ 42.000", 4, 2],
    ["CAD-9V", "Cadena Shimano HG53 9v", "Repuestos", "Distribuidora Litoral Bike", "Cajón B2", 15500, 27900, 5, 2],
    ["IND-REM", "Remera ciclismo dry-fit", "Indumentaria", "Textil Pedal", "Mostrador", 14000, 26000, 6, 2],
    ["CAM-29", "Cámara 29x2.10 válvula presta", "Repuestos", "Rodados del Sur", "Estante A1", 5600, 10200, 30, 10],
    ["", "Sticker Pedalea (regalo)", "Accesorios", "", "Mostrador", 0, "", 100, 0],
];
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Stock");
writeFileSync(new URL("../data/inventario-ejemplo.xlsx", import.meta.url), XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log("data/inventario-ejemplo.xlsx");
