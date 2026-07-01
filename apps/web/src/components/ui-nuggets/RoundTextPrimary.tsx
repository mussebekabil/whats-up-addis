export default function RoundTextPrimary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-md bg-ember px-2 py-1 font-mono text-xs uppercase tracking-widest text-primary-foreground">
      {children}
    </span>
  );
}
