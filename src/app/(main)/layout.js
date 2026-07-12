import Navbar from "@/components/Navbar";
export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <footer className="py-10 text-center text-sm text-zinc-500 border-t border-zinc-200 dark:border-zinc-900 mt-20">
        <span className="font-leckerli tracking-tight">Momented</span> with 🤍
        by Jai.
      </footer>
    </>
  );
}
