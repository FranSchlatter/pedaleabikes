"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/admin/actions/auth";
import { Button } from "@/components/admin/ui/button";
import { Field, Input } from "@/components/admin/ui/input";

export function LoginForm() {
    const next = useSearchParams().get("next") ?? "";
    const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <Field label="Email" htmlFor="email">
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    defaultValue={state.email}
                />
            </Field>
            <Field label="Contraseña" htmlFor="password">
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                />
            </Field>
            {state.error ? (
                <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
                    {state.error}
                </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? "Ingresando…" : "Ingresar"}
            </Button>
        </form>
    );
}
