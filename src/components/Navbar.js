"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const links = [
    { name: "Photos", href: "/" },
    { name: "Collections", href: "/collections" },
    { name: "Stories", href: "/stories" },
    { name: "Me", href: "/me" },
  ];
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-900 transition-all">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link
          href="/"
          className={`font-leckerli text-[25px] tracking-tighter text-black dark:text-white`}
        >
          Momented
        </Link>
        <div className="flex gap-5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
