import type { Metadata } from "next";
import { SongDashboard } from "@/components/song-dashboard";
import { getSongData } from "@/lib/song-data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KSBJ Tracker | Sky Blue Studio Music Tracker",
  description:
    "Browse recently played songs on KSBJ, explore the most-played tracks, and open the full YouTube Music playlist.",
  alternates: {
    canonical: "/ksbj",
  },
  openGraph: {
    title: "KSBJ Tracker | Sky Blue Studio Music Tracker",
    description:
      "Browse recently played songs on KSBJ, explore the most-played tracks, and open the full YouTube Music playlist.",
    url: "/ksbj",
  },
  twitter: {
    title: "KSBJ Tracker | Sky Blue Studio Music Tracker",
    description:
      "Browse recently played songs on KSBJ, explore the most-played tracks, and open the full YouTube Music playlist.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "KSBJ Tracker",
  description:
    "Browse recently played songs on KSBJ, explore the most-played tracks, and open the full YouTube Music playlist.",
  url: `${siteUrl}/ksbj`,
  inLanguage: "en-US",
  about: ["KSBJ", "radio playlist", "Christian music"],
  isPartOf: {
    "@type": "WebSite",
    name: "Sky Blue Studio Music Tracker",
    url: siteUrl,
  },
  mainEntity: {
    "@type": "ItemList",
    name: "KSBJ recently played songs",
    description: "Recently played songs and most-played tracks on KSBJ.",
  },
};

export default async function KsbjPage() {
  const songData = await getSongData();

  return (
    <main className="min-h-screen transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SongDashboard
        {...songData}
        config={{
          currentPath: "/ksbj",
          eyebrow: "KSBJ song history",
          title: "KSBJ Tracker",
          description:
            "Track songs recently played on KSBJ, browse the latest rotation, find the most-played tracks, search by title or artist, and jump into the full YouTube Music playlist. Use it to see what was on KSBJ today, discover repeat favorites, and open song links in YouTube Music.",
          visitUrl: "https://ksbj.org",
          visitLabel: "Visit KSBJ.org",
          sampleDataMessage: "Configure the sheet URL to go live.",
          footerDisclaimer: "Unofficial KSBJ song tracker. Not affiliated with or endorsed by KSBJ.",
          actionCard: {
            title: "Full playlist",
            linkUrl: "https://music.youtube.com/playlist?list=PLL4Buq3mCcXM&si=2pZvH94Jq7fsxz16",
            linkLabel: "music.youtube.com ↗",
            description: "Open the complete playlist and browse all tracked songs in one place.",
            iconText: "▶",
          },
        }}
      />
    </main>
  );
}
