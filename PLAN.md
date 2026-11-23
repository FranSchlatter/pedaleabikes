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
- [ ] Limpieza de datos de ejemplo (función + botón con confirmación + SQL)
- [x] Cálculos puros en TS (precio, margen, resultado, saldos) + tests Vitest

## 1. Shell del admin

- [ ] Tokens "herramienta" (sin tocar los de la landing) + componentes estilo shadcn
- [ ] Cliente Supabase (server/browser) + proxy que protege `/admin`
- [ ] Login / logout
- [ ] Layout: sidebar, botones rápidos (+ Venta, + Orden, + Compra, + Gasto) y atajos de teclado
- [ ] Estados vacíos, loading y errores

## 2. Módulos

- [ ] Hoy: ventas/cobros del día por medio, entregados hoy, OTs abiertas por estado, stock bajo
- [ ] Venta rápida (modal): autocompletado, precio editable, línea libre y comisión, medio de pago, Enter confirma
- [ ] Ventas: listado con filtros, detalle, anular
- [ ] Órdenes de trabajo: kanban + lista, alta con cliente/bici al vuelo, repuestos/servicios, cambio de estado, entregar y cobrar, anular
- [ ] OT: WhatsApp (presupuesto / lista) + comprobante imprimible
- [ ] Inventario: tabla con filtros, edición inline, valor del inventario (total y por categoría), alta/edición de producto
- [ ] Inventario: ajuste manual con motivo + historial de movimientos
- [ ] Inventario: importar Excel (mapeo de columnas + vista previa, crea categorías/proveedores)
- [ ] Inventario: actualización masiva de precios por proveedor/categoría
- [ ] Compras: modal + listado + anular
- [ ] Proveedores: ABM, productos, lista de reposición (copiar para WhatsApp + exportar)
- [ ] Clientes: ABM, bicis, historial de OTs y compras
- [ ] Caja: movimientos con filtros, gasto/ingreso manual, transferencias, saldos por cuenta
- [ ] Reportes: mes elegible vs. anterior, facturación, CMV, margen bruto, gastos, resultado, retiros, ingresos por categoría, 12 meses, tops, ticket promedio
- [ ] Configuración: margen, redondeo, negocio, cuentas, categorías, servicios
- [ ] Exportar cada tabla a Excel + backup completo

## 3. Cierre

- [ ] `npm run build` + `npm run lint` + tests al cerrar cada módulo, con commit
- [ ] Prueba del flujo completo: alta de producto → compra → venta → OT → panel con números correctos
- [ ] La landing sigue buildeando y viéndose igual
- [ ] SETUP.md (Supabase, usuario, importar Excel, limpiar seed, deploy Vercel) + README
