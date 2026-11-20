# Decisiones

Decisiones tomadas ante ambigüedades, para revisar.

## Identidad

- **No vino logo ni paleta** (el repo estaba vacío). Se definió una paleta propia, deportiva/urbana: tinta `#0E0F11`, tiza `#F3F0E8`, naranja `#FF5B1F` (acento), lima `#D4FF3A` (secundario). Están como tokens en `src/app/globals.css` (`@theme`). Cuando llegue el logo real, ajustar esos valores.
- `accent-ink` (`#B33A0C`) es el naranja oscurecido para texto sobre fondo claro: el naranja puro no llega a contraste AA sobre la tiza.
- Se generó un **logo placeholder** (`public/logo.png`), ícono y OG image con `scripts/generate-placeholders.mjs`.
- Tipografías: **Anton** (display condensada) + **Archivo** (texto), vía `next/font`.

## Contenido

- **Precios de servicios** no vinieron: se cargaron $25.000 / $45.000 / $70.000 de ejemplo, marcados como TODO.
- Se agregó un **"tiempo estimado"** opcional por servicio y una lista de "qué incluye".
- Contadores: "+1.500 bicis reparadas" y "100% presupuestos antes de arreglar" son cifras de ejemplo.
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

Performance 92–94 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100. El LCP (~3 s simulado) es el subtítulo del hero y lo domina la carga de fuentes; con fotos reales el poster probablemente pase a ser el LCP.
