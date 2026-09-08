import type { Metadata, Viewport } from "next";
// Self-hosted Geist (the `geist` package bundles the woff2 files and wraps
// `next/font/local`). Deliberately NOT `next/font/google`, which fetches from
// fonts.gstatic.com at build time and so breaks offline and network-restricted
// builds — including CI. Exposes the same CSS variables as before.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const metadata: Metadata = {
  title: "Customer Engagement Hub",
  description: "Manage customer relationships and track engagement progress with comprehensive CRM and notes management",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/customer-hub-icon.svg',
  },
  manifest: '/manifest.json',
};

// Next.js 15: viewport and themeColor moved to separate export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
