# Decisiones

Decisiones tomadas ante ambigüedades, para revisar.

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
