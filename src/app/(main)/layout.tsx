import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="grow mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-20 xl:max-w-7xl xl:py-24 2xl:max-w-360 2xl:py-28">
        {children}
      </main>
      <Footer />
    </>
  );
}
