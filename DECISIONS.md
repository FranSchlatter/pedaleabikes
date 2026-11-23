# Decisiones

Decisiones tomadas ante ambigüedades, para revisar. Primero el sistema de gestión (`/admin`), después la landing.

# Sistema de gestión (`/admin`, v1)

## Estructura y stack

- **Todo vive en el mismo repo**, bajo `src/app/admin`. La landing no se tocó salvo: tokens nuevos en `globals.css` (con nombres que no existían: `canvas`, `surface`, `line`, `muted`, `primary`, `danger`, …) y el plan anterior movido a `docs/PLAN-landing.md`. El build sigue marcando `/` como estático.
- **Next 16**: el "middleware" ahora se llama `proxy` (`src/proxy.ts`), con matcher solo para `/admin`. La landing no pasa por ahí. Es un chequeo optimista: cada página y cada Server Action vuelve a validar la sesión (`src/lib/admin/auth.ts`, patrón Data Access Layer).
- **Cache Components sigue activo** (lo usa la landing). Todo el admin es por request: `getDb()` llama a `connection()`, el layout del panel envuelve las páginas en `<Suspense>` y cada página declara `instant = false`.
- **shadcn/ui escrito a mano** en `src/components/admin/ui` (Radix + cva + tailwind-merge, mismas APIs que shadcn). No se corrió `shadcn init` porque reescribe `globals.css` y su token `accent` choca con el `accent` de la landing.
- **Selects nativos** en vez del Select de Radix: más rápidos con teclado y en mobile.
- **Supabase local con Docker** (`npx supabase start`) para desarrollar y probar. `supabase/config.toml` deja apagados realtime, storage, edge functions y analytics, y con `enable_signup = false` (solo existe el usuario que se crea con el script).
- Estilo de código igual que la landing: `function` en vez de arrow functions, `type`, 4 espacios.

## Modelo de datos (cambios respecto del pedido)

- **Toda la lógica que mueve plata o stock está en funciones de Postgres** (`supabase/migrations/…_functions.sql`): `create_sale`, `void_sale`, `create_purchase`, `void_purchase`, `create_work_order`, `add/remove_work_order_item`, `deliver_work_order`, `cancel_work_order`, `adjust_stock`, `import_products`, `bulk_update_costs`. Cada una es una transacción: todo o nada. Son `SECURITY INVOKER`, así que respetan RLS.
- **El stock solo cambia vía movimientos.** Un trigger rechaza cualquier `UPDATE` de `products.stock` que no venga de `_move_stock()`, y el alta con stock inicial genera sola un movimiento "Carga inicial". `stock_movements` guarda cantidad con signo y `stock_after`.
- **Precio guardado, no calculado al vuelo**: `products.price` lo mantiene un trigger (`compute_price`). Si cambia el margen por defecto o el redondeo en Configuración, se recalculan todos los precios no manuales. La misma fórmula está en TypeScript (`src/lib/admin/calc.ts`) para las vistas previas, con tests.
- **Margen = recargo sobre el costo** (80 % → precio = costo × 1,8), como pidió el cliente. En reportes, el "margen bruto %" es sobre la venta (lo habitual en un estado de resultados); la UI lo aclara en cada lugar.
- **Redondeo hacia arriba** al múltiplo configurado (default $100), para no perder margen.
- **Costo del producto = último costo de compra** (no promedio ponderado). Lo vendido congela el costo del momento (`unit_cost` en `sale_items` / `work_order_items`), que es la base del costo de lo vendido.
- **Anular una compra no restaura el costo anterior** del producto (queda guardado en `purchase_items.previous_cost` como referencia).
- **Stock entero** (`integer`). Se permite vender con stock 0 (queda negativo, con aviso en la venta), porque en el mostrador a veces se vende algo antes de cargarlo.
- **"Bajo mínimo" = stock ≤ mínimo**, y solo si el mínimo es mayor a 0. Vista `v_low_stock` con la cantidad sugerida (mínimo × 2 − stock).
- **Categorías de caja con `code` y `report_group`**: `code` fija las que usan las automatizaciones (taller, repuestos, mercadería, retiros, …) y `report_group` define cómo entran al resultado: `revenue`, `operating` (gasto del mes), `merchandise` (compras de mercadería: no es gasto) y `withdrawal` (retiros, aparte). Las del sistema solo se pueden renombrar.
- **Cada categoría de producto apunta a una categoría de ingreso** (Repuestos → Venta de repuestos, etc.). En la importación, las categorías nuevas se asignan por nombre ("bici" → bicicletas; "accesorio", "indumentaria", "casco"… → accesorios; el resto → repuestos), editable después.
- **Una venta genera un ingreso por categoría**, todos en la cuenta elegida (pago único por venta; los pagos divididos quedan para v2).
- **Líneas de venta**: producto, servicio, línea libre (con categoría de ingreso elegible, default "Otros ingresos", costo 0) y "Comisión por venta de bicicleta" (monto libre, costo 0).
- **Órdenes de trabajo**: los repuestos descuentan stock al agregarse; quitar un repuesto lo devuelve. Al entregar se cobra en un solo paso (cuenta + precio final). Si el precio final difiere del calculado, la diferencia (descuento o recargo) va a Taller; si el descuento supera lo de taller, el resto se descuenta de los repuestos. Precio final 0 (garantía) no genera ingresos. No hay señas ni pagos parciales en v1.
- **Cancelar una orden** sirve para cualquier estado, incluso entregada: devuelve repuestos y anula ingresos. La orden queda "Cancelada" con su historial.
- **Anular nunca borra**: ventas, compras, órdenes y movimientos de caja quedan marcados (`voided_at`) y salen de saldos y reportes. Los movimientos de caja automáticos se anulan desde su origen.
- **Fechas**: `timestamptz` y día/mes de negocio con `ar_date()` en hora de Argentina. Argentina no tiene horario de verano, así que en TypeScript los límites de día usan `-03:00` fijo. Cargar una venta o gasto con otra fecha la registra a las 12:00 de ese día.
- **Clientes y bicis**: una bici pertenece a un cliente; la orden guarda la bici (opcional).
- **Preparado para v2 sin rehacer**: movimientos de stock con tipo y fecha (rotación ABC), categorías de caja con grupo de reporte (estado de resultados), vistas de reporte en SQL, y RLS por `authenticated` (multiusuario agrega una tabla de perfiles y políticas por rol).

