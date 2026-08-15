'use client';

import { useEffect, useState } from 'react';

type Theme = 'system' | 'dark' | 'light';

const ICONS: Record<Theme, string> = { system: '⊙', dark: '☾', light: '☀' };
const NEXT: Record<Theme, Theme> = { system: 'dark', dark: 'light', light: 'system' };

function readStoredTheme(): Theme {
  const s = localStorage.getItem('wua-theme');
  return s === 'dark' || s === 'light' ? s : 'system';
}

function applyTheme(theme: Theme) {
  if (theme === 'system') {
    localStorage.removeItem('wua-theme');
    document.documentElement.classList.toggle(
      'dark',
      window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
  } else {
    localStorage.setItem('wua-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setTheme(readStoredTheme());

    // Keep the dark class in sync with OS preference while in system mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('wua-theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => {
    const next = NEXT[theme];
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
    >
      <span className="font-mono text-xs">{ICONS[theme]}</span>
    </button>
  );
}
