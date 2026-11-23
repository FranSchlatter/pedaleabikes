-- Operaciones de negocio. Cada función corre en una sola transacción: si algo falla, no queda
-- nada a medias (venta sin stock descontado, compra sin egreso, etc.).
-- Son SECURITY INVOKER: corren con los permisos del usuario y respetan RLS.

-- ---------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------

create or replace function public._tx_category(p_code text)
returns uuid
language sql
stable
as $$
    select id from public.transaction_categories where code = p_code
$$;

create or replace function public._at(p jsonb, p_key text default 'occurred_at')
returns timestamptz
language sql
stable
as $$
    select coalesce(nullif(p ->> p_key, '')::timestamptz, now())
$$;

-- Único camino para cambiar stock: actualiza el producto y registra el movimiento.
create or replace function public._move_stock(
    p_product uuid,
    p_quantity integer,
    p_kind text,
    p_reason text,
    p_at timestamptz default now(),
    p_sale uuid default null,
    p_purchase uuid default null,
    p_work_order uuid default null
)
returns integer
language plpgsql
as $$
declare
    v_after integer;
begin
    if p_quantity = 0 then
        select stock into v_after from public.products where id = p_product;
        return v_after;
    end if;

    perform set_config('pedalea.stock_move', 'on', true);
    update public.products set stock = stock + p_quantity
        where id = p_product
        returning stock into v_after;
    perform set_config('pedalea.stock_move', 'off', true);

    if not found then
        raise exception 'Producto inexistente.';
    end if;

    insert into public.stock_movements (
        product_id, occurred_at, kind, quantity, stock_after, reason,
        sale_id, purchase_id, work_order_id
    )
    values (
        p_product, coalesce(p_at, now()), p_kind, p_quantity, v_after, p_reason,
        p_sale, p_purchase, p_work_order
    );

    return v_after;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Ventas
-- ---------------------------------------------------------------------------------------------

-- p: { occurred_at?, customer_id?, account_id, notes?, items: [
--   { kind: product|service|free|commission, product_id?, service_id?, description?,
--     quantity, unit_price, unit_cost? (solo free), income_category_id? (solo free) } ] }
create or replace function public.create_sale(p jsonb)
returns jsonb
language plpgsql
as $$
declare
    v_sale public.sales;
    v_item jsonb;
    v_at timestamptz := public._at(p);
    v_account uuid := nullif(p ->> 'account_id', '')::uuid;
    v_kind text;
    v_qty integer;
    v_price numeric;
    v_cost numeric;
    v_desc text;
    v_cat uuid;
    v_product_id uuid;
    v_service_id uuid;
    v_prod record;
    v_serv record;
    v_total numeric := 0;