## Reportes

- **Facturación** = ingresos de la actividad (todas las categorías de ingreso). **Costo de lo vendido** = Σ cantidad × costo congelado de ventas no anuladas + órdenes entregadas. **Resultado** = margen bruto − gastos operativos. **Retiros** aparte. **Compras de mercadería** se muestran como dato aparte, con la explicación de por qué no son gasto.
- Los ingresos de las órdenes se reconocen el día de entrega (igual que su costo).
- **Ticket promedio** = solo ventas de mostrador.
- Los gráficos usan una paleta de 3 series validada para daltonismo y contraste (verde azulado, naranja, violeta); cada gráfico tiene vista de tabla.

## Pantallas y uso

- **Atajos**: V venta, O orden, C compra, G gasto (con el foco fuera de un campo). En la venta: Enter agrega lo buscado y, con el buscador vacío, cobra; Cmd/Ctrl+Enter cobra desde cualquier campo.
- **Los modales rápidos cargan el catálogo entero una vez** (productos, servicios, clientes) y lo refrescan en segundo plano al abrirse, para que el autocompletado sea instantáneo. Pensado para unos pocos miles de productos.
- **Edición inline del stock** en la tabla de inventario = ajuste con motivo "Corrección desde la tabla de inventario". El ajuste con motivo propio está en la ficha del producto.
- **Filtros por URL** (form GET): se pueden guardar como favorito o compartir.
- **WhatsApp**: teléfonos normalizados a 549 + característica + número (saca 0 y 15; sin característica asume 342, Santa Fe).
- Las compras solo aceptan productos que ya existen (si no está, se crea primero en Inventario).
- **Backup**: un Excel con una hoja por tabla, todas las columnas tal cual están en la base.

## Importador de Excel

