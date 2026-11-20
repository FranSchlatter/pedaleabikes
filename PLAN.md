# PLAN — Landing Pedalea Bikes

## 1. Setup
- [ ] Scaffold Next.js (App Router) + TypeScript + Tailwind 4
- [ ] `.npmrc` (save-exact, min-release-age), `engines`, versiones exactas
- [ ] Prettier (4 espacios) + reglas ESLint de estilo
- [ ] Dependencias: motion, zod, react-hook-form, @hookform/resolvers
- [ ] PLAN.md, DECISIONS.md, PENDIENTES.md

## 2. Identidad y base
- [ ] Paleta como tokens Tailwind (`@theme`) + tipografías (display condensada + sans)
- [ ] Logo placeholder en `/public/logo.png` (no vino en el repo)
- [ ] Script de imágenes placeholder (bicis, accesorios, hero, nosotros, videos, OG)
- [ ] MotionProvider (LazyMotion + `reducedMotion="user"`) y primitivas (Reveal, Stagger, SectionHeading, iconos)

## 3. Datos
- [ ] Tipos en `/src/types`
- [ ] Datos en `/src/data` (negocio, horarios, servicios, pasos, 8 bicis, 12 accesorios en 4 categorías, testimonios, videos, nosotros, stats, marquee)
- [ ] Capa `/src/lib/data.ts` (getProducts, getBikes, getAccessories, getServices, ...)
- [ ] `buildWhatsAppLink(message)` centralizado
- [ ] Lógica de horarios (abierto ahora con hora de Argentina, días hábiles)

## 4. Secciones
- [ ] Header sticky (transparente → sólido con blur), menú mobile, botón "Escribinos"
- [ ] Hero: video con poster/fallback, overlay degradé, título escalonado, CTAs, abierto/cerrado, scroll indicator
- [ ] Marquee infinito
- [ ] Contadores animados
- [ ] Servicios del taller (cards con precio)
- [ ] Flujo del taller: 4 pasos con camino que se dibuja al scrollear
- [ ] Turno para el taller (Zod + react-hook-form → WhatsApp)
- [ ] Bicis: grilla con filtros (layout animation) + banner "por encargo"
- [ ] Accesorios: grilla con filtros
- [ ] Videos (carga diferida) + "Seguinos en Instagram"
- [ ] Nosotros (placeholders + parallax)
- [ ] Testimonios
- [ ] Ubicación y horarios (mapa, tabla, "Cómo llegar")
- [ ] Footer
- [ ] Botón flotante de WhatsApp con pulso

## 5. Técnico
- [ ] Metadata + Open Graph (imagen 1200x630) + Twitter
- [ ] sitemap.ts, robots.ts, manifest
- [ ] JSON-LD BicycleStore con dirección y horarios
- [ ] prefers-reduced-motion en todo
- [ ] Accesibilidad: contraste AA, alt, foco visible, skip link, teclado
- [ ] Performance: next/image, videos preload="none" + poster, animaciones solo transform/opacity

## 6. Cierre
- [ ] README (correr, editar datos, reemplazar media, deploy Vercel)
- [ ] Revisión visual mobile + desktop (¿se ve premium?)
- [ ] Lighthouse mobile
- [ ] `npm run build` + `npm run lint` + typecheck en verde, commit final