begin
    if v_account is null then
        raise exception 'Elegí el medio de pago.';
    end if;
    if jsonb_typeof(p -> 'items') is distinct from 'array'
        or jsonb_array_length(p -> 'items') = 0 then
        raise exception 'La venta no tiene ítems.';
    end if;

    insert into public.sales (occurred_at, customer_id, account_id, notes)
    values (v_at, nullif(p ->> 'customer_id', '')::uuid, v_account, nullif(trim(p ->> 'notes'), ''))
    returning * into v_sale;

    for v_item in select * from jsonb_array_elements(p -> 'items')
    loop
        v_kind := v_item ->> 'kind';
        v_qty := coalesce(nullif(v_item ->> 'quantity', '')::integer, 1);
        v_price := round(nullif(v_item ->> 'unit_price', '')::numeric, 2);
        v_desc := nullif(trim(v_item ->> 'description'), '');
        v_cost := 0;
        v_product_id := null;
        v_service_id := null;

        if v_qty is null or v_qty <= 0 then
            raise exception 'La cantidad tiene que ser mayor a cero.';
        end if;

        if v_kind = 'product' then
            select p2.id, p2.name, p2.cost, p2.price, c.income_category_id
                into v_prod
                from public.products p2
                left join public.categories c on c.id = p2.category_id
                where p2.id = nullif(v_item ->> 'product_id', '')::uuid
                for update of p2;
            if not found then
                raise exception 'Producto inexistente.';
            end if;
            v_product_id := v_prod.id;
            v_cost := v_prod.cost;
            v_price := coalesce(v_price, v_prod.price);
            v_desc := coalesce(v_desc, v_prod.name);
            v_cat := coalesce(v_prod.income_category_id, public._tx_category('repuestos'));
        elsif v_kind = 'service' then
            select id, name, price into v_serv
                from public.services
                where id = nullif(v_item ->> 'service_id', '')::uuid;
            if not found then
                raise exception 'Servicio inexistente.';
            end if;
            v_service_id := v_serv.id;
            v_price := coalesce(v_price, v_serv.price);
            v_desc := coalesce(v_desc, v_serv.name);
            v_cat := public._tx_category('taller');
        elsif v_kind = 'free' then
            if v_desc is null then
                raise exception 'La línea libre necesita una descripción.';
            end if;
            v_cost := coalesce(round(nullif(v_item ->> 'unit_cost', '')::numeric, 2), 0);
            v_cat := coalesce(
                nullif(v_item ->> 'income_category_id', '')::uuid,
                public._tx_category('otros')
            );
        elsif v_kind = 'commission' then
            v_qty := 1;
            v_desc := coalesce(v_desc, 'Comisión por venta de bicicleta');
            v_cat := public._tx_category('comision');
        else
            raise exception 'Tipo de línea inválido: %', v_kind;
        end if;

        if v_price is null or v_price < 0 then
            raise exception 'Precio inválido en "%".', v_desc;
        end if;

        insert into public.sale_items (
            sale_id, kind, product_id, service_id, description, quantity, unit_price,
            unit_cost, income_category_id
        )
        values (
            v_sale.id, v_kind, v_product_id, v_service_id, v_desc, v_qty, v_price, v_cost, v_cat
        );

        if v_kind = 'product' then
            perform public._move_stock(
                v_product_id, -v_qty, 'sale', 'Venta #' || v_sale.number, v_at, v_sale.id
            );
        end if;

        v_total := v_total + v_qty * v_price;
    end loop;

    update public.sales set total = v_total where id = v_sale.id;

    -- Un ingreso por categoría (repuestos, accesorios, taller, ...), todos en la cuenta elegida.
    insert into public.transactions (
        occurred_at, type, category_id, account_id, amount, description, customer_id, sale_id
    )
    select v_at, 'income', income_category_id, v_account, sum(quantity * unit_price),
        'Venta #' || v_sale.number, v_sale.customer_id, v_sale.id
    from public.sale_items
    where sale_id = v_sale.id
    group by income_category_id
    having sum(quantity * unit_price) > 0;

    return jsonb_build_object('id', v_sale.id, 'number', v_sale.number, 'total', v_total);
end;
$$;

create or replace function public.void_sale(p_sale_id uuid, p_reason text default null)
returns void
language plpgsql
as $$
declare
    v_sale public.sales;
    r record;
begin
    select * into v_sale from public.sales where id = p_sale_id for update;
    if not found then
        raise exception 'Venta inexistente.';
    end if;
    if v_sale.voided_at is not null then
        raise exception 'La venta ya está anulada.';
    end if;

    update public.sales
        set voided_at = now(), void_reason = nullif(trim(p_reason), '')
        where id = p_sale_id;

    for r in
        select product_id, sum(quantity)::integer as qty
        from public.sale_items
        where sale_id = p_sale_id and kind = 'product' and product_id is not null
        group by product_id
    loop
        perform public._move_stock(
            r.product_id, r.qty, 'void', 'Anulación venta #' || v_sale.number, now(), p_sale_id
        );
    end loop;

    update public.transactions set voided_at = now()
        where sale_id = p_sale_id and voided_at is null;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Compras
-- ---------------------------------------------------------------------------------------------

-- p: { occurred_at?, supplier_id?, account_id, invoice_ref?, notes?,
--      items: [{ product_id, quantity, unit_cost }] }
-- Suma stock, registra el egreso "Mercadería" y actualiza el costo (y el precio) del producto.
create or replace function public.create_purchase(p jsonb)
returns jsonb
language plpgsql
as $$
declare
    v_purchase public.purchases;
    v_item jsonb;
    v_at timestamptz := public._at(p);
    v_account uuid := nullif(p ->> 'account_id', '')::uuid;
    v_qty integer;
    v_cost numeric;
    v_prod public.products;
    v_total numeric := 0;
    v_supplier_name text;
