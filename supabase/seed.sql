-- Datos de EJEMPLO: ~3 meses de actividad para que el panel se vea vivo en la demo.
-- Se generan con las mismas funciones que usa la app (create_sale, create_purchase, ...), así que
-- stock, caja y reportes cierran entre sí. Para borrarlos: Configuración → "Borrar datos de
-- ejemplo" (o `select reset_business_data('BORRAR');`).
-- Nombres, teléfonos y proveedores son ficticios.

select setseed(0.42);

update public.accounts set initial_balance = case name
    when 'Efectivo' then 180000
    when 'Banco' then 950000
    when 'Mercado Pago' then 240000
    else 0
end;

insert into public.suppliers (name, contact_name, phone, terms, notes) values
    ('Distribuidora Litoral Bike', 'Martín', '341 555-0101', 'Cuenta corriente 30 días', 'Repuestos Shimano y transmisión. Pedido mínimo $150.000.'),
    ('Rodados del Sur', 'Carla', '11 5555-0102', 'Contado con 5 % de descuento', 'Cubiertas y cámaras (Kenda, Maxxis).'),
    ('Ciclo Mayorista Rosario', 'Diego', '341 555-0103', 'Transferencia anticipada', 'Accesorios: luces, cascos, candados.'),
    ('Bicicletas Venzo (distribuidor)', 'Laura', '11 5555-0104', 'Consignación parcial', 'Bicis Venzo y cuadros.'),
    ('Insumos Pedal SRL', 'Pablo', '342 555-0105', 'Contado', 'Lubricantes, grasas y limpieza.'),
    ('Raleigh Argentina (dist.)', 'Sofía', '11 5555-0106', '30 días', 'Bicis urbanas y paseo.');

