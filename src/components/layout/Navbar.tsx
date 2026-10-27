"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { name: "Photographs", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Series", href: "/series" },
  { name: "About", href: "/about" },
];
const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);
  const renderLinks = (mobile = false) =>
    links.map(({ name, href }) => {
      const active = isActivePath(pathname, href);
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={mobile ? () => setIsOpen(false) : undefined}
          className={`${
            mobile
              ? "border-b border-line/70 py-3.5 text-[15px] last:border-b-0 active:scale-[0.98]"
              : "relative text-sm active:scale-95"
          } transition-all duration-100 ease-out ${
            active ? "font-medium text-signal" : "text-muted hover:text-ink"
          }`}
        >
          {name}
        </Link>
      );
    });
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 xl:max-w-7xl 2xl:max-w-360"
      >
        <Link
          href="/"
          className="font-script text-[22px] leading-none tracking-tight text-ink transition-all duration-100 ease-out hover:opacity-75 active:scale-95"
        >
          Momented
        </Link>
        <div className="hidden items-center gap-7 md:flex">{renderLinks()}</div>
        <button
          type="button"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-all duration-100 ease-out hover:bg-soft active:scale-90 md:hidden"
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
            {renderLinks(true)}
          </nav>
        </div>
      )}
    </header>
  );
}
