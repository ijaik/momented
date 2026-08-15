import type { ReactNode } from "react";
import BackButton from "@/components/ui/BackButton";

interface DetailLayoutProps {
  title?: string;
  description?: string | null;
  header?: ReactNode;
  headerMargin?: string;
  children: ReactNode;
}
export default function DetailLayout({
  title,
  description,
  header,
  headerMargin = "mb-16 md:mb-24",
  children,
}: DetailLayoutProps) {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BackButton />
        {header ?? (
          <header className={`${headerMargin} text-center md:text-left`}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}
