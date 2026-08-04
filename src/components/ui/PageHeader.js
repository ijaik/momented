export default function PageHeader({ title, subtitle, description }) {
  return (
    <header className="mb-16 md:mb-24 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white leading-[1.1] mb-6">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium mb-4">
          {subtitle}
        </p>
      )}
      {description && (
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      )}
    </header>
  );
}
