import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { LangSync } from "@/components/layout/LangSync";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Smart Event Experience`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["smart event", "event navigation", "crowd management", "event AI", "event experience"],
  authors: [{ name: "EventIQ Team" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: `${APP_NAME} — Smart Event Experience`,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

/**
 * Root layout — sets lang attribute, skip nav, header, footer.
 * RULE A11Y-1: Every page must have a unique title via metadata export.
 * RULE A11Y-2: html lang attribute must match active language.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <LangSync />
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <AppHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <AppFooter />
      </body>
    </html>
  );
}
