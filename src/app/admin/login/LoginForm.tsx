"use client";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import {
  FieldLabel,
  FormInput,
  SubmitButton,
} from "@/app/admin/_components/AdminForms";
import BrandLogo from "@/components/ui/BrandLogo";
export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {});
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line/70 bg-surface/85 p-8 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="flex flex-col items-center gap-2.5">
          <BrandLogo />
          <h1 className="text-center font-serif text-2xl tracking-tight text-ink">
            Sign In
          </h1>
          <p className="text-center text-xs text-muted">
            Enter password to continue.
          </p>
        </div>
        <form action={formAction} className="mt-8 flex flex-col gap-5">
          <input
            type="text"
            name="username"
            value="admin"
            autoComplete="username"
            readOnly
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div>
            <FieldLabel htmlFor="admin-password">Password</FieldLabel>
            <FormInput
              id="admin-password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <SubmitButton
            isLoading={isPending}
            loadingText="Verifying…"
            text="Log in"
            size="md"
          />
        </form>
        {state.error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-center text-xs text-danger"
          >
            {state.error}
          </p>
        )}
      </div>
    </main>
  );
}
