-- Datos base que el sistema necesita para funcionar (no son datos de ejemplo: la limpieza del
-- seed los conserva). Todo es editable desde Configuración.

insert into public.settings (id, business_name, address, phone, whatsapp, receipt_footer)
values (
    1,
    'Pedalea Bikes',
    'Mitre 4701, Santa Fe',
    '342 649-3800',
    '5493426493800',
    'Gracias por confiar en Pedalea Bikes. Las bicis no retiradas a los 30 días pueden generar cargo de guarda.'
)
on conflict (id) do nothing;

insert into public.transaction_categories (type, name, code, report_group, sort_order) values
    ('income', 'Taller', 'taller', 'revenue', 10),
    ('income', 'Venta de repuestos', 'repuestos', 'revenue', 20),
    ('income', 'Venta de accesorios', 'accesorios', 'revenue', 30),
    ('income', 'Venta de bicicletas', 'bicicletas', 'revenue', 40),
    ('income', 'Comisión por venta de bicicleta', 'comision', 'revenue', 50),
    ('income', 'Otros ingresos', 'otros', 'revenue', 60),
    ('expense', 'Mercadería', 'mercaderia', 'merchandise', 10),
    ('expense', 'Personal', 'personal', 'operating', 20),
    ('expense', 'Alquiler', 'alquiler', 'operating', 30),
    ('expense', 'Servicios', 'servicios', 'operating', 40),
    ('expense', 'Herramientas', 'herramientas', 'operating', 50),
    ('expense', 'Insumos', 'insumos', 'operating', 60),
    ('expense', 'Equipamiento/mobiliario', 'equipamiento', 'operating', 70),
    ('expense', 'Marketing/publicidad', 'marketing', 'operating', 80),
    ('expense', 'Impuestos', 'impuestos', 'operating', 90),
    ('expense', 'Vehículo', 'vehiculo', 'operating', 100),
    ('expense', 'Gastos personales/retiros', 'retiros', 'withdrawal', 110),
    ('expense', 'Gastos financieros', 'financieros', 'operating', 120),
    ('expense', 'Otros', 'otros_egresos', 'operating', 130)
on conflict (code) do nothing;

insert into public.categories (name, income_category_id, sort_order)
select v.name, public._tx_category(v.code), v.sort_order
from (values
    ('Repuestos', 'repuestos', 10),
    ('Accesorios', 'accesorios', 20),
    ('Bicicletas', 'bicicletas', 30)
) as v (name, code, sort_order)
on conflict (name) do nothing;

insert into public.accounts (name, kind, sort_order) values
    ('Efectivo', 'cash', 10),
    ('Banco', 'bank', 20),
    ('Mercado Pago', 'wallet', 30),
    ('Posnet/Payway', 'card', 40)
on conflict (name) do nothing;

-- Servicios de la landing (src/data/services.ts). "Reparaciones puntuales" no tiene precio fijo:
-- queda en 0 para cargar el monto en cada orden.
insert into public.services (name, description, price, sort_order) values
    ('Service Base', 'Puesta a punto general, revisión completa.', 45000, 10),
    ('Service Intermedio', 'Limpieza al detalle, mantenimiento completo de rodamientos.', 60000, 20),
    ('Service Full', 'Desarme integral, mantenimiento a cada componente por separado.', 80000, 30),
    ('Reparaciones puntuales', 'Monto a definir según el trabajo.', 0, 40)
on conflict (name) do nothing;