begin
    if v_account is null then
        raise exception 'Elegí la cuenta con la que se pagó.';
    end if;
    if jsonb_typeof(p -> 'items') is distinct from 'array'
        or jsonb_array_length(p -> 'items') = 0 then
        raise exception 'La compra no tiene ítems.';
    end if;

    insert into public.purchases (occurred_at, supplier_id, account_id, invoice_ref, notes)
    values (
        v_at,
        nullif(p ->> 'supplier_id', '')::uuid,
        v_account,
        nullif(trim(p ->> 'invoice_ref'), ''),
        nullif(trim(p ->> 'notes'), '')
    )
    returning * into v_purchase;

    for v_item in select * from jsonb_array_elements(p -> 'items')
    loop
        v_qty := nullif(v_item ->> 'quantity', '')::integer;
        v_cost := round(nullif(v_item ->> 'unit_cost', '')::numeric, 2);
        if v_qty is null or v_qty <= 0 then
            raise exception 'La cantidad tiene que ser mayor a cero.';
        end if;
        if v_cost is null or v_cost < 0 then
            raise exception 'Costo inválido.';
        end if;

        select * into v_prod
            from public.products
            where id = nullif(v_item ->> 'product_id', '')::uuid
            for update;
        if not found then
            raise exception 'Producto inexistente.';
        end if;

        insert into public.purchase_items (
            purchase_id, product_id, description, quantity, unit_cost, previous_cost
        )
        values (v_purchase.id, v_prod.id, v_prod.name, v_qty, v_cost, v_prod.cost);

        -- El trigger de precios recalcula el precio de venta (salvo precio manual).
        update public.products set cost = v_cost where id = v_prod.id;

        perform public._move_stock(
            v_prod.id, v_qty, 'purchase', 'Compra #' || v_purchase.number, v_at, null,
            v_purchase.id
        );

        v_total := v_total + v_qty * v_cost;
    end loop;

    update public.purchases set total = v_total where id = v_purchase.id;

    select name into v_supplier_name from public.suppliers where id = v_purchase.supplier_id;

    if v_total > 0 then
        insert into public.transactions (
            occurred_at, type, category_id, account_id, amount, description, supplier_id,
            purchase_id
        )
        values (
            v_at, 'expense', public._tx_category('mercaderia'), v_account, v_total,
            'Compra #' || v_purchase.number || coalesce(' · ' || v_supplier_name, ''),
            v_purchase.supplier_id, v_purchase.id
        );
    end if;

    return jsonb_build_object(
        'id', v_purchase.id, 'number', v_purchase.number, 'total', v_total
    );
end;
$$;

-- Revierte stock y egreso. El costo del producto no se toca: queda el último cargado.
create or replace function public.void_purchase(p_purchase_id uuid, p_reason text default null)
returns void
language plpgsql
as $$
declare
    v_purchase public.purchases;
    r record;
begin
    select * into v_purchase from public.purchases where id = p_purchase_id for update;
    if not found then
        raise exception 'Compra inexistente.';
    end if;
    if v_purchase.voided_at is not null then
        raise exception 'La compra ya está anulada.';
    end if;

    update public.purchases
        set voided_at = now(), void_reason = nullif(trim(p_reason), '')
        where id = p_purchase_id;

    for r in
        select product_id, sum(quantity)::integer as qty
        from public.purchase_items
        where purchase_id = p_purchase_id
        group by product_id
    loop
        perform public._move_stock(
            r.product_id, -r.qty, 'void', 'Anulación compra #' || v_purchase.number, now(),
            null, p_purchase_id
        );
    end loop;

    update public.transactions set voided_at = now()
        where purchase_id = p_purchase_id and voided_at is null;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Órdenes de trabajo
-- ---------------------------------------------------------------------------------------------

create or replace function public._open_work_order(p_id uuid)
returns public.work_orders
language plpgsql
as $$
declare
    v_wo public.work_orders;
begin
    select * into v_wo from public.work_orders where id = p_id for update;
    if not found then
        raise exception 'Orden inexistente.';
    end if;
    if v_wo.status in ('entregada', 'cancelada') then
        raise exception 'La orden #% ya está %.', v_wo.number, v_wo.status;
    end if;
    return v_wo;
end;
$$;

-- p: { customer_id? | new_customer: { name, phone? }, bike_id? | new_bike: { brand, model,
--      wheel_size, bike_type, color }, received_at?, problem?, labor_amount?, budget_amount?,
--      promised_at?, notes? }
create or replace function public.create_work_order(p jsonb)
returns jsonb
language plpgsql
as $$
declare
    v_customer uuid := nullif(p ->> 'customer_id', '')::uuid;
    v_bike uuid := nullif(p ->> 'bike_id', '')::uuid;
    v_wo public.work_orders;
    v_nb jsonb := p -> 'new_bike';
