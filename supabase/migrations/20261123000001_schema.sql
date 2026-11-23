-- Esquema base del sistema de gestión de Pedalea Bikes (v1).
-- Moneda: ARS en numeric(12,2). Fechas: timestamptz; los días y meses de negocio se calculan en
-- hora de Argentina con public.ar_date().

-- ---------------------------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------------------------

create or replace function public.ar_date(ts timestamptz)
returns date
language sql
immutable
parallel safe
as $$
    select (ts at time zone 'America/Argentina/Buenos_Aires')::date
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Configuración (una sola fila)
-- ---------------------------------------------------------------------------------------------

create table public.settings (
    id smallint primary key default 1 check (id = 1),
    -- Recargo sobre el costo: 0.80 = 80 %.
    default_margin numeric(6, 4) not null default 0.80 check (default_margin >= 0),
    -- Los precios calculados se redondean hacia arriba a este múltiplo (0 = sin redondeo).
    price_rounding integer not null default 100 check (price_rounding >= 0),
    business_name text not null default 'Pedalea Bikes',
    address text,
    phone text,
    whatsapp text,
    email text,
    tax_id text,
    receipt_footer text,
    updated_at timestamptz not null default now()
);

create trigger settings_touch before update on public.settings
    for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------------------------
-- Categorías de caja (ingresos / egresos)
-- ---------------------------------------------------------------------------------------------

create table public.transaction_categories (
    id uuid primary key default gen_random_uuid(),
    type text not null check (type in ('income', 'expense')),
    name text not null,
    -- Código fijo para las automatizaciones (taller, repuestos, mercaderia, retiros, ...).
    code text unique,
    -- revenue: ingreso de la actividad · operating: gasto operativo del mes ·
    -- merchandise: compra de mercadería (no es gasto: se reconoce como costo al vender) ·
    -- withdrawal: retiros / gastos personales (fuera del resultado operativo).
    report_group text not null check (
        report_group in ('revenue', 'operating', 'merchandise', 'withdrawal')
    ),
    sort_order integer not null default 0,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (type, name),
    check (
        (type = 'income' and report_group = 'revenue')
        or (type = 'expense' and report_group <> 'revenue')
    )
);

-- ---------------------------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------------------------

