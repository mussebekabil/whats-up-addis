import RoundTextPrimary from "./ui-nuggets/RoundTextPrimary";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl">What&apos;s Up</span>
           <RoundTextPrimary>Addis</RoundTextPrimary>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} &middot; Made in Addis Ababa ✦
        </p>
      </div>
    </footer>
  );
}
