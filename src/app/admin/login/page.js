"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);
    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center items-center font-sans p-6">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            required
            placeholder="Enter admin password"
            className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Login"}
          </button>
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