- **El archivo `data/inventario.xlsx` no está en el repo.** El importador no depende de un formato fijo: detecta la fila de encabezados, adivina el mapeo por sinónimos habituales (Código, Descripción, Rubro, Proveedor, Precio costo, Precio venta, Stock, Mínimo, Ubicación, …) y deja corregir cada columna antes de importar. Para probar está `data/inventario-ejemplo.xlsx` (`npm run inventory:sample` lo regenera). **Pendiente: probarlo con el Excel real del cliente.**
- Con costo y precio de venta, por defecto **se calcula el margen de cada producto** (así el precio acompaña cuando cambia el costo). Si no hay costo, o el precio es menor al costo, se guarda como precio manual. También se puede elegir "precio manual" o "ignorar".
- Busca existentes por SKU (o por nombre si la fila no tiene SKU). Si el stock cambia, lo registra como movimiento "Importación".
- El archivo se lee en el navegador y se manda en tandas de 500 filas.

## Datos de ejemplo

- El seed genera ~3 meses de actividad usando las mismas funciones que la app, así stock, caja y reportes cierran. Fechas relativas a hoy, para que el panel siempre se vea vivo.
- Servicios base = los 4 de la landing; "Reparaciones puntuales" con precio 0 (se carga el monto en cada orden).
- **Limpieza**: Configuración → "Borrar datos de ejemplo" (pide escribir BORRAR), o `select reset_business_data('BORRAR');`. Conserva configuración, cuentas (con saldo inicial en 0), categorías y servicios.

## Bugs encontrados en la prueba de punta a punta

- Supabase bloquea `DELETE`/`UPDATE` sin `WHERE` para usuarios autenticados (`pg-safeupdate`). El seed no lo detectaba porque corre como superusuario; apareció al entregar una orden desde la app. Se corrigió con `where true` en las dos sentencias afectadas y se volvieron a probar todas las funciones vía API como usuario autenticado.

# Landing

## Identidad

- **Paleta tomada del logo** (`brand/logo-original.jpeg`): teal `#2C7D7B` sobre negro. Ese teal da ~4:1 con negro y con blanco, así que no alcanza AA para texto chico. Por eso hay variantes, como tokens en `src/app/globals.css` (`@theme`):
    - `brand` `#2C7D7B`: el teal exacto del logo, para el logo, superficies decorativas y textos gigantes de fondo.
    - `accent` `#4FB3AE`: teal claro para botones (con texto negro, 7.6:1) y acentos sobre fondo oscuro.
    - `accent-ink` `#1E5F5D`: teal oscuro para texto sobre fondo claro (6.6:1).
    - `mint` `#A6E3DD`: resaltados chicos sobre oscuro (eyebrows, estrellas, "Más elegido").
    - `ink` `#0A0C0C` y `chalk` `#F2F1EC` como base oscura y clara.
- El logo vino como JPEG teal sobre negro (447×447). `scripts/generate-placeholders.mjs` lo convierte a **PNG transparente** usando el brillo como alfa (`public/logo.png`, 298×267 después del recorte), y arma desde ahí el ícono y la imagen OG. Es de baja resolución: alcanza para el header, el footer y el badge del hero, pero conviene pedir el original en vector o PNG grande.
- Tipografías: **Rokkitt 800** (slab pesada, en la línea de la tipografía del logo) para títulos + **Archivo** para texto, vía `next/font`. Rokkitt es más ancha que la condensada anterior, así que se bajó un escalón el tamaño de todos los títulos display.
- Los textos gigantes decorativos usan relleno con `background-clip: text` en vez de contorno: Rokkitt tiene trazos superpuestos y `text-stroke` los dejaba ver.
- Instagram no expone colores ni estilo en su HTML; la fuente de verdad visual es el logo.

## Contenido

