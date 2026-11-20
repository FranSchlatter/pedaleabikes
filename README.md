# Pedalea Bikes — Landing

Landing de **Pedalea Bikes** (bicicletería y taller, Mitre 4701, Santa Fe Capital).
Solo frontend: sin base de datos, sin backend, sin pagos. Todo el contenido sale de archivos tipados en `src/data`.

**Marca:** teal `#2C7D7B` del logo sobre negro, títulos en Rokkitt (slab). Ver `DECISIONS.md`.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Motion · react-hook-form + Zod.

## Cómo correrlo

Requiere Node `>= 24.22.1` y npm `>= 11.10.0`.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                        | Qué hace                                                                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Servidor de desarrollo                                                                                                                                                                         |
| `npm run build`               | Build de producción                                                                                                                                                                            |
| `npm start`                   | Sirve el build de producción                                                                                                                                                                   |
| `npm run lint`                | ESLint                                                                                                                                                                                         |
| `npm run typecheck`           | `tsc --noEmit`                                                                                                                                                                                 |
| `npm run format`              | Prettier (4 espacios)                                                                                                                                                                          |
| `npm run images:placeholders` | Regenera las imágenes placeholder y los assets de marca (logo transparente, íconos, OG) desde `brand/logo-original.jpeg`. **Pisa** `public/images`: no correrlo después de cargar fotos reales |

## Editar contenido (`src/data`)

Todo se edita en TypeScript, así el editor te avisa si falta un campo. Los tipos están en `src/types/index.ts`.

| Archivo           | Qué tiene                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `business.ts`     | Nombre, dirección, coordenadas, WhatsApp, Instagram, **horarios**, medios de pago, días de encargo, link al stock en IG |
| `services.ts`     | **Servicios del taller** (nombre, descripción, qué incluye, precio, tiempo) y los 4 pasos del flujo                     |
| `bikes.ts`        | **Bicis** y sus categorías                                                                                              |
| `accessories.ts`  | **Accesorios** y sus categorías                                                                                         |
| `brands.ts`       | **Marcas** con las que trabajan (nombre, rubro y logo SVG opcional en `public/brands/`)                                 |
| `testimonials.ts` | Testimonios                                                                                                             |
| `videos.ts`       | Videos del taller/local                                                                                                 |
| `content.ts`      | Navegación, textos del hero, marquee, contadores y sección "Nosotros"                                                   |

### Horarios

En `business.ts` → `schedule`. Cada día tiene una lista de franjas `{ open: "HH:MM", close: "HH:MM" }` en hora de Argentina; lista vacía = cerrado.
De ahí salen solos: el indicador "Abierto ahora / Cerrado", la tabla de horarios, los días disponibles del formulario de turnos, el footer y el schema.org.

### Servicios y precios

En `services.ts`. `price` es un número en pesos (se formatea solo, ej. `$ 45.000`) o `null` para mostrar "Consultar". `highlighted: true` marca la card destacada ("Más elegido"). `videoUrl` (opcional) muestra el botón "?" que lleva al video de Instagram.

### Productos (bicis y accesorios)

Cada producto tiene `id`, `slug`, `name`, `brand`, `category`, `wheelSize` (bicis) o `size` (accesorios, opcional), `shortDescription`, `image`, `featured` y `supplier`.

- `featured: true` lo muestra primero y con la etiqueta "Top".
- `supplier` no se muestra; queda para el futuro sistema de stock.
- Las categorías se definen en `bikeCategories` / `accessoryCategories`. Los filtros solo muestran categorías que tienen productos.

### Capa de datos

Los componentes nunca importan `src/data` directo: pasan por `src/lib/data.ts` (`getBikes()`, `getServices()`, etc.). Para migrar a Supabase solo hay que cambiar la implementación de esas funciones. Ojo: con Cache Components, una consulta remota ahí necesita `"use cache"` + `cacheLife` para que la home siga siendo estática.

