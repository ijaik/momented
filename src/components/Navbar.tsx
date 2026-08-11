"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

const navItems = [
  { name: "Photos", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Stories", href: "/stories" },
  { name: "About", href: "/about" },
];
export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors">
      <nav
        className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between"
        aria-label="Main Navigation"
      >
        <Link
          href="/"
          className="text-2xl font-leckerli tracking-tight text-zinc-900 dark:text-white hover:opacity-80 transition-opacity"
        >
          {siteConfig?.name || "Momented"}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50 bg-zinc-200/60 dark:bg-zinc-800/60"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