- **Services** con precios y "qué incluye" reales ($45.000 / $60.000 / $80.000). El "tiempo estimado" quedó opcional y sin cargar. "Reparaciones puntuales" se mantiene (precio "Consultar") para que el turno tenga esa opción.
- Cada service muestra su lista completa (el cliente prefirió eso a "Todo lo del X, más:"). El video de Instagram que los explica va linkeado una vez en el encabezado; no se embebe porque el embed de IG carga su script y pega en la performance.
- **Stock de bicis**: sin base de datos, la fuente de verdad es la destacada de Instagram ("entrega inmediata", con precio). En la sección Bicis va primero la card de stock y después la grilla como "por encargo: consultá precio y disponibilidad".
- **Marcas** en un slider infinito (logo + nombre chico), pausa al hover. La lista se repite hasta 10 ítems para que el loop no deje huecos con pocas marcas; los lectores de pantalla leen una lista aparte sin repetir.
- Contadores confirmados por el cliente (+5.000 bicis, 2 mecánicos, 1-2 días); "100% presupuestos antes de arreglar" sigue siendo de ejemplo.
- El mensaje de consulta de **accesorios** es "Hola! Quería consultar por el accesorio: …" (el de bicis, "…por la [modelo]", no concuerda en género con muchos accesorios). Las bicis incluyen el rodado en el mensaje.
- Rodado como texto (`"29"`, `"700c"`): mezcla pulgadas y medidas de ruta. Se muestra `R29` o `700C`.
- Coordenadas del local aproximadas; código postal tomado de Google Maps (S3000AZQ).

## Turnos

- El día se elige en un **select con los próximos 12 días hábiles** en vez de un date picker: el `<input type="date">` nativo no permite bloquear fines de semana y en mobile el select es más rápido.
- "Día hábil" = día en que el local abre según `schedule`. **Hoy** se ofrece solo si el local todavía no cerró.
- **No contempla feriados.** Si se necesita, agregar una lista de fechas cerradas en `business.ts` y filtrarlas en `getUpcomingBusinessDays`.
- Todo se calcula en hora de Argentina (`America/Argentina/Buenos_Aires`) sin importar la zona del dispositivo. El día se revalida al enviar.
- Al enviar se abre WhatsApp con `window.open`; si el navegador lo bloquea queda un link "Tocá acá".
- Las cards de servicios tienen "Sacar turno", que baja al formulario con ese servicio ya elegido.

## Técnico

- Se mantuvo **Cache Components** (default del scaffold de Next 16). Implica: nada de `new Date()` en server; los horarios se calculan en el cliente con un reloj compartido (`useSyncExternalStore`), así no hay mismatch de hidratación. El sitemap no lleva `lastModified` por la misma razón.
- **"Metadata por sección"**: es una sola página, y Next genera metadata por ruta, no por ancla. Cada sección tiene `id`, `aria-labelledby` y su `h2`; la metadata global, OG, Twitter y JSON-LD cubren la página. Si más adelante hay rutas por producto, ahí va la metadata específica.
- schema.org: `BicycleStore` con dirección, geo, horarios (`OpeningHoursSpecification`), medios de pago e Instagram.
- **Videos inexistentes**: la existencia de los mp4 se chequea en build (`publicFileExists`). Sin archivo, se muestra el poster en vez de pedir un archivo que da 404.
- Motion: `LazyMotion` con features cargadas async + componentes `m`. Bajó el TBT mobile de ~1.170 ms a ~100–200 ms.
- Animaciones solo con transform/opacity (el camino del taller se dibuja con `scaleX`/`scaleY`, no con `pathLength`). El marquee y el pulso son CSS.
- `prefers-reduced-motion`: `MotionConfig reducedMotion="user"` + CSS que fuerza visibles los `[data-reveal]` y corta animaciones CSS; el video del hero no arranca y el camino del taller se muestra completo.
- El subtítulo del hero no tiene fade de opacidad porque es el LCP en mobile.
- Reveals con `margin` de viewport en vez de `amount`: bloques más altos que la pantalla nunca cumplían un porcentaje y quedaban invisibles.
- Catálogo en mobile: grilla de 2 columnas compacta (la descripción se oculta en < 640 px) para que 8 bicis no ocupen 8 pantallas.
- En dispositivos con hover, el botón "Consultar" de las cards aparece al pasar el mouse (o con foco de teclado); en touch está siempre visible.
- Mapa: iframe de Google Maps sin API key, con `loading="lazy"`.
- URL del sitio: `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `http://localhost:3000`.
- Estilo de código: 4 espacios, `function` en vez de arrow functions, `type` en vez de `interface`, sin enums (reglas en `eslint.config.mjs`).

## Resultado Lighthouse (mobile, build local)

Performance 92–93 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100. El LCP (~3 s simulado) es el subtítulo del hero y lo domina la carga de fuentes; con fotos reales el poster probablemente pase a ser el LCP.
