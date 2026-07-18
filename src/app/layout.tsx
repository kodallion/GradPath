import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://gradpath.live"),
  title: "GradPath — Manage Every Graduate Application in One Place",
  description:
    "Track, organize, and complete multiple university applications with clarity, structure, and AI guidance.",
  openGraph: {
    title: "GradPath — Never lose track of a graduate school application again.",
    description:
      "Track every application, deadline, and document in one place. Free for students.",
    url: "https://gradpath.live",
    siteName: "GradPath",
    images: [
      {
        url: "https://gradpath.live/og-image.png",
        width: 1200,
        height: 630,
        alt: "GradPath dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GradPath — Never lose track of a graduate school application again.",
    description:
      "Track every application, deadline, and document in one place. Free for students.",
    images: ["https://gradpath.live/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GradPath",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
