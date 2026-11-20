import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            "func-style": ["error", "declaration"],
            "@typescript-eslint/consistent-type-definitions": ["error", "type"],
            "no-restricted-syntax": [
                "error",
                { selector: "TSEnumDeclaration", message: "Usá uniones de literales, no enums." },
                {
                    selector: "ArrowFunctionExpression",
                    message: "Usá function en vez de arrow functions.",
                },
            ],
        },
    },
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
