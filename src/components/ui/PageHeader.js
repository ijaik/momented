export default function PageHeader({ title, subtitle, description }) {
  return (
    <header className="mb-20 text-center">
      <h1 className="text-[50px] md:text-5xl font-extrabold tracking-tighter mb-6 text-zinc-900 dark:text-white leading-tight">
        {title}
      </h1>
      <p className="text-[25px] text-zinc-400 dark:text-zinc-600 mb-6">
        {subtitle}
      </p>
      {description && (
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </header>
  );
}
