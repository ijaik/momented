import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="grow mx-auto w-full max-w-360 px-5 py-16 sm:px-8 lg:px-12 md:py-20 xl:py-24 2xl:py-28">
        {children}
      </main>
      <Footer />
    </>
  );
}
