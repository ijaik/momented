interface InfoItemProps {
  label: string;
  value?: string | number | null;
}
export default function InfoItem({ label, value }: InfoItemProps) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate">
        {value}
      </span>
    </div>
  );
}
