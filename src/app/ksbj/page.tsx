import type { Metadata } from "next";
import { SongDashboard } from "@/components/song-dashboard";
import { getSongData } from "@/lib/song-data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KSBJ Song History | Recently Played Songs & Playlist",
  description:
    "Browse recently played songs on KSBJ, explore the most-played tracks, and open the full YouTube Music playlist.",
  alternates: {
    canonical: "/ksbj",
  },
  openGraph: {
    title: "KSBJ Song History | Recently Played Songs & Playlist",
    description:
      "Browse recently played songs on KSBJ, explore the most-played tracks, and open the full YouTube Music playlist.",
    url: "/ksbj",
  },
  twitter: {
    title: "KSBJ Song History | Recently Played Songs & Playlist",
    description:
      "Browse recently played songs on KSBJ, explore the most-played tracks, and open the full YouTube Music playlist.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "KSBJ Song History",
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
      <SongDashboard {...songData} />
    </main>
  );
}
