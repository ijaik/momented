"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { FormInput, SubmitButton } from "@/components/ui/AdminForms";
export default function LoginPage() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  async function handleSubmit(event: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);
    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "An unexpected error occurred.");
      setIsLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center items-center font-sans p-6">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormInput
            type="password"
            name="password"
            required
            placeholder="Enter admin password"
          />
          <SubmitButton
            isLoading={isLoading}
            loadingText="Verifying..."
            text="Login"
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
          />
        </form>
        {error && (
          <p className="mt-4 text-red-500 text-sm text-center font-medium">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
