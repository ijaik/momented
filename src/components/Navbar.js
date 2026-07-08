"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
          className="font-leckerli text-[25px] tracking-tighter text-black dark:text-white relative z-50"
          onClick={() => setIsOpen(false)}
        >
          Momented
        </Link>
        <div className="hidden md:flex gap-5">
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
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center gap-1.5 z-50 p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-black dark:bg-white transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-black dark:bg-white transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-black dark:bg-white transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>
      <div
        className={`md:hidden absolute top-0 left-0 w-full h-screen bg-white dark:bg-black flex flex-col items-center justify-center gap-8 transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-2xl font-bold transition-colors ${
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
    </nav>
  );
}
