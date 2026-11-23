-- Vistas y funciones de lectura para el panel y los reportes. Las vistas usan
-- security_invoker para respetar RLS.

-- Saldo por cuenta = saldo inicial + ingresos − egresos + transferencias recibidas − enviadas.
create or replace view public.v_account_balances
with (security_invoker = true)
as
select
    a.id,
    a.name,
    a.kind,
    a.active,
    a.sort_order,
    a.initial_balance,
    coalesce(sum(t.amount) filter (where t.type = 'income' and t.account_id = a.id), 0) as income,
    coalesce(sum(t.amount) filter (where t.type = 'expense' and t.account_id = a.id), 0) as expense,
    coalesce(sum(t.amount) filter (where t.type = 'transfer' and t.to_account_id = a.id), 0)
        as transfer_in,
    coalesce(sum(t.amount) filter (where t.type = 'transfer' and t.account_id = a.id), 0)
        as transfer_out
from public.accounts a
left join public.transactions t
    on t.voided_at is null and (t.account_id = a.id or t.to_account_id = a.id)
group by a.id;

-- Todo lo vendido con su costo congelado: ventas no anuladas + órdenes entregadas (repuestos,
-- servicios y mano de obra). Es la base del costo de lo vendido y de los rankings.
create or replace view public.v_revenue_lines
with (security_invoker = true)
as
select
    'sale'::text as source,
    s.id as source_id,
    s.number as source_number,
    s.occurred_at,
    si.kind,
    si.product_id,
    si.service_id,
    si.description,
    si.quantity,
    si.unit_price,
    si.unit_cost,
    si.income_category_id
from public.sale_items si
join public.sales s on s.id = si.sale_id
where s.voided_at is null
union all
select
    'work_order',
    w.id,
    w.number,
    w.delivered_at,
    wi.kind,
    wi.product_id,
    wi.service_id,
    wi.description,
    wi.quantity,
    wi.unit_price,
    wi.unit_cost,
    wi.income_category_id
from public.work_order_items wi
join public.work_orders w on w.id = wi.work_order_id
where w.status = 'entregada'
union all
select
    'work_order',
    w.id,
    w.number,
    w.delivered_at,
    'labor',
    null,
    null,
    'Mano de obra',
    1,
    w.labor_amount,
    0,
    public._tx_category('taller')
from public.work_orders w
where w.status = 'entregada' and w.labor_amount > 0;

-- Resumen mensual entre dos fechas (inclusive, días de Argentina).
create or replace function public.report_monthly(p_from date, p_to date)
returns table (
    month date,
    revenue numeric,
    cogs numeric,
    operating_expenses numeric,
    merchandise_purchases numeric,
    withdrawals numeric,
    other_income numeric,
    sales_count integer,
    sales_total numeric,
    work_orders_count integer,
    work_orders_total numeric
)
language sql
stable
as $$
    with months as (
        select generate_series(
            date_trunc('month', p_from)::date,
            date_trunc('month', p_to)::date,
            interval '1 month'
        )::date as m
    ),
    tx as (
        select
            date_trunc('month', public.ar_date(t.occurred_at))::date as m,
            c.report_group,
            c.code,
            sum(t.amount) as amount
        from public.transactions t
        join public.transaction_categories c on c.id = t.category_id
        where t.voided_at is null
            and t.type <> 'transfer'
            and public.ar_date(t.occurred_at) between p_from and p_to
        group by 1, 2, 3
    ),
    cg as (
        select
            date_trunc('month', public.ar_date(l.occurred_at))::date as m,
            sum(l.quantity * l.unit_cost) as cogs
        from public.v_revenue_lines l
        where public.ar_date(l.occurred_at) between p_from and p_to
        group by 1
    ),
    sc as (
        select
            date_trunc('month', public.ar_date(s.occurred_at))::date as m,
            count(*)::integer as n,
            sum(s.total) as total
        from public.sales s
        where s.voided_at is null and public.ar_date(s.occurred_at) between p_from and p_to
        group by 1
    ),
    wc as (
        select
            date_trunc('month', public.ar_date(w.delivered_at))::date as m,
            count(*)::integer as n,
            sum(w.final_price) as total
        from public.work_orders w
        where w.status = 'entregada' and public.ar_date(w.delivered_at) between p_from and p_to
        group by 1
    )
    select
        months.m,
        coalesce((select sum(amount) from tx where tx.m = months.m and report_group = 'revenue'), 0),
        coalesce((select cogs from cg where cg.m = months.m), 0),
        coalesce((select sum(amount) from tx where tx.m = months.m and report_group = 'operating'), 0),
        coalesce((select sum(amount) from tx where tx.m = months.m and report_group = 'merchandise'), 0),
        coalesce((select sum(amount) from tx where tx.m = months.m and report_group = 'withdrawal'), 0),
        coalesce((select sum(amount) from tx where tx.m = months.m and code = 'otros'), 0),
        coalesce((select n from sc where sc.m = months.m), 0),
        coalesce((select total from sc where sc.m = months.m), 0),
        coalesce((select n from wc where wc.m = months.m), 0),
        coalesce((select total from wc where wc.m = months.m), 0)
    from months
    order by months.m
$$;

-- Totales por categoría de caja en el período.
create or replace function public.report_categories(p_from date, p_to date)
returns table (
    category_id uuid,
    name text,
    code text,
    type text,
    report_group text,
    total numeric,
    count integer
)
language sql
stable
as $$
    select c.id, c.name, c.code, c.type, c.report_group, sum(t.amount), count(*)::integer
    from public.transactions t
    join public.transaction_categories c on c.id = t.category_id
    where t.voided_at is null
        and t.type <> 'transfer'
        and public.ar_date(t.occurred_at) between p_from and p_to
    group by c.id
    order by sum(t.amount) desc
$$;

-- Lo vendido agrupado por producto / servicio / descripción (para los rankings).
create or replace function public.report_items(p_from date, p_to date)
returns table (
    kind text,
    product_id uuid,
    service_id uuid,
    description text,
    quantity bigint,
    revenue numeric,
    cost numeric
)
language sql
stable
as $$
    select
        min(l.kind),
        l.product_id,
        l.service_id,
        min(l.description),
        sum(l.quantity),
        sum(l.quantity * l.unit_price),
        sum(l.quantity * l.unit_cost)
    from public.v_revenue_lines l
    where public.ar_date(l.occurred_at) between p_from and p_to
    group by
        l.product_id,
        l.service_id,
        case when l.product_id is null and l.service_id is null
            then l.kind || ':' || lower(l.description) end
$$;

-- Valor del inventario (Σ stock × costo) por categoría. Solo stock positivo.
create or replace function public.inventory_value()
returns table (category_id uuid, category_name text, units bigint, value numeric)
language sql
stable
as $$
    select p.category_id, coalesce(c.name, 'Sin categoría'),
        sum(greatest(p.stock, 0)), sum(greatest(p.stock, 0) * p.cost)
    from public.products p
    left join public.categories c on c.id = p.category_id
    where p.active
    group by p.category_id, c.name
    order by 4 desc
$$;

-- ---------------------------------------------------------------------------------------------
-- Permisos: nada para anon; todo para authenticated (RLS hace el resto).
-- ---------------------------------------------------------------------------------------------

revoke all on public.v_account_balances, public.v_revenue_lines from anon;
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
