import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";
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
  title: "Sky Blue Studio Music Tracker",
  description: siteDescription,
  keywords: [
    "music tracker",
    "radio playlist tracker",
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
    title: "Sky Blue Studio Music Tracker",
    description: siteDescription,
    url: "/",
    type: "website",
    siteName,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Sky Blue Studio Music Tracker preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sky Blue Studio Music Tracker",
    description: siteDescription,
    images: ["/opengraph-image.png"],
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full transition-colors">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME)};var t=localStorage.getItem(k)||d;document.documentElement.classList.toggle('dark',t==='dark');}catch(e){document.documentElement.classList.add('dark');}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
