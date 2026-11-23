// Crea (o actualiza la contraseña de) el usuario del sistema de gestión en Supabase Auth.
// Uso: npm run admin:user -- email@dominio.com "contraseña-segura"
// Necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY) en
// .env.local. La clave secreta es solo para este script: nunca va al navegador ni a Vercel.
const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password) {
    console.error('Uso: npm run admin:user -- email@dominio.com "contraseña"');
    process.exit(1);
}
if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY en .env.local");
    process.exit(1);
}
if (password.length < 8) {
    console.error("Usá una contraseña de al menos 8 caracteres.");
    process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const created = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
});

if (created.ok) {
    console.log(`Usuario creado: ${email}`);
    process.exit(0);
}

const body = await created.json().catch(function () {
    return {};
});
if (created.status !== 422 && body.error_code !== "email_exists") {
    console.error("No se pudo crear el usuario:", body.msg ?? body.message ?? created.statusText);
    process.exit(1);
}

// Ya existe: actualiza la contraseña.
const list = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers }).then(
    function (r) {
        return r.json();
    },
);
const user = (list.users ?? []).find(function (u) {
    return u.email?.toLowerCase() === email.toLowerCase();
});
if (!user) {
    console.error("El usuario existe pero no se encontró para actualizarlo.");
    process.exit(1);
}
const updated = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ password }),
});
console.log(
    updated.ok ? `Contraseña actualizada: ${email}` : "No se pudo actualizar la contraseña.",
);
process.exit(updated.ok ? 0 : 1);
