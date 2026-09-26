"use client";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { FormInput, SubmitButton } from "@/app/admin/_components/AdminForms";

interface LoginState {
  success: boolean;
  error?: string;
}
export default function LoginForm() {
  const router = useRouter();
  async function handleLogin(
    _prevState: LoginState,
    formData: FormData,
  ): Promise<LoginState> {
    const result = await loginAction(formData);
    if (result.success) router.push("/admin");
    return result;
  }
  const [state, formAction, isPending] = useActionState(handleLogin, {
    success: false,
  });
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center font-script text-3xl tracking-tight text-ink">
          Momented
        </p>
        <h1 className="mt-6 text-center font-serif text-3xl font-medium tracking-tight text-ink">
          Content studio
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Enter the admin password to continue.
        </p>
        <form action={formAction} className="mt-8 flex flex-col gap-5">
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
          />
        </form>
        {state.error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-danger-soft px-3 py-2.5 text-center text-sm font-medium text-danger"
          >
            {state.error}
          </p>
        )}
      </div>
    </main>
  );
}
