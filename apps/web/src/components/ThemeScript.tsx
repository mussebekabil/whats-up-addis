// Injected before hydration to set dark class and avoid flash of wrong theme
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var s=localStorage.getItem('wua-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s?s==='dark':p){document.documentElement.classList.add('dark');}})();`,
      }}
    />
  );
}
