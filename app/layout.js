import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Checklist",
  description: "A simple, persistent to-do list.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