begin
    if v_customer is null then
        if nullif(trim(p -> 'new_customer' ->> 'name'), '') is null then
            raise exception 'Falta el cliente.';
        end if;
        insert into public.customers (name, phone)
        values (
            trim(p -> 'new_customer' ->> 'name'),
            nullif(trim(p -> 'new_customer' ->> 'phone'), '')
        )
        returning id into v_customer;
    end if;

    if v_bike is null and v_nb is not null and jsonb_typeof(v_nb) = 'object'
        and coalesce(
            nullif(trim(v_nb ->> 'brand'), ''), nullif(trim(v_nb ->> 'model'), ''),
            nullif(trim(v_nb ->> 'bike_type'), ''), nullif(trim(v_nb ->> 'wheel_size'), '')
        ) is not null then
        insert into public.bikes (customer_id, brand, model, wheel_size, bike_type, color)
        values (
            v_customer,
            nullif(trim(v_nb ->> 'brand'), ''),
            nullif(trim(v_nb ->> 'model'), ''),
            nullif(trim(v_nb ->> 'wheel_size'), ''),
            nullif(trim(v_nb ->> 'bike_type'), ''),
            nullif(trim(v_nb ->> 'color'), '')
        )
        returning id into v_bike;
    end if;

    insert into public.work_orders (
        customer_id, bike_id, received_at, problem, labor_amount, budget_amount, promised_at,
        notes, status_changed_at
    )
    values (
        v_customer,
        v_bike,
        public._at(p, 'received_at'),
        nullif(trim(p ->> 'problem'), ''),
        coalesce(nullif(p ->> 'labor_amount', '')::numeric, 0),
        nullif(p ->> 'budget_amount', '')::numeric,
        nullif(p ->> 'promised_at', '')::date,
        nullif(trim(p ->> 'notes'), ''),
        public._at(p, 'received_at')
    )
    returning * into v_wo;

    return jsonb_build_object('id', v_wo.id, 'number', v_wo.number);
end;
$$;

-- Cambios de estado "de taller". Entregar y cancelar tienen su propia función.
create or replace function public.set_work_order_status(p_id uuid, p_status text)
returns void
language plpgsql
as $$
begin
    if p_status not in ('recibida', 'presupuestada', 'en_reparacion', 'lista') then
        raise exception 'Estado inválido: %', p_status;
    end if;
    perform public._open_work_order(p_id);
    update public.work_orders
        set status = p_status, status_changed_at = now()
        where id = p_id and status <> p_status;
end;
$$;

-- p: { kind: product|service|free, product_id?, service_id?, description?, quantity,
--      unit_price? (default: precio actual), income_category_id? (solo free) }
-- Los repuestos descuentan stock en el momento.
create or replace function public.add_work_order_item(p_work_order_id uuid, p jsonb)
returns uuid
language plpgsql
as $$
declare
    v_wo public.work_orders := public._open_work_order(p_work_order_id);
    v_kind text := p ->> 'kind';
    v_qty integer := coalesce(nullif(p ->> 'quantity', '')::integer, 1);
    v_price numeric := round(nullif(p ->> 'unit_price', '')::numeric, 2);
    v_desc text := nullif(trim(p ->> 'description'), '');
    v_cost numeric := 0;
    v_cat uuid;
    v_product_id uuid;
    v_service_id uuid;
    v_prod record;
    v_serv record;
    v_id uuid;
