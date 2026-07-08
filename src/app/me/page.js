export const metadata = {
  title: "About",
};
export default function MePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 md:px-10 py-20 md:py-32 font-sans">
      <header className="mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white">
          Hi, I'm Jai.
        </h1>
      </header>
      <article className="space-y-8 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
        <p>
          I am a <del>photographer</del>.
        </p>
        <p>
          Through{" "}
          <span className="text-zinc-900 dark:text-zinc-100 font-leckerli tracking-tight">
            Momented
          </span>
          , <br />I document my{" "}
          <span className="text-zinc-900 dark:text-zinc-100 font-leckerli tracking-tight">
            Momented
          </span>{" "}
          (captured + moment).
        </p>
        <p>
          Everyone can use my{" "}
          <span className="text-zinc-900 dark:text-zinc-100 font-leckerli tracking-tight">
            Momented
          </span>
          .
        </p>
      </article>

      <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <a
          href="https://github.com/ijaik"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors text-lg tracking-tight"
        >
          GitHub
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
            ↗
          </span>
        </a>
      </div>
    </main>
  );
}
