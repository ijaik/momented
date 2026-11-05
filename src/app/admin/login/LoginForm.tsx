"use client";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { FormInput, SubmitButton } from "@/app/admin/_components/AdminForms";
export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {});
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line/70 bg-surface/80 p-8 shadow-xs backdrop-blur-md">
        <div className="flex flex-col items-center">
          <span className="font-serif text-3xl font-medium tracking-tight text-ink">
            Momented
          </span>
          <span className="mt-1 rounded-full border border-line bg-soft/80 px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider text-muted">
            Studio
          </span>
        </div>
        <h1 className="mt-6 text-center font-serif text-2xl font-medium tracking-tight text-ink">
          Sign In
        </h1>
        <p className="mt-1.5 text-center text-xs text-muted">
          Enter your studio passkey to continue.
        </p>
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
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Password
            </label>
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
            className="mt-4 rounded-xl border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-center text-sm font-medium text-danger"
          >
            {state.error}
          </p>
        )}
      </div>
    </main>
  );
}
