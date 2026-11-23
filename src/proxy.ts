import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
    return updateSession(request);
}

// Solo el sistema de gestión: la landing no pasa por acá.
export const config = {
    matcher: ["/admin", "/admin/:path*"],
};
