"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
interface NavLink {
  name: string;
  href: string;
}
const links: NavLink[] = [
  { name: "Photographs", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Stories", href: "/stories" },
  { name: "About", href: "/about" },
];
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className="font-script text-[22px] leading-none tracking-tight text-ink transition-opacity hover:opacity-75"
        >
          Momented
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const isActive = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative text-sm transition-colors ${
                  isActive
                    ? "font-medium text-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                {link.name}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-px w-full translate-y-full bg-ink"
                  />
                )}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-soft md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </nav>
      {isOpen && (
        <div
          id="mobile-menu"
          className="border-t border-line bg-paper md:hidden"
        >
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-8"
          >
            {links.map((link) => {
              const isActive = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`border-b border-line/70 py-3.5 text-[15px] transition-colors last:border-b-0 ${
                    isActive
                      ? "font-medium text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}