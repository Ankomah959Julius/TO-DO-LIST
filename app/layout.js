import "./globals.css";

export const metadata = {
  title: "Checklist",
  description: "A simple, persistent to-do list.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