begin
    if v_qty <= 0 then
        raise exception 'La cantidad tiene que ser mayor a cero.';
    end if;

    if v_kind = 'product' then
        select p2.id, p2.name, p2.cost, p2.price, c.income_category_id
            into v_prod
            from public.products p2
            left join public.categories c on c.id = p2.category_id
            where p2.id = nullif(p ->> 'product_id', '')::uuid
            for update of p2;
        if not found then
            raise exception 'Producto inexistente.';
        end if;
        v_product_id := v_prod.id;
        v_cost := v_prod.cost;
        v_price := coalesce(v_price, v_prod.price);
        v_desc := coalesce(v_desc, v_prod.name);
        v_cat := coalesce(v_prod.income_category_id, public._tx_category('repuestos'));
    elsif v_kind = 'service' then
        select id, name, price into v_serv
            from public.services
            where id = nullif(p ->> 'service_id', '')::uuid;
        if not found then
            raise exception 'Servicio inexistente.';
        end if;
        v_service_id := v_serv.id;
        v_price := coalesce(v_price, v_serv.price);
        v_desc := coalesce(v_desc, v_serv.name);
        v_cat := public._tx_category('taller');
    elsif v_kind = 'free' then
        if v_desc is null then
            raise exception 'La línea libre necesita una descripción.';
        end if;
        v_cat := coalesce(nullif(p ->> 'income_category_id', '')::uuid, public._tx_category('taller'));
    else
        raise exception 'Tipo de línea inválido: %', v_kind;
    end if;

    if v_price is null or v_price < 0 then
        raise exception 'Precio inválido.';
    end if;

    insert into public.work_order_items (
        work_order_id, kind, product_id, service_id, description, quantity, unit_price,
        unit_cost, income_category_id
    )
    values (
        p_work_order_id, v_kind, v_product_id, v_service_id, v_desc, v_qty, v_price, v_cost,
        v_cat
    )
    returning id into v_id;

    if v_kind = 'product' then
        perform public._move_stock(
            v_product_id, -v_qty, 'work_order', 'OT #' || v_wo.number, now(), null, null,
            p_work_order_id
        );
    end if;

    return v_id;
end;
$$;

create or replace function public.remove_work_order_item(p_item_id uuid)
returns void
language plpgsql
as $$
declare
    v_item public.work_order_items;
    v_wo public.work_orders;
begin
    select * into v_item from public.work_order_items where id = p_item_id;
    if not found then
        raise exception 'Ítem inexistente.';
    end if;
    v_wo := public._open_work_order(v_item.work_order_id);

    if v_item.kind = 'product' and v_item.product_id is not null then
        perform public._move_stock(
            v_item.product_id, v_item.quantity, 'work_order', 'Quitado de OT #' || v_wo.number,
            now(), null, null, v_wo.id
        );
    end if;

    delete from public.work_order_items where id = p_item_id;
end;
$$;

-- Total calculado de la orden: mano de obra + ítems.
create or replace function public.work_order_total(p_id uuid)
returns numeric
language sql
stable
as $$
    select coalesce(w.labor_amount, 0) + coalesce((
        select sum(i.quantity * i.unit_price)
        from public.work_order_items i
        where i.work_order_id = w.id
    ), 0)
    from public.work_orders w
    where w.id = p_id
$$;

-- Entrega y cobro. Genera los ingresos: mano de obra/servicios → Taller, repuestos → su categoría.
-- Si el precio final difiere del calculado, la diferencia (descuento o recargo) se imputa a
-- Taller; si el descuento supera lo de taller, el resto se descuenta de las demás categorías.
create or replace function public.deliver_work_order(
    p_id uuid,
    p_account_id uuid,
    p_final_price numeric default null,
    p_delivered_at timestamptz default null
)
returns void
language plpgsql
as $$
declare
    v_wo public.work_orders := public._open_work_order(p_id);
    v_at timestamptz := coalesce(p_delivered_at, now());
    v_taller uuid := public._tx_category('taller');
    v_total numeric := public.work_order_total(p_id);
    v_final numeric := round(coalesce(p_final_price, public.work_order_total(p_id)), 2);
    v_diff numeric;
    v_cut numeric;
    r record;
begin
    if p_account_id is null then
        raise exception 'Elegí la cuenta de cobro.';
    end if;
    if v_final < 0 then
        raise exception 'El precio final no puede ser negativo.';
    end if;

    create temp table if not exists _wo_alloc (category_id uuid primary key, amount numeric)
        on commit drop;
    delete from _wo_alloc;

    insert into _wo_alloc (category_id, amount)
    select income_category_id, sum(quantity * unit_price)
    from public.work_order_items
    where work_order_id = p_id
    group by income_category_id;

    insert into _wo_alloc (category_id, amount) values (v_taller, v_wo.labor_amount)
    on conflict (category_id) do update set amount = _wo_alloc.amount + excluded.amount;

    v_diff := v_final - v_total;
    if v_diff >= 0 then
        update _wo_alloc set amount = amount + v_diff where category_id = v_taller;
    else
        v_diff := -v_diff;
        for r in
            select category_id, amount from _wo_alloc
            order by (category_id = v_taller) desc, amount desc
        loop
            exit when v_diff <= 0;
            v_cut := least(r.amount, v_diff);
            update _wo_alloc set amount = amount - v_cut where category_id = r.category_id;
            v_diff := v_diff - v_cut;
        end loop;
    end if;

    insert into public.transactions (
        occurred_at, type, category_id, account_id, amount, description, customer_id,
        work_order_id
    )
    select v_at, 'income', category_id, p_account_id, amount, 'OT #' || v_wo.number,
        v_wo.customer_id, p_id
    from _wo_alloc
    where amount > 0;

    update public.work_orders
        set status = 'entregada',
            final_price = v_final,
            delivered_at = v_at,
            account_id = p_account_id,
            status_changed_at = v_at
        where id = p_id;
