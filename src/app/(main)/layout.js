import Navbar from "@/components/Navbar";
export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <div className="grow pt-24">{children}</div>
      <footer className="shrink-0 py-10 text-center text-sm text-zinc-500 border-t border-zinc-200 dark:border-zinc-900 mt-20">
        <span className="font-leckerli tracking-tight">Momented</span> with 🩶
        by Jai.
      </footer>
    </div>
  );
}
