interface SearchBarProps {
  defaultValue?: string;
  filter?: string;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
  action?: string;
  extraParams?: Record<string, string>;
}

export default function SearchBar({
  defaultValue,
  filter,
  placeholder = 'Try upcoming events, concerts, workshops…',
  buttonLabel = 'Explore',
  className = '',
  action = '/events',
  extraParams,
}: SearchBarProps) {
  return (
    <form
      action={action}
      method="GET"
      className={`flex w-full max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm ${className}`}
    >
      <span className="pl-4 font-mono text-xs text-muted-foreground">
        SEARCH
      </span>
      {filter && <input type="hidden" name="filter" value={filter} />}
      {extraParams &&
        Object.entries(extraParams).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-2 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
      />
      <button
        type="submit"
        aria-label={buttonLabel}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember text-ember-foreground transition-transform hover:-translate-y-0.5"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
}