end;
$$;

-- Anula la orden (en cualquier estado, incluso entregada): devuelve repuestos al stock y anula
-- los ingresos. La orden queda como "cancelada" con su historial.
create or replace function public.cancel_work_order(p_id uuid, p_reason text default null)
returns void
language plpgsql
as $$
declare
    v_wo public.work_orders;
    r record;
begin
    select * into v_wo from public.work_orders where id = p_id for update;
    if not found then
        raise exception 'Orden inexistente.';
    end if;
    if v_wo.status = 'cancelada' then
        raise exception 'La orden ya está cancelada.';
    end if;

    for r in
        select product_id, sum(quantity)::integer as qty
        from public.work_order_items
        where work_order_id = p_id and kind = 'product' and product_id is not null
        group by product_id
    loop
        perform public._move_stock(
            r.product_id, r.qty, 'void', 'Anulación OT #' || v_wo.number, now(), null, null, p_id
        );
    end loop;

    update public.transactions set voided_at = now()
        where work_order_id = p_id and voided_at is null;

    update public.work_orders
        set status = 'cancelada',
            voided_at = now(),
            void_reason = nullif(trim(p_reason), ''),
            status_changed_at = now()
        where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Inventario
-- ---------------------------------------------------------------------------------------------

create or replace function public.adjust_stock(
    p_product_id uuid,
    p_new_stock integer,
    p_reason text
)
returns integer
language plpgsql
as $$
declare
    v_current integer;
begin
    if nullif(trim(p_reason), '') is null then
        raise exception 'Indicá el motivo del ajuste.';
    end if;
    select stock into v_current from public.products where id = p_product_id for update;
    if not found then
        raise exception 'Producto inexistente.';
    end if;
    return public._move_stock(p_product_id, p_new_stock - v_current, 'adjustment', trim(p_reason));
end;
$$;

-- +X % al costo (p_percent = 15 → +15 %) por proveedor y/o categoría. Los precios se recalculan
-- solos (salvo los manuales). Devuelve la cantidad de productos actualizados.
create or replace function public.bulk_update_costs(
    p_percent numeric,
    p_supplier_id uuid default null,
    p_category_id uuid default null
)
returns integer
language plpgsql
as $$
declare
    v_count integer;
begin
    if p_percent is null or p_percent <= -100 then
        raise exception 'Porcentaje inválido.';
    end if;
    update public.products
        set cost = round(cost * (1 + p_percent / 100), 2)
        where active
            and (p_supplier_id is null or supplier_id = p_supplier_id)
            and (p_category_id is null or category_id = p_category_id);
    get diagnostics v_count = row_count;
    return v_count;
end;
$$;

create or replace function public._guess_income_category(p_name text)
returns uuid
language sql
stable
as $$
    select public._tx_category(case
        when lower(p_name) like '%bici%' then 'bicicletas'
        when lower(p_name) ~ '(acces|indument|casco|luz|luces|candado|bolso|ropa)' then 'accesorios'
        else 'repuestos'
    end)
$$;

-- p_rows: [{ sku?, name, category?, supplier?, location?, cost?, margin?, manual_price?,
--            stock?, min_stock? }]
-- Busca por SKU (o por nombre si no hay SKU). p_mode: 'update' actualiza los existentes,
-- 'skip' los deja como están. Crea las categorías y proveedores que falten.
create or replace function public.import_products(p_rows jsonb, p_mode text default 'update')
returns jsonb
language plpgsql
as $$
declare
    r jsonb;
    v_name text;
    v_sku text;
    v_cat_name text;
    v_sup_name text;
    v_cat uuid;
    v_sup uuid;
    v_existing public.products;
    v_stock integer;
    v_created integer := 0;
    v_updated integer := 0;
    v_skipped integer := 0;
    v_cats integer := 0;
    v_sups integer := 0;
