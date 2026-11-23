import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./env";

const LOGIN = "/admin/login";

// Refresca la sesión de Supabase y protege /admin. Es un chequeo optimista: cada página y cada
// Server Action vuelve a validar el usuario (src/lib/admin/auth.ts).
export async function updateSession(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isLogin = pathname === LOGIN;

    if (!isSupabaseConfigured()) {
        // Sin credenciales, todo /admin muestra la pantalla de configuración (en el login).
        if (isLogin) return NextResponse.next();
        return NextResponse.redirect(new URL(LOGIN, request.url));
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                for (const { name, value } of cookiesToSet) {
                    request.cookies.set(name, value);
                }
                response = NextResponse.next({ request });
                for (const { name, value, options } of cookiesToSet) {
                    response.cookies.set(name, value, options);
                }
            },
        },
    });

    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    if (!user && !isLogin) {
        const url = new URL(LOGIN, request.url);
        if (pathname !== "/admin") {
            url.searchParams.set("next", pathname + request.nextUrl.search);
        }
        return NextResponse.redirect(url);
    }

    if (user && isLogin) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
}
