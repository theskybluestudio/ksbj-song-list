import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "KSBJ Song History | Recently Played Songs & Playlist",
  description: siteDescription,
  keywords: [
    "KSBJ",
    "KSBJ playlist",
    "KSBJ recently played",
    "KSBJ song list",
    "Christian radio playlist",
    "Houston radio songs",
    "YouTube Music playlist",
  ],
  alternates: {
    canonical: "/",
  },
  applicationName: siteName,
  category: "music",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "KSBJ Song History | Recently Played Songs & Playlist",
    description: siteDescription,
    url: "/",
    type: "website",
    siteName,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KSBJ Song History preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KSBJ Song History | Recently Played Songs & Playlist",
    description: siteDescription,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full transition-colors">{children}</body>
    </html>
  );
}