insert into public.products (sku, name, category_id, supplier_id, location, cost, margin, stock, min_stock)
select v.sku, v.name, c.id, s.id, v.location, v.cost, v.margin, v.stock, v.min_stock
from (values
    -- Repuestos
    ('CAM-29', 'Cámara 29x2.10 válvula presta', 'Repuestos', 'Rodados del Sur', 'Estante A1', 5200, null, 24, 10),
    ('CAM-26', 'Cámara 26x1.95 válvula auto', 'Repuestos', 'Rodados del Sur', 'Estante A1', 4300, null, 18, 8),
    ('CAM-700', 'Cámara 700x25 válvula presta', 'Repuestos', 'Rodados del Sur', 'Estante A1', 5600, null, 12, 6),
    ('CAM-20', 'Cámara 20x1.75', 'Repuestos', 'Rodados del Sur', 'Estante A1', 3900, null, 8, 4),
    ('CUB-29K', 'Cubierta Kenda 29x2.20 Nevegal', 'Repuestos', 'Rodados del Sur', 'Pared cubiertas', 24500, null, 10, 4),
    ('CUB-29M', 'Cubierta Maxxis Ardent 29x2.25', 'Repuestos', 'Rodados del Sur', 'Pared cubiertas', 41000, null, 6, 2),
    ('CUB-26K', 'Cubierta Kenda 26x1.95', 'Repuestos', 'Rodados del Sur', 'Pared cubiertas', 17800, null, 8, 4),
    ('CUB-700', 'Cubierta ruta 700x25 plegable', 'Repuestos', 'Rodados del Sur', 'Pared cubiertas', 29500, null, 4, 2),
    ('CAD-8V', 'Cadena Shimano HG40 8v', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B2', 11200, null, 12, 5),
    ('CAD-10V', 'Cadena Shimano HG54 10v', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B2', 19800, null, 6, 3),
    ('CAD-12V', 'Cadena Shimano Deore M6100 12v', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B2', 32500, null, 4, 2),
    ('PIN-8V', 'Piñón Shimano 8v 11-32', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B3', 18900, null, 5, 2),
    ('PIN-10V', 'Piñón Shimano Deore 10v 11-42', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B3', 48500, null, 3, 1),
    ('PAS-M', 'Pastillas de freno disco resina (par)', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B1', 6500, null, 20, 8),
    ('PAS-V', 'Zapatas V-brake (par)', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B1', 3200, null, 16, 6),
    ('CAB-CAM', 'Cable de cambio acero inox', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón C1', 1900, null, 40, 15),
    ('CAB-FRE', 'Cable de freno', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón C1', 1700, null, 35, 15),
    ('FUN-CAM', 'Funda de cambio (metro)', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón C1', 1500, null, 30, 10),
    ('DES-TOU', 'Descarrilador trasero Shimano Tourney', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B4', 14800, null, 4, 2),
    ('DES-ALT', 'Descarrilador trasero Shimano Altus 9v', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B4', 29900, null, 3, 1),
    ('MAN-ALT', 'Manija de cambio Shimano Altus 9v', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B4', 21500, null, 3, 1),
    ('CAJ-PED', 'Caja pedalera sellada 68 mm', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón B5', 12900, null, 5, 2),
    ('PED-PLA', 'Pedales plataforma aluminio', 'Repuestos', 'Ciclo Mayorista Rosario', 'Estante A3', 13500, null, 6, 2),
    ('PUN-MTB', 'Puños MTB lock-on', 'Repuestos', 'Ciclo Mayorista Rosario', 'Estante A3', 7800, null, 8, 3),
    ('ASI-CON', 'Asiento confort con resortes', 'Repuestos', 'Ciclo Mayorista Rosario', 'Estante A4', 15900, null, 4, 2),
    ('RAY-14', 'Rayo inox 14G (unidad)', 'Repuestos', 'Distribuidora Litoral Bike', 'Cajón C2', 450, null, 120, 40),
    ('GRA-SHI', 'Grasa Shimano Premium 100 g', 'Repuestos', 'Insumos Pedal SRL', 'Taller', 13900, null, 3, 1),
    -- Accesorios
    ('LUZ-USB', 'Luz delantera USB 400 lm', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 14500, null, 8, 3),
    ('LUZ-TRA', 'Luz trasera USB', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 7900, null, 10, 4),
    ('CAS-MTB', 'Casco MTB regulable', 'Accesorios', 'Ciclo Mayorista Rosario', 'Pared cascos', 32000, null, 5, 2),
    ('CAS-URB', 'Casco urbano', 'Accesorios', 'Ciclo Mayorista Rosario', 'Pared cascos', 26500, null, 4, 2),
    ('CAN-USP', 'Candado U con soporte', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 21000, null, 5, 2),
    ('CAN-CAB', 'Candado de cable con llave', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 8200, null, 9, 3),
    ('INF-PIE', 'Inflador de pie con manómetro', 'Accesorios', 'Ciclo Mayorista Rosario', 'Estante A5', 23500, null, 3, 1),
    ('INF-MAN', 'Inflador de mano', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 9800, null, 6, 2),
    ('CAR-ALU', 'Portacaramañola aluminio', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 3900, null, 12, 4),
    ('CAR-750', 'Caramañola 750 ml', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 4500, null, 14, 5),
    ('GUA-LAR', 'Guantes dedo largo', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 12500, null, 6, 2),
    ('LUB-CER', 'Lubricante de cadena a base de cera 120 ml', 'Accesorios', 'Insumos Pedal SRL', 'Mostrador', 8900, null, 10, 4),
    ('LIM-DES', 'Desengrasante biodegradable 500 ml', 'Accesorios', 'Insumos Pedal SRL', 'Mostrador', 7600, null, 6, 3),
    ('KIT-PAR', 'Kit de parches + desarmadores', 'Accesorios', 'Insumos Pedal SRL', 'Mostrador', 3500, null, 15, 5),
    ('POR-CEL', 'Soporte de celular para manubrio', 'Accesorios', 'Ciclo Mayorista Rosario', 'Mostrador', 9500, null, 5, 2),
    -- Bicicletas (margen propio, más bajo que el default)
    ('BIC-VEN-29', 'Bici MTB Venzo Raptor R29 21v', 'Bicicletas', 'Bicicletas Venzo (distribuidor)', 'Salón', 420000, 0.35, 3, 1),
    ('BIC-VEN-PRI', 'Bici MTB Venzo Primal R29 hidráulica', 'Bicicletas', 'Bicicletas Venzo (distribuidor)', 'Salón', 610000, 0.35, 2, 1),
    ('BIC-RAL-URB', 'Bici urbana Raleigh Urban 2.0', 'Bicicletas', 'Raleigh Argentina (dist.)', 'Salón', 385000, 0.35, 2, 1),
    ('BIC-INF-16', 'Bici infantil R16 con rueditas', 'Bicicletas', 'Raleigh Argentina (dist.)', 'Salón', 165000, 0.40, 3, 1)
) as v (sku, name, category, supplier, location, cost, margin, stock, min_stock)
join public.categories c on c.name = v.category
join public.suppliers s on s.name = v.supplier;

-- Clientes y bicis.
insert into public.customers (name, phone, notes)
select n, '342 ' || (4000000 + (random() * 999999)::int)::text, null
from unnest(array[
    'Juan Pérez', 'María González', 'Lucas Fernández', 'Sofía Rodríguez', 'Matías López',
    'Valentina Martínez', 'Nicolás Gómez', 'Camila Díaz', 'Tomás Sánchez', 'Agustina Romero',
    'Facundo Álvarez', 'Julieta Torres', 'Santiago Ruiz', 'Florencia Ramírez', 'Joaquín Flores',
    'Micaela Acosta', 'Franco Benítez', 'Rocío Medina', 'Ignacio Herrera', 'Lucía Suárez',
    'Gonzalo Aguirre', 'Paula Giménez', 'Emiliano Molina', 'Carolina Castro', 'Bruno Ortiz',
    'Antonella Silva', 'Martín Núñez', 'Belén Rojas', 'Federico Luna', 'Daniela Sosa',
    'Ezequiel Vega', 'Milagros Cabrera', 'Leandro Ríos', 'Victoria Peralta', 'Damián Moreno'
]) as n;

insert into public.bikes (customer_id, brand, model, wheel_size, bike_type, color)
select c.id,
    (array['Venzo', 'Raleigh', 'Trek', 'Specialized', 'Topmega', 'Vairo', 'SLP', 'Olmo'])[1 + floor(random() * 8)::int],
    (array['Raptor', 'Mojave', 'Marlin 5', 'Rockhopper', 'Sunshine', 'XR 3.0', '25 Pro', 'Flash'])[1 + floor(random() * 8)::int],
    (array['29', '29', '26', '27.5', '700c', '20'])[1 + floor(random() * 6)::int],
    (array['MTB', 'MTB', 'Urbana', 'Ruta', 'Paseo', 'Infantil'])[1 + floor(random() * 6)::int],
    (array['Negra', 'Blanca', 'Roja', 'Azul', 'Gris', 'Verde'])[1 + floor(random() * 6)::int]
from public.customers c;

-- Fecha de alta del catálogo y del stock inicial: antes del período de ejemplo.
update public.products set created_at = now() - interval '100 days';
update public.stock_movements set occurred_at = now() - interval '100 days' where kind = 'initial';

-- ---------------------------------------------------------------------------------------------
-- Actividad diaria (lunes a viernes) de los últimos ~92 días.
-- ---------------------------------------------------------------------------------------------

do $$
declare
    tz constant text := 'America/Argentina/Buenos_Aires';
    v_today date := public.ar_date(now());
    v_day date;
    v_at timestamptz;
    v_items jsonb;
    v_n integer;
    v_i integer;
    v_prod record;
    v_cust uuid;
    v_bike uuid;
    v_acc uuid;
    v_wo jsonb;
    v_wo_id uuid;
    v_age integer;
    v_problem text;
    v_service record;
    a_efectivo uuid := (select id from public.accounts where name = 'Efectivo');
    a_banco uuid := (select id from public.accounts where name = 'Banco');
    a_mp uuid := (select id from public.accounts where name = 'Mercado Pago');
    a_posnet uuid := (select id from public.accounts where name = 'Posnet/Payway');
    r record;
begin
    for v_day in select d::date from generate_series(v_today - 92, v_today, interval '1 day') d
    loop
        continue when extract(isodow from v_day) > 5;

        -- Compras de reposición: lunes, a cada proveedor con productos bajo mínimo.
        if extract(isodow from v_day) = 1 then
            for r in
                select s.id as supplier_id, jsonb_agg(jsonb_build_object(
                    'product_id', p.id,
                    'quantity', greatest(p.min_stock * 2 - p.stock, 1),
                    -- Lista nueva de vez en cuando: +0 a +6 %.
                    'unit_cost', round(p.cost * (1 + (case when random() < 0.3 then random() * 0.06 else 0 end))::numeric, -1)
                )) as items
                from public.products p
                join public.suppliers s on s.id = p.supplier_id
                where p.stock <= p.min_stock
                group by s.id
            loop
                v_at := (v_day + time '09:30') at time zone tz;
                perform public.create_purchase(jsonb_build_object(
                    'occurred_at', v_at,
                    'supplier_id', r.supplier_id,
                    'account_id', a_banco,
                    'invoice_ref', 'FC A-0003-' || lpad((1000 + floor(random() * 8999))::text, 8, '0'),
                    'items', r.items
                ));
            end loop;
        end if;

        -- Ventas de mostrador: 2 a 6 por día.
        v_n := 2 + floor(random() * 5)::int;
        for v_i in 1..v_n
        loop
            v_at := (v_day + time '09:05' + (random() * interval '9 hours')) at time zone tz;
            continue when v_at > now();
            v_items := '[]'::jsonb;

            for v_prod in
                select p.id, p.price, c.name as category
                from public.products p
                join public.categories c on c.id = p.category_id
                where p.stock > 2 and c.name <> 'Bicicletas'
                order by random()
                limit 1 + floor(random() * 2.5)::int
            loop
                v_items := v_items || jsonb_build_array(jsonb_build_object(
                    'kind', 'product',
                    'product_id', v_prod.id,
                    'quantity', case when random() < 0.15 then 2 else 1 end,
                    'unit_price', v_prod.price
                ));
            end loop;

            -- Alguna venta incluye un service de mostrador (parche, ajuste, ...).
            if random() < 0.12 then
                v_items := v_items || jsonb_build_array(jsonb_build_object(
                    'kind', 'free', 'description', 'Parche y cambio de cámara',
                    'quantity', 1, 'unit_price', 7000,
                    'income_category_id', public._tx_category('taller')
                ));
            end if;

            v_acc := case
                when random() < 0.35 then a_efectivo
                when random() < 0.55 then a_mp
                when random() < 0.6 then a_posnet
                else a_banco
            end;

            perform public.create_sale(jsonb_build_object(
                'occurred_at', v_at,
                'account_id', v_acc,
                'customer_id', case when random() < 0.25
                    then (select id from public.customers order by random() limit 1) end,
                'items', v_items
            ));
        end loop;

        -- Venta de bici: ~1 por semana. Comisión por bici de terceros: ~2 por mes.
        if random() < 0.2 then
            select p.id, p.price into v_prod
                from public.products p join public.categories c on c.id = p.category_id
                where c.name = 'Bicicletas' and p.stock > 0
                order by random() limit 1;
            if found then
                v_at := (v_day + time '17:00') at time zone tz;
                if v_at <= now() then
                    perform public.create_sale(jsonb_build_object(
                        'occurred_at', v_at,
                        'account_id', case when random() < 0.5 then a_banco else a_posnet end,
                        'customer_id', (select id from public.customers order by random() limit 1),
                        'items', jsonb_build_array(jsonb_build_object(
                            'kind', 'product', 'product_id', v_prod.id, 'quantity', 1,
                            'unit_price', v_prod.price
                        ))
                    ));
                end if;
            end if;
        end if;
        if random() < 0.1 then
            v_at := (v_day + time '12:00') at time zone tz;
            if v_at <= now() then
                perform public.create_sale(jsonb_build_object(
                    'occurred_at', v_at,
                    'account_id', a_banco,
                    'items', jsonb_build_array(jsonb_build_object(
                        'kind', 'commission',
                        'description', 'Comisión venta bici usada (consignación)',
                        'unit_price', 40000 + round((random() * 40000)::numeric, -3)
                    ))
                ));
            end if;
        end if;

        -- Órdenes de trabajo: 1 a 3 por día.
        v_n := 1 + floor(random() * 3)::int;
        for v_i in 1..v_n
        loop
            v_at := (v_day + time '09:15' + (random() * interval '5 hours')) at time zone tz;
            continue when v_at > now();
            select b.customer_id, b.id into v_cust, v_bike
                from public.bikes b order by random() limit 1;
            v_problem := (array[
                'Service general, hace ruido la transmisión',
                'Pinchadura trasera',
                'No pasan bien los cambios',
                'Frenos largos, ajustar',
                'Rueda delantera descentrada',
                'Service completo antes de viaje',
                'Cambiar cubiertas',
                'Cadena gastada, salta'
            ])[1 + floor(random() * 8)::int];

            v_wo := public.create_work_order(jsonb_build_object(
                'customer_id', v_cust,
                'bike_id', v_bike,
                'received_at', v_at,
                'problem', v_problem
            ));
            v_wo_id := (v_wo ->> 'id')::uuid;

            -- Servicio principal.
            select id, price into v_service
                from public.services
                where price > 0
                order by random() limit 1;
            if random() < 0.6 then
                perform public.add_work_order_item(v_wo_id, jsonb_build_object(
                    'kind', 'service', 'service_id', v_service.id, 'quantity', 1
                ));
            else
                update public.work_orders
                    set labor_amount = (array[8000, 12000, 15000, 20000])[1 + floor(random() * 4)::int]
                    where id = v_wo_id;
            end if;

            -- Repuestos usados (0 a 2).
            for v_prod in
                select p.id from public.products p
                join public.categories c on c.id = p.category_id
                where c.name = 'Repuestos' and p.stock > 1
                order by random()
                limit floor(random() * 3)::int
            loop
                perform public.add_work_order_item(v_wo_id, jsonb_build_object(
                    'kind', 'product', 'product_id', v_prod.id, 'quantity', 1
                ));
            end loop;

            update public.work_orders
                set budget_amount = public.work_order_total(v_wo_id),
                    diagnosis = 'Revisada en taller.'
                where id = v_wo_id;

            -- Las órdenes de más de 3 días ya se entregaron (salvo alguna cancelada); las más
            -- nuevas quedan abiertas en distintos estados.
            v_age := v_today - v_day;
            if v_age > 5 then
                if random() < 0.04 then
                    perform public.cancel_work_order(v_wo_id, 'El cliente no aprobó el presupuesto');
                else
                    perform public.deliver_work_order(
                        v_wo_id,
                        case when random() < 0.45 then a_efectivo
                            when random() < 0.6 then a_mp else a_banco end,
                        null,
                        case
                            -- Algunas se retiran hoy, para que el panel "Hoy" tenga entregas.
                            when v_age <= 9 and random() < 0.35
                                then now() - interval '15 minutes' - random() * interval '3 hours'
                            else v_at + (1 + floor(random() * 3)::int) * interval '1 day' + interval '3 hours'
                        end
                    );
                    update public.work_orders set work_done = 'Se realizó: ' || lower(v_problem) || '.'
                        where id = v_wo_id;
                end if;
            else
                perform public.set_work_order_status(v_wo_id,
                    (array['recibida', 'presupuestada', 'en_reparacion', 'lista'])[1 + floor(random() * 4)::int]);
            end if;
        end loop;

        -- Gastos fijos del mes.
        if extract(day from v_day) between 1 and 3 and not exists (
            select 1 from public.transactions t
            where t.category_id = public._tx_category('alquiler')
                and date_trunc('month', public.ar_date(t.occurred_at)) = date_trunc('month', v_day)
        ) then
            v_at := (v_day + time '10:00') at time zone tz;
            insert into public.transactions (occurred_at, type, category_id, account_id, amount, description) values
                (v_at, 'expense', public._tx_category('alquiler'), a_banco, 650000, 'Alquiler del local'),
                (v_at, 'expense', public._tx_category('servicios'), a_banco, 68000, 'Luz (EPE) e internet'),
                (v_at, 'expense', public._tx_category('impuestos'), a_banco, 95000, 'Monotributo + IIBB'),
                (v_at, 'expense', public._tx_category('marketing'), a_mp, 35000, 'Publicidad en Instagram');
        end if;

        if extract(day from v_day) >= 28 and not exists (
            select 1 from public.transactions t
            where t.category_id = public._tx_category('personal')
                and date_trunc('month', public.ar_date(t.occurred_at)) = date_trunc('month', v_day)
        ) then
            v_at := (v_day + time '18:00') at time zone tz;
            if v_at <= now() then
                insert into public.transactions (occurred_at, type, category_id, account_id, amount, description)
                values (v_at, 'expense', public._tx_category('personal'), a_banco, 900000, 'Sueldo mecánico');
            end if;
        end if;

        -- Viernes: retiro del dueño, insumos del taller y pase de Posnet / MP al banco.
        if extract(isodow from v_day) = 5 then
            v_at := (v_day + time '18:30') at time zone tz;
            if v_at <= now() then
                insert into public.transactions (occurred_at, type, category_id, account_id, amount, description) values
                    (v_at, 'expense', public._tx_category('retiros'), a_efectivo, 120000, 'Retiro semanal'),
                    (v_at, 'expense', public._tx_category('insumos'), a_efectivo, 8000 + round((random() * 12000)::numeric, -2), 'Trapos, guantes, limpieza');

                insert into public.transactions (occurred_at, type, account_id, to_account_id, amount, description)
                select v_at, 'transfer', a_posnet, a_banco, b.bal, 'Acreditación Posnet'
                from (
                    select initial_balance + income - expense + transfer_in - transfer_out as bal
                    from public.v_account_balances where id = a_posnet
                ) b where b.bal > 0;

                -- Mercado Pago y efectivo: se deja un colchón y el resto pasa al banco.
                insert into public.transactions (occurred_at, type, account_id, to_account_id, amount, description)
                select v_at, 'transfer', b.id, a_banco, b.bal - b.keep, b.descr
                from (
                    select id, initial_balance + income - expense + transfer_in - transfer_out as bal,
                        case when id = a_mp then 250000 else 300000 end as keep,
                        case when id = a_mp then 'Retiro de Mercado Pago a banco' else 'Depósito de efectivo' end as descr
                    from public.v_account_balances where id in (a_mp, a_efectivo)
                ) b where b.bal - b.keep > 0;
            end if;
        end if;
    end loop;

    -- Herramienta comprada a mitad de período (gasto, no mercadería).
    insert into public.transactions (occurred_at, type, category_id, account_id, amount, description)
    values ((v_today - 40 + time '11:00') at time zone tz, 'expense', public._tx_category('herramientas'),
        a_mp, 85000, 'Llave de torque');

    -- Los repuestos de las órdenes se registraron con la hora actual: se fechan al día de ingreso.
    update public.stock_movements m
        set occurred_at = w.received_at + interval '2 hours'
        from public.work_orders w
        where m.work_order_id = w.id and m.kind = 'work_order';
    update public.work_order_items i
        set created_at = w.received_at + interval '2 hours'
        from public.work_orders w
        where i.work_order_id = w.id;
    update public.stock_movements m
        set occurred_at = w.voided_at
        from public.work_orders w
        where m.work_order_id = w.id and m.kind = 'void';
end;
$$;

-- Fechas de estado/cancelación coherentes para las órdenes de ejemplo.
update public.work_orders
    set voided_at = received_at + interval '1 day', status_changed_at = received_at + interval '1 day'
    where status = 'cancelada';
update public.work_orders
    set status_changed_at = received_at + interval '4 hours'
    where status in ('recibida', 'presupuestada', 'en_reparacion', 'lista');
update public.stock_movements m
    set occurred_at = w.voided_at
    from public.work_orders w
    where m.work_order_id = w.id and m.kind = 'void';
