"use client";
import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const isOpen = openedAt === pathname;
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isHeroTransparent = pathname === "/" && !isScrolled && !isOpen;
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenedAt(null);
        menuButtonRef.current?.focus();
      }
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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out motion-reduce:transition-none ${
        isOpen
          ? "border-b border-line bg-paper shadow-xs"
          : isScrolled
            ? "border-b border-line/70 bg-paper/90 backdrop-blur-md shadow-[0_1px_0_0_var(--color-line)]"
            : isHeroTransparent
              ? "bg-linear-to-b from-black/60 via-black/20 to-transparent"
              : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 xl:max-w-7xl 2xl:max-w-360"
      >
        <Link
          href="/"
          onClick={() => setOpenedAt(null)}
          className="group flex items-center gap-2.5 cursor-pointer transition-opacity duration-200 ease-out hover:opacity-80 active:scale-95"
        >
          <span
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-2xs transition-transform duration-200 ease-out group-hover:scale-105 ${
              isHeroTransparent
                ? "border-white/25 bg-white/10 backdrop-blur-sm"
                : "border-line bg-surface"
            }`}
          >
            <Image
              src="/icons/favicon.svg"
              alt="Momented logo"
              aria-hidden="true"
              width={32}
              height={32}
              loading="eager"
              unoptimized
              className="h-full w-full object-contain"
            />
          </span>
          <span
            className={`font-serif text-[1.375rem] leading-none tracking-tight transition-colors duration-200 ${
              isHeroTransparent ? "text-white" : "text-ink"
            }`}
          >
            Momented
          </span>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map(({ name, href }) => {
            const active = isActivePath(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative cursor-pointer py-1 text-[0.6875rem] font-semibold uppercase tracking-widest transition-colors duration-150 ${
                    isHeroTransparent
                      ? active
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                      : active
                        ? "text-ink"
                        : "text-muted hover:text-ink"
                  }`}
                >
                  {name}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1 left-0 h-px rounded-full transition-all duration-200 motion-reduce:transition-none ${
                      isHeroTransparent ? "bg-white/80" : "bg-signal"
                    } ${active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-40"}`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          ref={menuButtonRef}
          type="button"
          className={`-mr-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ease-out active:scale-95 md:hidden ${
            isHeroTransparent
              ? "text-white hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/50"
              : "text-ink hover:bg-soft"
          }`}
          onClick={() =>
            setOpenedAt((prev) => (prev === pathname ? null : pathname))
          }
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span
            className="relative flex h-5 w-5 items-center justify-center"
            aria-hidden="true"
          >
            <Menu
              size={20}
              className={`absolute transition-all duration-200 ease-out motion-reduce:transition-none ${
                isOpen
                  ? "scale-75 opacity-0 rotate-90"
                  : "scale-100 opacity-100 rotate-0"
              }`}
            />
            <X
              size={20}
              className={`absolute transition-all duration-200 ease-out motion-reduce:transition-none ${
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
        className={`fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto overscroll-contain bg-paper/97 backdrop-blur-2xl transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none md:hidden ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-3 opacity-0"
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-8">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col">
              {links.map(({ name, href }, i) => {
                const active = isActivePath(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpenedAt(null)}
                      style={{
                        transitionDelay: isOpen ? `${i * 40}ms` : "0ms",
                      }}
                      className={`group flex cursor-pointer items-center justify-between border-b border-line/50 py-4 text-lg font-medium transition-all duration-200 motion-reduce:transition-delay-0 motion-reduce:transition-none active:scale-95 ${
                        active ? "text-ink" : "text-muted hover:text-ink"
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
                          aria-hidden="true"
                          className="text-muted/35 transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center justify-between border-t border-line/50 pt-5 text-xs font-mono text-faint">
            <span>Public Domain Journal</span>
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer text-signal/80 transition-colors hover:text-signal"
            >
              CC0 1.0
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
