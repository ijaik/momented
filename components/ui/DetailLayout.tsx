import type { ReactNode } from "react";
import BackButton from "@/components/ui/BackButton";
interface DetailLayoutProps {
  title?: string;
  description?: string | null;
  meta?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}
export default function DetailLayout({
  title,
  description,
  meta,
  header,
  children,
}: DetailLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
      <BackButton className="mb-8 md:mb-10" />
      {header ?? (
        <header className="mb-12 border-b border-line pb-8">
          <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-[15px] leading-relaxed text-muted md:text-base">
              {description}
            </p>
          )}
          {meta && <p className="mt-2 text-sm text-muted/80">{meta}</p>}
        </header>
      )}
      {children}
    </main>
  );
}