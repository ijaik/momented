"use client";
import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { name: "Photographs", href: "/photos" },
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }
  const isHeroTransparent = pathname === "/" && !isScrolled && !isOpen;
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        isOpen
          ? "border-b border-line bg-paper shadow-xs"
          : isScrolled
            ? "border-b border-line/70 bg-paper/85 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            : isHeroTransparent
              ? "bg-linear-to-b from-black/55 via-black/20 to-transparent"
              : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 xl:max-w-7xl 2xl:max-w-360"
      >
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="group flex items-center gap-2.5 transition-all duration-200 ease-out hover:opacity-85 active:scale-95"
        >
          <span
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-2xs transition-all duration-200 ease-out group-hover:scale-105 ${
              isHeroTransparent
                ? "border-white/30 bg-white/10"
                : "border-line/80 bg-surface"
            }`}
          >
            <Image
              src="/icons/favicon.svg"
              alt="Momented logo"
              width={32}
              height={32}
              loading="eager"
              unoptimized
              className="h-full w-full object-contain"
            />
          </span>
          <span
            className={`font-serif text-2xl tracking-tight transition-colors duration-200 ${
              isHeroTransparent ? "text-white" : "text-ink"
            }`}
          >
            Momented
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(({ name, href }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-xs font-medium uppercase tracking-wider transition-colors duration-200 active:scale-95 ${
                  isHeroTransparent
                    ? active
                      ? "text-white font-semibold"
                      : "text-white/80 hover:text-white"
                    : active
                      ? "text-ink font-semibold"
                      : "text-muted hover:text-ink"
                }`}
              >
                <span>{name}</span>
                {active && (
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full transition-colors ${
                      isHeroTransparent ? "bg-white" : "bg-signal"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className={`-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ease-out active:scale-95 md:hidden cursor-pointer ${
            isHeroTransparent
              ? "text-white hover:bg-white/15"
              : "text-ink hover:bg-soft"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Menu
              size={20}
              aria-hidden="true"
              className={`absolute transition-all duration-200 ease-out ${
                isOpen
                  ? "scale-75 opacity-0 rotate-90"
                  : "scale-100 opacity-100 rotate-0"
              }`}
            />
            <X
              size={20}
              aria-hidden="true"
              className={`absolute transition-all duration-200 ease-out ${
                isOpen
                  ? "scale-100 opacity-100 rotate-0"
                  : "scale-75 opacity-0 -rotate-90"
              }`}
            />
          </span>
        </button>
      </nav>
      <div
        id="mobile-menu"
        inert={!isOpen}
        className={`fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto overscroll-contain bg-paper/95 backdrop-blur-2xl transition-[opacity,transform,visibility] duration-300 ease-out md:hidden ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-between px-6 py-6 sm:px-8">
          <nav aria-label="Mobile Navigation" className="flex flex-col">
            {links.map(({ name, href }) => {
              const active = isActivePath(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between border-b border-line/60 py-4 text-lg font-medium transition-colors duration-200 active:scale-95 ${
                    active
                      ? "text-ink font-medium"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <span>{name}</span>
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-signal"
                    />
                  ) : (
                    <ArrowRight
                      size={15}
                      className="text-muted/40"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="pt-6 border-t border-line/60 flex items-center justify-between text-xs font-mono text-muted">
            <span>Public Domain Journal</span>
            <span className="text-signal font-medium">CC0 1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}