create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    -- Categoría de ingreso en la que caen las ventas de productos de esta categoría.
    income_category_id uuid not null references public.transaction_categories (id),
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create table public.suppliers (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    contact_name text,
    phone text,
    email text,
    terms text,
    notes text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger suppliers_touch before update on public.suppliers
    for each row execute function public.touch_updated_at();

create table public.products (
    id uuid primary key default gen_random_uuid(),
    sku text unique,
    name text not null,
    category_id uuid references public.categories (id) on delete set null,
    supplier_id uuid references public.suppliers (id) on delete set null,
    location text,
    cost numeric(12, 2) not null default 0 check (cost >= 0),
    -- null → usa settings.default_margin.
    margin numeric(6, 4) check (margin >= 0),
    -- Precio fijo para excepciones: si está cargado, manda sobre el calculado.
    manual_price numeric(12, 2) check (manual_price >= 0),
    -- Mantenido por trigger: manual_price o costo × (1 + margen) redondeado.
    price numeric(12, 2) not null default 0,
    -- Solo cambia vía public._move_stock() (ver trigger products_guard_stock).
    stock integer not null default 0,
    min_stock integer not null default 0 check (min_stock >= 0),
    active boolean not null default true,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_supplier_idx on public.products (supplier_id);
create index products_name_idx on public.products (lower(name));

create table public.services (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    price numeric(12, 2) not null default 0 check (price >= 0),
    active boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Clientes y bicis
-- ---------------------------------------------------------------------------------------------

create table public.customers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text,
    email text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index customers_name_idx on public.customers (lower(name));

create trigger customers_touch before update on public.customers
    for each row execute function public.touch_updated_at();

create table public.bikes (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.customers (id) on delete cascade,
    brand text,
    model text,
    wheel_size text,
    bike_type text,
    color text,
    notes text,
    created_at timestamptz not null default now()
);

create index bikes_customer_idx on public.bikes (customer_id);

-- ---------------------------------------------------------------------------------------------
-- Cuentas y caja
-- ---------------------------------------------------------------------------------------------

create table public.accounts (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    kind text not null default 'cash' check (kind in ('cash', 'bank', 'wallet', 'card')),
    initial_balance numeric(12, 2) not null default 0,
    active boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Ventas
-- ---------------------------------------------------------------------------------------------

create table public.sales (
    id uuid primary key default gen_random_uuid(),
    number integer generated always as identity unique,
    occurred_at timestamptz not null default now(),
    customer_id uuid references public.customers (id) on delete set null,
    account_id uuid not null references public.accounts (id),
    total numeric(12, 2) not null default 0,
    notes text,
    voided_at timestamptz,
    void_reason text,
    created_at timestamptz not null default now()
);

create index sales_occurred_idx on public.sales (occurred_at desc);
create index sales_customer_idx on public.sales (customer_id);

create table public.sale_items (
    id uuid primary key default gen_random_uuid(),
    sale_id uuid not null references public.sales (id) on delete cascade,
    -- commission = "Comisión por venta de bicicleta" (monto libre, costo 0).
    kind text not null check (kind in ('product', 'service', 'free', 'commission')),
    product_id uuid references public.products (id) on delete set null,
    service_id uuid references public.services (id) on delete set null,
    description text not null,
    quantity integer not null check (quantity > 0),
    unit_price numeric(12, 2) not null check (unit_price >= 0),
    -- Costo congelado al momento de la venta: base del costo de lo vendido.
    unit_cost numeric(12, 2) not null default 0 check (unit_cost >= 0),
    income_category_id uuid not null references public.transaction_categories (id),
    created_at timestamptz not null default now()
);

create index sale_items_sale_idx on public.sale_items (sale_id);
create index sale_items_product_idx on public.sale_items (product_id);

-- ---------------------------------------------------------------------------------------------
-- Compras
-- ---------------------------------------------------------------------------------------------

create table public.purchases (
    id uuid primary key default gen_random_uuid(),
    number integer generated always as identity unique,
    occurred_at timestamptz not null default now(),
    supplier_id uuid references public.suppliers (id) on delete set null,
    account_id uuid not null references public.accounts (id),
    total numeric(12, 2) not null default 0,
    invoice_ref text,
    notes text,
    voided_at timestamptz,
    void_reason text,
    created_at timestamptz not null default now()
);

create index purchases_occurred_idx on public.purchases (occurred_at desc);
create index purchases_supplier_idx on public.purchases (supplier_id);

create table public.purchase_items (
    id uuid primary key default gen_random_uuid(),
    purchase_id uuid not null references public.purchases (id) on delete cascade,
    product_id uuid not null references public.products (id),
    description text not null,
    quantity integer not null check (quantity > 0),
    unit_cost numeric(12, 2) not null check (unit_cost >= 0),
    -- Costo que tenía el producto antes de esta compra (referencia para auditar cambios).
    previous_cost numeric(12, 2),
    created_at timestamptz not null default now()
);

create index purchase_items_purchase_idx on public.purchase_items (purchase_id);
create index purchase_items_product_idx on public.purchase_items (product_id);

-- ---------------------------------------------------------------------------------------------
-- Órdenes de trabajo
-- ---------------------------------------------------------------------------------------------

create table public.work_orders (
    id uuid primary key default gen_random_uuid(),
    number integer generated always as identity unique,
    customer_id uuid not null references public.customers (id),
    bike_id uuid references public.bikes (id) on delete set null,
    received_at timestamptz not null default now(),
    problem text,
    diagnosis text,
    work_done text,
    labor_amount numeric(12, 2) not null default 0 check (labor_amount >= 0),
    budget_amount numeric(12, 2) check (budget_amount >= 0),
    final_price numeric(12, 2) check (final_price >= 0),
    status text not null default 'recibida' check (
        status in ('recibida', 'presupuestada', 'en_reparacion', 'lista', 'entregada', 'cancelada')
    ),
    promised_at date,
    delivered_at timestamptz,
    account_id uuid references public.accounts (id),
    notes text,
    voided_at timestamptz,
    void_reason text,
    status_changed_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index work_orders_status_idx on public.work_orders (status);
create index work_orders_customer_idx on public.work_orders (customer_id);
create index work_orders_delivered_idx on public.work_orders (delivered_at desc);

create trigger work_orders_touch before update on public.work_orders
    for each row execute function public.touch_updated_at();

create table public.work_order_items (
    id uuid primary key default gen_random_uuid(),
    work_order_id uuid not null references public.work_orders (id) on delete cascade,
    kind text not null check (kind in ('product', 'service', 'free')),
    product_id uuid references public.products (id) on delete set null,
    service_id uuid references public.services (id) on delete set null,
    description text not null,
    quantity integer not null check (quantity > 0),
    unit_price numeric(12, 2) not null check (unit_price >= 0),
    -- Costo congelado al agregar el repuesto a la orden.
    unit_cost numeric(12, 2) not null default 0 check (unit_cost >= 0),
    income_category_id uuid not null references public.transaction_categories (id),
    created_at timestamptz not null default now()
);

create index work_order_items_wo_idx on public.work_order_items (work_order_id);

-- ---------------------------------------------------------------------------------------------
-- Movimientos de stock: TODO cambio de stock queda registrado acá (base de la rotación en v2).
-- ---------------------------------------------------------------------------------------------

create table public.stock_movements (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products (id) on delete cascade,
    occurred_at timestamptz not null default now(),
    kind text not null check (
        kind in ('initial', 'import', 'purchase', 'sale', 'work_order', 'adjustment', 'void')
    ),
    -- Con signo: + entra, − sale.
    quantity integer not null check (quantity <> 0),
    stock_after integer not null,
    reason text,
    sale_id uuid references public.sales (id) on delete set null,
    purchase_id uuid references public.purchases (id) on delete set null,
    work_order_id uuid references public.work_orders (id) on delete set null,
    created_at timestamptz not null default now()
);

create index stock_movements_product_idx on public.stock_movements (product_id, occurred_at desc);

-- ---------------------------------------------------------------------------------------------
-- Transacciones (caja). Las transferencias entre cuentas no son ingreso ni egreso.
-- ---------------------------------------------------------------------------------------------

create table public.transactions (
    id uuid primary key default gen_random_uuid(),
    occurred_at timestamptz not null default now(),
    type text not null check (type in ('income', 'expense', 'transfer')),
    category_id uuid references public.transaction_categories (id),
    account_id uuid not null references public.accounts (id),
    -- Solo transferencias: cuenta destino.
    to_account_id uuid references public.accounts (id),
    amount numeric(12, 2) not null check (amount > 0),
    description text,
    supplier_id uuid references public.suppliers (id) on delete set null,
    customer_id uuid references public.customers (id) on delete set null,
    sale_id uuid references public.sales (id) on delete set null,
    purchase_id uuid references public.purchases (id) on delete set null,
    work_order_id uuid references public.work_orders (id) on delete set null,
    voided_at timestamptz,
    created_at timestamptz not null default now(),
    check (
        (type = 'transfer' and to_account_id is not null and to_account_id <> account_id
            and category_id is null)
        or (type <> 'transfer' and to_account_id is null and category_id is not null)
    )
);

create index transactions_occurred_idx on public.transactions (occurred_at desc);
create index transactions_account_idx on public.transactions (account_id);
create index transactions_sale_idx on public.transactions (sale_id);
create index transactions_purchase_idx on public.transactions (purchase_id);
create index transactions_wo_idx on public.transactions (work_order_id);

-- ---------------------------------------------------------------------------------------------
-- Precio de venta
-- ---------------------------------------------------------------------------------------------

-- Redondea hacia arriba al múltiplo de `step` (para no perder margen). step 0 = solo centavos.
create or replace function public.round_price(value numeric, step integer)
returns numeric
language sql
immutable
as $$
    select case
        when step is null or step <= 0 then round(value, 2)
        else ceil(round(value, 2) / step) * step
    end
$$;

create or replace function public.compute_price(
    cost numeric,
    margin numeric,
    manual_price numeric,
    default_margin numeric,
    rounding integer
)
returns numeric
language sql
immutable
as $$
    select coalesce(
        manual_price,
        public.round_price(cost * (1 + coalesce(margin, default_margin)), rounding)
    )
$$;

create or replace function public.products_set_price()
returns trigger
language plpgsql
as $$
declare
    s public.settings;
begin
    select * into s from public.settings where id = 1;
    new.price := public.compute_price(
        new.cost, new.margin, new.manual_price,
        coalesce(s.default_margin, 0.80), coalesce(s.price_rounding, 100)
    );
    return new;
end;
$$;

-- En todo insert/update: así el precio no se puede pisar a mano por la API.
create trigger products_price before insert or update on public.products
    for each row execute function public.products_set_price();

create trigger products_touch before update on public.products
    for each row execute function public.touch_updated_at();

-- Si cambia el margen default o el redondeo, se recalculan todos los precios no manuales.
create or replace function public.settings_reprice()
returns trigger
language plpgsql
as $$
begin
    if new.default_margin is distinct from old.default_margin
        or new.price_rounding is distinct from old.price_rounding then
        update public.products
            set price = public.compute_price(
                cost, margin, manual_price, new.default_margin, new.price_rounding
            )
            where manual_price is null;
    end if;
    return new;
end;
$$;

create trigger settings_reprice after update on public.settings
    for each row execute function public.settings_reprice();

-- ---------------------------------------------------------------------------------------------
-- Stock: solo cambia por _move_stock(), que registra el movimiento. El alta con stock inicial
-- se registra sola como movimiento 'initial' (o 'import' si viene del importador).
-- ---------------------------------------------------------------------------------------------

create or replace function public.products_guard_stock()
returns trigger
language plpgsql
as $$
begin
    if new.stock is distinct from old.stock
        and coalesce(current_setting('pedalea.stock_move', true), '') <> 'on' then
        raise exception 'El stock solo se modifica con un movimiento (ajuste, compra, venta u orden).'
            using errcode = 'P0001';
    end if;
    return new;
end;
$$;

create trigger products_guard_stock before update of stock on public.products
    for each row execute function public.products_guard_stock();

create or replace function public.products_initial_movement()
returns trigger
language plpgsql
as $$
begin
    if new.stock <> 0 then
        insert into public.stock_movements (product_id, kind, quantity, stock_after, reason)
        values (
            new.id,
            coalesce(nullif(current_setting('pedalea.initial_kind', true), ''), 'initial'),
            new.stock,
            new.stock,
            'Stock inicial'
        );
    end if;
    return new;
end;
$$;

create trigger products_initial_movement after insert on public.products
    for each row execute function public.products_initial_movement();

-- ---------------------------------------------------------------------------------------------
-- RLS: solo usuarios autenticados (un único usuario en v1; multiusuario en v2 agrega roles).
-- ---------------------------------------------------------------------------------------------

do $$
declare
    t text;
begin
    foreach t in array array[
        'settings', 'transaction_categories', 'categories', 'suppliers', 'products', 'services',
        'customers', 'bikes', 'accounts', 'sales', 'sale_items', 'purchases', 'purchase_items',
        'work_orders', 'work_order_items', 'stock_movements', 'transactions'
    ]
    loop
        execute format('alter table public.%I enable row level security', t);
        execute format(
            'create policy "authenticated_all" on public.%I for all to authenticated using (true) with check (true)',
            t
        );
        execute format('revoke all on public.%I from anon', t);
    end loop;
end;
$$;
