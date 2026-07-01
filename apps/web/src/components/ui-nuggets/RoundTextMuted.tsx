export default function RoundTextMuted({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest bg-ember">
      {children}
    </div>
  );
}