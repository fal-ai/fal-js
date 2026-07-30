import type { Metadata } from "next";
import Link from "next/link";
import "./global.css";

export const metadata: Metadata = {
  title: "World models · fal.js",
  description:
    "Two realtime world models, one small customer-facing fal.js contract.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              f
            </span>
            <span>worlds</span>
          </Link>
          <nav aria-label="Demo models">
            <Link href="/lucy">Lucy 2.5</Link>
            <Link href="/happy-oyster">Happy Oyster</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
