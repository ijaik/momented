import { type ReactNode, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense
        fallback={
          <div className="fixed inset-x-0 top-0 z-50 h-16 border-b border-line bg-paper" />
        }
      >
        <Navbar />
      </Suspense>
      <main className="grow mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-20 xl:max-w-7xl xl:py-24 2xl:max-w-360 2xl:py-28">
        {children}
      </main>
      <footer className="border-t border-line py-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-5 sm:px-8 xl:max-w-7xl 2xl:max-w-360">
          <p className="text-sm text-muted">
            <span className="font-script text-base tracking-tight text-ink">
              Momented
            </span>{" "}
            with ♥︎ by Jai.
          </p>
        </div>
      </footer>
    </>
  );
}
