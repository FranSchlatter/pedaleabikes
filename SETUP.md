# SETUP — Sistema de gestión (`/admin`)

El sistema de gestión vive en el mismo proyecto que la landing, en `/admin`. Usa **Supabase** (Postgres + login).
Sin credenciales, la landing funciona igual y `/admin` muestra un aviso de "Falta conectar Supabase".

Índice:

1. [Desarrollo local (con Docker)](#1-desarrollo-local-con-docker)
2. [Crear el proyecto de Supabase (producción)](#2-crear-el-proyecto-de-supabase-producción)
3. [Correr las migraciones](#3-correr-las-migraciones)
4. [Crear el usuario](#4-crear-el-usuario)
5. [Datos de ejemplo y limpieza](#5-datos-de-ejemplo-y-limpieza)
6. [Importar el Excel de inventario](#6-importar-el-excel-de-inventario)
7. [Deploy en Vercel](#7-deploy-en-vercel)
8. [Backups](#8-backups)

---

## 1. Desarrollo local (con Docker)

Requiere Docker corriendo.

```bash
npm install
npm run db:start            # levanta Supabase local (la primera vez descarga imágenes)
```

`db:start` imprime la URL y las claves. Crear `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<"Publishable key" de la salida>
SUPABASE_SECRET_KEY=<"Secret key" de la salida>
```

```bash
npm run db:reset            # aplica migraciones + seed con 3 meses de ejemplo
npm run admin:user -- dueno@pedalea.local pedalea-demo-2026   # usuario de prueba local
npm run dev                 # http://localhost:3000/admin
```

> `db:reset` borra también los usuarios: después de cada reset, volver a correr `admin:user`.
> El usuario y la contraseña de arriba son solo para la base local de desarrollo.

Otros comandos:

| Comando                    | Qué hace                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm run test:db`          | Tests de integración contra la base local (venta, compra, OT, anulaciones, RLS); crean y borran sus propios datos |
| `npm run db:stop`          | Apaga Supabase local                                                                                              |
| `npm run db:types`         | Regenera `src/lib/supabase/database.types.ts` desde la base local                                                 |
| `npm test`                 | Tests de cálculos (Vitest)                                                                                        |
| `npm run inventory:sample` | Regenera `data/inventario-ejemplo.xlsx` para probar el importador                                                 |

Studio (admin visual de la base): http://127.0.0.1:54323

---

## 2. Crear el proyecto de Supabase (producción)

1. Entrar a https://supabase.com → **New project**.
2. Nombre: `pedalea-gestion`. Región: **South America (São Paulo)**. Guardar la contraseña de la base (se usa en el paso 3 si se usa la CLI).
3. Cuando termine de crear: **Project Settings → API Keys** (o **API**). Copiar:
    - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
    - **Publishable key** (o "anon public" en proyectos viejos) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
    - **Secret key** (o "service_role") → `SUPABASE_SECRET_KEY` (**solo** en `.env.local`, para crear el usuario; nunca en Vercel ni en el navegador)
4. **Authentication → Sign In / Providers**: dejar habilitado **Email**, y **desactivar "Allow new users to sign up"** (el único usuario se crea a mano en el paso 4).
5. **Authentication → URL Configuration**: Site URL = el dominio de producción (ej. `https://pedaleabikes.com.ar`).

Cargar esas variables en `.env.local` (ver `.env.example`).

---

## 3. Correr las migraciones

Las migraciones están en `supabase/migrations/` y se corren **en orden**:

1. `20261123000001_schema.sql` — tablas, triggers de precio y stock, RLS
2. `20261123000002_functions.sql` — ventas, compras, órdenes, anulaciones, importación
3. `20261123000003_reports.sql` — vistas y funciones de reportes, permisos
4. `20261123000004_base_data.sql` — configuración, categorías, cuentas y servicios iniciales

**Opción A — CLI (recomendada):**

```bash
npx supabase login
npx supabase link --project-ref <ref>     # el ref está en la URL del proyecto: https://<ref>.supabase.co
npx supabase db push                      # pide la contraseña de la base
```

**Opción B — SQL Editor:** en el dashboard, **SQL Editor → New query**, pegar el contenido de cada archivo en el orden de arriba y ejecutar (Run) uno por uno.

Las migraciones activan **RLS en todas las tablas**: solo un usuario logueado puede leer o escribir. La clave publishable sola no da acceso a nada.

---

## 4. Crear el usuario

Con `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SECRET_KEY` en `.env.local`:

```bash
npm run admin:user -- tu-email@dominio.com "una-contraseña-larga"
```

Si el usuario ya existe, el mismo comando le cambia la contraseña.

Alternativa sin consola: **Authentication → Users → Add user → Create new user**, con email, contraseña y "Auto Confirm User" tildado.

Entrar en `https://<dominio>/admin` con ese email y contraseña.

---

## 5. Datos de ejemplo y limpieza

Para ver el sistema "vivo" en una demo se puede cargar `supabase/seed.sql` (3 meses de ventas, compras, órdenes y gastos ficticios):

- Local: ya se carga con `npm run db:reset`.
- Producción: SQL Editor → pegar `supabase/seed.sql` → Run. (Opcional: en producción conviene arrancar directamente con los datos reales.)

**Antes de empezar a usarlo en serio**, borrar los datos de ejemplo:

- Desde la app: **Configuración → Tus datos → Borrar datos de ejemplo** (pide escribir `BORRAR`).
- O en el SQL Editor: `select reset_business_data('BORRAR');`

Borra ventas, compras, órdenes, caja, movimientos de stock, productos, clientes y proveedores. **Conserva** configuración, cuentas (con saldo inicial en 0), categorías y servicios.

Después, en **Configuración → Cuentas**, cargar el **saldo inicial real** de cada cuenta (lo que hay en caja, banco, Mercado Pago y Posnet el día que se empieza).

---

## 6. Importar el Excel de inventario

1. **Inventario → Importar Excel** y elegir el archivo (`.xlsx`, `.xls`, `.csv`).
2. El sistema detecta la fila de encabezados y adivina qué columna es cada dato. Revisar cada selector (SKU, nombre, categoría, proveedor, ubicación, costo, precio de venta, margen, stock, mínimo).
3. **Precio de venta del Excel**:
    - _Calcular el margen de cada producto_ (recomendado): guarda el margen implícito; si después cambia el costo, el precio acompaña.
    - _Usarlo como precio manual fijo_: el precio no cambia aunque cambie el costo.
    - _Ignorarlo_: usa el margen por defecto (80 %).
4. **Productos que ya existen** (mismo SKU, o mismo nombre si no hay SKU): actualizarlos o dejarlos como están.
5. Revisar la vista previa y tocar **Importar**. Las categorías y proveedores que no existan se crean solos (revisar después en Configuración a qué categoría de ingreso quedó asignada cada categoría nueva).

El stock importado queda registrado como movimiento "Importación" en el historial de cada producto.

Para listas nuevas de un proveedor: **Inventario → Actualizar precios** (+X % al costo por proveedor o categoría).

---

## 7. Deploy en Vercel

1. Importar el repo en Vercel (Framework: Next.js, sin cambios de build).
2. **Settings → Environment Variables** (Production y Preview):
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
    - `NEXT_PUBLIC_SITE_URL` (la de la landing)
    - **No** cargar `SUPABASE_SECRET_KEY`.
3. Deploy. La landing sigue en `/` y el sistema en `/admin`.
4. En Supabase → **Authentication → URL Configuration**, agregar el dominio de Vercel a Redirect URLs si se usa un dominio distinto al Site URL.

---

## 8. Backups

- **Configuración → Tus datos → Descargar backup**: un Excel con una hoja por tabla (todas las columnas). Recomendado una vez por semana.
- Cada pantalla tiene su botón **Excel** para exportar lo que se ve (ventas, compras, órdenes, caja, inventario, proveedores, clientes, reposición).
- Supabase además hace backups diarios automáticos en los planes pagos.

---

## CI (GitHub Actions)

`.github/workflows/ci.yml` corre en cada push a `master` y en cada PR:

- **Lint, tipos, tests y build** (sin credenciales: confirma que la landing buildea sin Supabase).
- **Base de datos**: levanta Supabase en el runner, aplica migraciones + seed desde cero, corre el linter de la base y los tests de integración (`npm run test:db`).
