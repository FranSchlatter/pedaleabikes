# PLAN — Sistema de gestión Pedalea Bikes (v1, `/admin`)

Plan del landing (terminado): `docs/PLAN-landing.md`. Decisiones: `DECISIONS.md`.

## 0. Base

- [x] Explorar repo (tokens, logo, tipografías, `/src/data`) y crear PLAN.md / DECISIONS.md
- [x] Dependencias: supabase-js + ssr, radix-ui (shadcn), lucide, sonner, recharts, xlsx (SheetJS), vitest, supabase CLI
- [x] Supabase local (Docker) para desarrollo y pruebas
- [x] Migración 1: esquema (settings, categorías, proveedores, productos, servicios, clientes, bicis, OTs, ventas, compras, stock, cuentas, transacciones) + RLS
- [x] Migración 2: funciones transaccionales (venta, compra, OT, anulaciones, ajustes, importación, precios masivos)
- [x] Migración 3: vistas de reporte (saldos, líneas de ingreso con costo congelado, resumen mensual)
- [x] Seed: catálogo base + servicios de la landing + 3 meses de datos coherentes
- [x] Limpieza de datos de ejemplo (función + botón con confirmación + SQL)
- [x] Cálculos puros en TS (precio, margen, resultado, saldos) + tests Vitest

## 1. Shell del admin

- [x] Tokens "herramienta" (sin tocar los de la landing) + componentes estilo shadcn
- [x] Cliente Supabase (server/browser) + proxy que protege `/admin`
- [x] Login / logout
- [x] Layout: sidebar, botones rápidos (+ Venta, + Orden, + Compra, + Gasto) y atajos de teclado
- [x] Estados vacíos, loading y errores

## 2. Módulos

- [x] Hoy: ventas/cobros del día por medio, entregados hoy, OTs abiertas por estado, stock bajo
- [x] Venta rápida (modal): autocompletado, precio editable, línea libre y comisión, medio de pago, Enter confirma
- [x] Ventas: listado con filtros, detalle, anular
- [x] Órdenes de trabajo: kanban + lista, alta con cliente/bici al vuelo, repuestos/servicios, cambio de estado, entregar y cobrar, anular
- [x] OT: WhatsApp (presupuesto / lista) + comprobante imprimible
- [x] Inventario: tabla con filtros, edición inline, valor del inventario (total y por categoría), alta/edición de producto
- [x] Inventario: ajuste manual con motivo + historial de movimientos
- [x] Inventario: importar Excel (mapeo de columnas + vista previa, crea categorías/proveedores)
- [x] Inventario: actualización masiva de precios por proveedor/categoría
- [x] Compras: modal + listado + anular
- [x] Proveedores: ABM, productos, lista de reposición (copiar para WhatsApp + exportar)
- [x] Clientes: ABM, bicis, historial de OTs y compras
- [x] Caja: movimientos con filtros, gasto/ingreso manual, transferencias, saldos por cuenta
- [x] Reportes: mes elegible vs. anterior, facturación, CMV, margen bruto, gastos, resultado, retiros, ingresos por categoría, 12 meses, tops, ticket promedio
- [x] Configuración: margen, redondeo, negocio, cuentas, categorías, servicios
- [x] Exportar cada tabla a Excel + backup completo

## 3. Cierre

- [x] `npm run build` + `npm run lint` + tests al cerrar cada módulo, con commit
- [x] Prueba del flujo completo: alta de producto → compra → venta → OT → panel con números correctos
- [x] La landing sigue buildeando y viéndose igual
- [x] SETUP.md (Supabase, usuario, importar Excel, limpiar seed, deploy Vercel) + README
