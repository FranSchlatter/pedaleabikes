import { existsSync } from "node:fs";
import path from "node:path";

// Se evalúa en build (la home es estática): si el mp4 todavía no se subió, la UI muestra el poster
// en vez de pedir un archivo que da 404. Al subir el video y redeployar, aparece solo.
export function publicFileExists(src: string) {
    return existsSync(path.join(process.cwd(), "public", src));
}