begin
    perform set_config('pedalea.initial_kind', 'import', true);

    for r in select * from jsonb_array_elements(p_rows)
    loop
        v_name := nullif(trim(r ->> 'name'), '');
        if v_name is null then
            v_skipped := v_skipped + 1;
            continue;
        end if;
        v_sku := nullif(trim(r ->> 'sku'), '');
        v_cat_name := nullif(trim(r ->> 'category'), '');
        v_sup_name := nullif(trim(r ->> 'supplier'), '');
        v_stock := round(nullif(r ->> 'stock', '')::numeric)::integer;

        v_cat := null;
        if v_cat_name is not null then
            select id into v_cat from public.categories where lower(name) = lower(v_cat_name);
            if v_cat is null then
                insert into public.categories (name, income_category_id)
                values (v_cat_name, public._guess_income_category(v_cat_name))
                returning id into v_cat;
                v_cats := v_cats + 1;
            end if;
        end if;

        v_sup := null;
        if v_sup_name is not null then
            select id into v_sup from public.suppliers where lower(name) = lower(v_sup_name);
            if v_sup is null then
                insert into public.suppliers (name) values (v_sup_name) returning id into v_sup;
                v_sups := v_sups + 1;
            end if;
        end if;

        v_existing := null;
        if v_sku is not null then
            select * into v_existing from public.products where sku = v_sku;
        else
            select * into v_existing from public.products
                where lower(name) = lower(v_name) order by created_at limit 1;
        end if;

        if v_existing.id is null then
            insert into public.products (
                sku, name, category_id, supplier_id, location, cost, margin, manual_price,
                stock, min_stock
            )
            values (
                v_sku, v_name, v_cat, v_sup, nullif(trim(r ->> 'location'), ''),
                coalesce(round(nullif(r ->> 'cost', '')::numeric, 2), 0),
                nullif(r ->> 'margin', '')::numeric,
                round(nullif(r ->> 'manual_price', '')::numeric, 2),
                coalesce(v_stock, 0),
                coalesce(round(nullif(r ->> 'min_stock', '')::numeric)::integer, 0)
            );
            v_created := v_created + 1;
        elsif p_mode = 'update' then
            update public.products set
                name = v_name,
                category_id = coalesce(v_cat, category_id),
                supplier_id = coalesce(v_sup, supplier_id),
                location = coalesce(nullif(trim(r ->> 'location'), ''), location),
                cost = coalesce(round(nullif(r ->> 'cost', '')::numeric, 2), cost),
                margin = case when r ? 'margin' then nullif(r ->> 'margin', '')::numeric else margin end,
                manual_price = case
                    when r ? 'manual_price' then round(nullif(r ->> 'manual_price', '')::numeric, 2)
                    else manual_price
                end,
                min_stock = coalesce(round(nullif(r ->> 'min_stock', '')::numeric)::integer, min_stock)
            where id = v_existing.id;

            if v_stock is not null and v_stock <> v_existing.stock then
                perform public._move_stock(
                    v_existing.id, v_stock - v_existing.stock, 'import', 'Importación de Excel'
                );
            end if;
            v_updated := v_updated + 1;
        else
            v_skipped := v_skipped + 1;
        end if;
    end loop;

    return jsonb_build_object(
        'created', v_created,
        'updated', v_updated,
        'skipped', v_skipped,
        'categories_created', v_cats,
        'suppliers_created', v_sups
    );
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Limpieza de datos de ejemplo: borra movimientos, catálogo, clientes y proveedores. Conserva
-- configuración, cuentas (con saldo inicial en 0), categorías y servicios.
-- ---------------------------------------------------------------------------------------------

create or replace function public.reset_business_data(p_confirm text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if coalesce(auth.role(), '') <> 'authenticated'
        and session_user not in ('postgres', 'supabase_admin') then
        raise exception 'No autorizado.' using errcode = '42501';
    end if;
    if p_confirm is distinct from 'BORRAR' then
        raise exception 'Confirmación inválida.';
    end if;

    truncate table
        public.transactions,
        public.stock_movements,
        public.sale_items,
        public.sales,
        public.purchase_items,
        public.purchases,
        public.work_order_items,
        public.work_orders,
        public.bikes,
        public.customers,
        public.products,
        public.suppliers
    restart identity;

    update public.accounts set initial_balance = 0;
end;
$$;
