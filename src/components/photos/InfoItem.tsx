interface InfoItemProps {
  label: string;
  value?: string | number | null;
}
export default function InfoItem({ label, value }: InfoItemProps) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3 last:border-b-0">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
