interface SearchBarProps {
  defaultValue?: string;
  filter?: string;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
}

export default function SearchBar({
  defaultValue,
  filter,
  placeholder = 'Try upcoming events, concerts, workshops…',
  buttonLabel = 'Explore',
  className = '',
}: SearchBarProps) {
  return (
    <form
      action="/events"
      method="GET"
      className={`flex w-full max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm ${className}`}
    >
      <span className="pl-4 font-mono text-xs text-muted-foreground">
        SEARCH
      </span>
      {filter && <input type="hidden" name="filter" value={filter} />}
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-2 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-full bg-ember px-5 font-mono text-[11px] uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
