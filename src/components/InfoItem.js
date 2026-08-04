export default function InfoItem({ label, value }) {
  return value
    ? <div>
        <span className="block text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mb-1">
          {label}
        </span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
      </div>
    : null;
}
