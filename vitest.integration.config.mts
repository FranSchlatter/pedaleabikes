import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Tests contra Supabase (npm run test:db). Lee las claves de .env.local.
export default defineConfig({
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
        include: ["tests/integration/**/*.test.ts"],
        environment: "node",
        env: loadEnv("", process.cwd(), ""),
        testTimeout: 20000,
        hookTimeout: 30000,
        fileParallelism: false,
    },
});
