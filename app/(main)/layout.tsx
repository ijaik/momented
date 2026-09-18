import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense fallback={<div className="fixed inset-x-0 top-0 z-50 h-16 border-b border-line bg-paper/85 backdrop-blur-md" />}>
        <Navbar />
      </Suspense>
      <div className="grow pt-16">{children}</div>
      <footer className="border-t border-line py-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-5 sm:px-8">
          <p className="text-sm text-muted">
            <span className="font-script text-base tracking-tight text-ink">
              Momented
            </span>{" "}
            with ♥︎ by Jai.
          </p>
        </div>
      </footer>
    </div>
  );
}