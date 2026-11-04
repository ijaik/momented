export default function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="text-xs font-mono uppercase tracking-widest text-signal">
      {children}
    </span>
  );
}