### WhatsApp

Todos los links salen de `buildWhatsAppLink(message)` en `src/lib/whatsapp.ts`. El número se toma de `business.whatsappNumber`.

## Reemplazar fotos y videos

Las imágenes placeholder tienen la etiqueta "FOTO PLACEHOLDER". Para reemplazarlas, **pisá el archivo con el mismo nombre** (o cambiá la ruta en `src/data`). `next/image` las optimiza solas (WebP/AVIF, tamaños responsive).

| Qué                                    | Dónde                                                      | Tamaño recomendado                                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo                                   | `brand/logo-original.jpeg` → `npm run images:placeholders` | Se convierte a PNG transparente (`public/logo.png`) y regenera ícono y OG. Si cambia la proporción, ajustá `width`/`height` en `Header.tsx`, `Footer.tsx` y `Hero.tsx` |
| Ícono / favicon                        | `src/app/icon.png`, `src/app/apple-icon.png`               | Se generan desde el logo (512×512)                                                                                                                                     |
| Imagen para compartir (WhatsApp/redes) | `src/app/opengraph-image.jpg`                              | Se genera desde el logo (1200×630); se puede pisar con una propia                                                                                                      |
| Hero (poster)                          | `public/images/hero-poster.jpg` / `hero-poster-mobile.jpg` | 1920×1080 / 1080×1920                                                                                                                                                  |
| Bicis                                  | `public/images/bikes/<slug>.jpg`                           | 4:3 (ej. 1200×900)                                                                                                                                                     |
| Accesorios                             | `public/images/accessories/<slug>.jpg`                     | 1:1 (ej. 900×900)                                                                                                                                                      |
| Nosotros                               | `public/images/about/*.jpg`                                | local 16:11, taller y equipo 4:5                                                                                                                                       |
| Posters de videos                      | `public/images/videos/*.jpg`                               | 9:16                                                                                                                                                                   |

### Videos

- **Hero:** subí `public/videos/hero.mp4` (loop corto ~10 s, sin audio, idealmente < 4 MB, H.264). Se reproduce muteado, en loop, cuando el navegador está libre; no se reproduce con "reducir movimiento" ni con ahorro de datos. Mientras no exista se ve solo el poster.
- **Sección Videos:** subí `public/videos/taller.mp4`, `local.mp4` y `ruta.mp4` (o cambiá `src` en `src/data/videos.ts`). Se cargan recién cuando el usuario toca play. Mientras no existan, la card muestra "Próximamente".

La existencia de los videos se detecta en el build: después de subirlos hay que redeployar (en Vercel pasa solo al pushear).

## Deploy en Vercel

1. Subí el repo a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importá el repo. Vercel detecta Next.js solo; no hace falta configurar nada.
3. (Opcional) Si usás dominio propio, agregalo en _Settings → Domains_ y definí la variable `NEXT_PUBLIC_SITE_URL` (ver `.env.example`) para que Open Graph, sitemap y schema.org usen ese dominio. Sin la variable se usa el dominio de producción de Vercel.
4. Cada push a la rama principal redeploya.

Para probar cómo se ve al compartir por WhatsApp, pegá la URL de producción en un chat (o en [opengraph.xyz](https://www.opengraph.xyz)).

## Estructura

```
src/
  app/          layout, page, sitemap, robots, manifest, íconos y OG image
  components/
    layout/     Header, Footer, botón flotante de WhatsApp
    sections/   una sección de la landing por archivo
    ui/         primitivas (Reveal, SectionHeading, íconos, MotionProvider)
  data/         contenido editable
  hooks/        useNowMinute (reloj compartido para horarios)
  lib/          data.ts (capa de datos), whatsapp, horarios, formato, URL del sitio
  types/        tipos de dominio
scripts/        generador de placeholders
```

Ver también `DECISIONS.md` (decisiones tomadas) y `PENDIENTES.md` (contenido que falta).
