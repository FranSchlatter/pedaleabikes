# PLAN — Landing Pedalea Bikes

## 1. Setup

- [x] Scaffold Next.js (App Router) + TypeScript + Tailwind 4
- [x] `.npmrc` (save-exact, min-release-age), `engines`, versiones exactas
- [x] Prettier (4 espacios) + reglas ESLint de estilo
- [x] Dependencias: motion, zod, react-hook-form, @hookform/resolvers
- [x] PLAN.md, DECISIONS.md, PENDIENTES.md

## 2. Identidad y base

- [x] Paleta como tokens Tailwind (`@theme`) + tipografías (display condensada + sans)
- [x] Logo placeholder en `/public/logo.png` (no vino en el repo)
- [x] Script de imágenes placeholder (bicis, accesorios, hero, nosotros, videos, OG)
- [x] MotionProvider (LazyMotion + `reducedMotion="user"`) y primitivas (Reveal, Stagger, SectionHeading, iconos)

## 3. Datos

- [x] Tipos en `/src/types`
- [x] Datos en `/src/data` (negocio, horarios, servicios, pasos, 8 bicis, 12 accesorios en 4 categorías, testimonios, videos, nosotros, stats, marquee)
- [x] Capa `/src/lib/data.ts` (getProducts, getBikes, getAccessories, getServices, ...)
- [x] `buildWhatsAppLink(message)` centralizado
- [x] Lógica de horarios (abierto ahora con hora de Argentina, días hábiles)

## 4. Secciones

- [x] Header sticky (transparente → sólido con blur), menú mobile, botón "Escribinos"
- [x] Hero: video con poster/fallback, overlay degradé, título escalonado, CTAs, abierto/cerrado, scroll indicator
- [x] Marquee infinito
- [x] Contadores animados
- [x] Servicios del taller (cards con precio)
- [x] Flujo del taller: 4 pasos con camino que se dibuja al scrollear
- [x] Turno para el taller (Zod + react-hook-form → WhatsApp)
- [x] Bicis: grilla con filtros (layout animation) + banner "por encargo"
- [x] Accesorios: grilla con filtros
- [x] Videos (carga diferida) + "Seguinos en Instagram"
- [x] Nosotros (placeholders + parallax)
- [x] Testimonios
- [x] Ubicación y horarios (mapa, tabla, "Cómo llegar")
- [x] Footer
- [x] Botón flotante de WhatsApp con pulso

## 5. Técnico

- [x] Metadata + Open Graph (imagen 1200x630) + Twitter
- [x] sitemap.ts, robots.ts, manifest
- [x] JSON-LD BicycleStore con dirección y horarios
- [x] prefers-reduced-motion en todo
- [x] Accesibilidad: contraste AA, alt, foco visible, skip link, teclado
- [x] Performance: next/image, videos preload="none" + poster, animaciones solo transform/opacity

## 6. Cierre

- [x] README (correr, editar datos, reemplazar media, deploy Vercel)
- [x] Revisión visual mobile + desktop (¿se ve premium?)
- [x] Lighthouse mobile
- [x] `npm run build` + `npm run lint` + typecheck en verde, commit final
