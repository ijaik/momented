export const metadata = {
  title: "About",
};
export default function MePage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-20 md:py-32 selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <header className="mb-24 md:mb-32">
          <h1 className="text-[60px] md:text-[100px] font-extrabold tracking-tighter text-zinc-900 dark:text-white leading-none mb-6">
            Hi, I'm Jai.
          </h1>
          <p className="text-xl md:text-3xl font-medium text-zinc-500 dark:text-zinc-400 tracking-tight">
            I am{" "}
            <del className="decoration-zinc-300 dark:decoration-zinc-700 decoration-[3px]">
              a photographer
            </del>{" "}
            an observer.
          </p>
        </header>
        <article className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
          <div className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              The Concept
            </h2>
            <p>
              A{" "}
              <span className="text-zinc-900 dark:text-white font-leckerli tracking-tight text-2xl">
                Momented
              </span>{" "}
              is a captured moment.
            </p>
            <p>
              Through{" "}
              <span className="text-zinc-900 dark:text-white font-leckerli tracking-tight text-xl md:text-2xl">
                Momented
              </span>
              , I document the quiet intersections of light, shadow, and time.
            </p>
            <p>
              It’s not just about taking a picture. It’s about preserving a
              feeling.
            </p>
          </div>
          <div className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              The Purpose
            </h2>
            <p>
              Art is meant to be shared, not locked away. Everyone can use my{" "}
              <span className="text-zinc-900 dark:text-white font-leckerli tracking-tight text-2xl">
                Momented
              </span>
              .
            </p>
            <p>These captured moments are yours as much as they are mine.</p>
            <p>
              Download them, use them in your own projects, or just let them
              inspire your own narrative.
            </p>
          </div>
        </article>
        <div className="mt-32 pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
            Based in the moments between.
          </p>
          <a
            href="https://github.com/ijaik"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
          >
            GitHub
            <span className="inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-full transition-transform duration-300 group-hover:rotate-45">
              ↗
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}
