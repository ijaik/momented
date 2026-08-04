import { Icons } from "@/components/ui/Icons";
export const metadata = {
  title: "About",
};
export default function MePage() {
  return (
    <main className="min-h-screen py-24 md:py-40 relative overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-6 md:px-10">
        <header className="mb-28 md:mb-40">
          <h1 className="text-[56px] md:text-[104px] font-extrabold tracking-tighter text-zinc-900 dark:text-white leading-[0.95] mb-10">
            Hi, I'm{" "}
            <span className="relative inline-block">
              Jai
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 120 12"
                fill="none"
                preserveAspectRatio="none"
                role="img"
                aria-label="Underline decoration"
              >
                <title>Underline decoration</title>
                <path
                  d="M2 8 C 30 2, 90 2, 118 8"
                  stroke="currentColor"
                  className="text-zinc-900 dark:text-white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <div className="space-y-3">
            <p className="text-xl md:text-3xl font-medium text-zinc-900 dark:text-zinc-200 tracking-tight">
              I am{" "}
              <del className="text-zinc-300 dark:text-zinc-700 decoration-zinc-300 dark:decoration-zinc-700 decoration-2">
                a photographer
              </del>{" "}
              <span className="text-zinc-900 dark:text-white">
                an observer.
              </span>
            </p>
            <p className="text-xl md:text-3xl font-medium text-zinc-900 dark:text-zinc-200 tracking-tight">
              I am a{" "}
              <del className="text-zinc-300 dark:text-zinc-700 decoration-zinc-300 dark:decoration-zinc-700 decoration-2">
                writer
              </del>{" "}
              <span className="text-zinc-900 dark:text-white">narrator.</span>
            </p>
            <p className="text-sm md:text-base font-normal text-zinc-400 dark:text-zinc-500 tracking-tight mt-6 italic max-w-xl">
              The perspective is mine; AI helps express it.
            </p>
          </div>
        </header>
        <article className="flex flex-col gap-24 md:gap-36 text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 md:gap-32">
            <section className="group relative">
              <div className="absolute -left-4 top-0 h-full w-px bg-linear-to-b from-transparent via-zinc-300 to-transparent dark:via-zinc-700 transition-all duration-500 group-hover:via-zinc-900 dark:group-hover:via-white" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-8 flex items-center gap-3">
                <Icons.Sparkle className="w-3 h-3" />
                The Concept
              </h2>
              <div className="space-y-6">
                <p>
                  <span className="text-zinc-900 dark:text-white font-leckerli tracking-tight text-3xl md:text-4xl block mb-2">
                    Momented
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500 text-base">
                    — a word I use for a captured moment.
                  </span>
                </p>
                <p className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-5 italic text-base md:text-lg text-zinc-600 dark:text-zinc-400">
                  Through{" "}
                  <span className="not-italic font-semibold text-zinc-900 dark:text-white">
                    Momented
                  </span>{" "}
                  I preserve the quiet conversations between light, shadow, and
                  time.
                </p>
              </div>
            </section>
            <section className="group relative">
              <div className="absolute -left-4 top-0 h-full w-px bg-linear-to-b from-transparent via-zinc-300 to-transparent dark:via-zinc-700 transition-all duration-500 group-hover:via-zinc-900 dark:group-hover:via-white" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-8 flex items-center gap-3">
                <Icons.Sparkle className="w-3 h-3" />
                The Purpose
              </h2>
              <div className="space-y-6">
                <p>Art is meant to be shared, not locked away.</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Take these moments wherever they feel at home.
                </p>
              </div>
            </section>
          </div>
          <section className="relative">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-8 flex items-center gap-3">
              <Icons.Sparkle className="w-3 h-3" />
              The License
            </h2>
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-white/80 to-zinc-50/40 dark:from-white/4 dark:to-white/1 backdrop-blur p-8 md:p-14 transition-all duration-500 hover:border-zinc-300 dark:hover:border-zinc-700">
              <span className="pointer-events-none absolute top-4 right-4 text-zinc-200 dark:text-zinc-800 text-xs">
                ©
              </span>
              <p className="relative text-xl md:text-2xl font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                The photographs can speak for themselves. <br />
                If you mention where they came from,{" "}
                <span className="relative whitespace-nowrap font-semibold text-zinc-900 dark:text-white">
                  I'm grateful
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-zinc-900 dark:bg-white/60" />
                </span>
                .
              </p>
            </div>
          </section>
        </article>
        <div className="mt-32 pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 tracking-widest">
            Living in the in-between.
          </p>
          <a
            href="https://github.com/ijaik"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 text-sm font-bold tracking-widest text-zinc-900 dark:text-white hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
          >
            GitHub
            <Icons.ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
