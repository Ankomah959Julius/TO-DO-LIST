import "./globals.css";
import Script from "next/script";
import Providers from "./providers";
import { ThemeProvider } from "./theme-provider";

export const metadata = {
  title: "Checklist",
  description: "A simple, persistent to-do list.",
};

// Runs before React hydrates, so the correct theme is applied on the very
// first paint instead of flashing light-then-dark (or vice versa).
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme') || 'system';
    var effective = stored === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : stored;
    document.documentElement.setAttribute('data-theme', effective);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
