# Pendientes de contenido

Todo lo marcado con `// TODO: CONTENIDO` en el código. Ver el README para tamaños y cómo reemplazar.

## Marca

- [x] Logo de la marca aplicado (`brand/logo-original.jpeg` → `public/logo.png`)
- [ ] Logo en alta resolución o vector (el actual es un JPEG de 447×447)
- [x] Colores de marca tomados del logo → tokens en `src/app/globals.css`

## Fotos

- [ ] Poster del hero (desktop y mobile) → `public/images/hero-poster*.jpg`
- [ ] 8 fotos de bicis → `public/images/bikes/`
- [ ] 12 fotos de accesorios → `public/images/accessories/`
- [ ] Fotos de Nosotros (local, taller, equipo) → `public/images/about/` y sacar la etiqueta "Fotos placeholder" en `src/components/sections/About.tsx`
- [ ] Posters de los videos → `public/images/videos/`

## Videos

- [ ] Video del hero → `public/videos/hero.mp4`
- [ ] Videos del taller/local → `public/videos/taller.mp4`, `local.mp4`, `ruta.mp4` (títulos y textos en `src/data/videos.ts`)

## Textos y datos (`src/data`)

- [ ] Precios, descripciones y "qué incluye" de cada service → `services.ts`
- [ ] Modelos reales de bicis (marca, modelo, rodado, descripción, proveedor) → `bikes.ts`
- [ ] Accesorios reales → `accessories.ts`
- [ ] Testimonios reales (Google / Instagram) → `testimonials.ts`
- [ ] Historia, valores y fotos de "Nosotros" → `content.ts` (`about`)
- [ ] Cifras de los contadores → `content.ts` (`stats`)
- [ ] Confirmar coordenadas del local → `business.ts` (`geo`)
- [ ] Feriados, si se quieren excluir del formulario de turnos (ver DECISIONS.md)

## Deploy

- [ ] Dominio definitivo y `NEXT_PUBLIC_SITE_URL` en Vercel
