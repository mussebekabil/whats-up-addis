// Injected before hydration to set dark class and avoid flash of wrong theme
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var s=localStorage.getItem('wua-theme');if(s!=='light'){document.documentElement.classList.add('dark');}})();`,
      }}
    />
  );
}
