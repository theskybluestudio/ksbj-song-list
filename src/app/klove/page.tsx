import type { Metadata } from "next";
import { SongDashboard } from "@/components/song-dashboard";
import { getKloveSongData } from "@/lib/klove-song-data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "K-LOVE Tracker | Sky Blue Studio Music Tracker",
  description:
    "Browse recently played songs on K-LOVE, explore the captured rotation, and open the official songs page.",
  alternates: {
    canonical: "/klove",
  },
  openGraph: {
    title: "K-LOVE Tracker | Sky Blue Studio Music Tracker",
    description:
      "Browse recently played songs on K-LOVE, explore the captured rotation, and open the official songs page.",
    url: "/klove",
  },
  twitter: {
    title: "K-LOVE Tracker | Sky Blue Studio Music Tracker",
    description:
      "Browse recently played songs on K-LOVE, explore the captured rotation, and open the official songs page.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "K-LOVE Tracker",
  description:
    "Browse recently played songs on K-LOVE, explore the captured rotation, and open the official songs page.",
  url: `${siteUrl}/klove`,
  inLanguage: "en-US",
  about: ["K-LOVE", "radio playlist", "Christian music"],
  isPartOf: {
    "@type": "WebSite",
    name: "Sky Blue Studio Music Tracker",
    url: siteUrl,
  },
  mainEntity: {
    "@type": "ItemList",
    name: "K-LOVE recently played songs",
    description: "Observed K-LOVE recently played songs and repeat favorites.",
  },
};

export default async function KlovePage() {
  const songData = await getKloveSongData();

  return (
    <main className="min-h-screen transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SongDashboard
        {...songData}
        config={{
          currentPath: "/klove",
          eyebrow: "K-LOVE song history",
          title: "K-LOVE Tracker",
          description:
            "Track songs recently played on K-LOVE, browse the observed rotation, search by title or artist, and jump to the official K-LOVE songs page. This captures observed snapshots of K-LOVE's Recently Played feed over time.",
          visitUrl: "https://www.klove.com/music/songs",
          visitLabel: "Visit K-LOVE songs",
          sampleDataMessage: "Run the K-LOVE collector to go live.",
          footerDisclaimer: "Unofficial K-LOVE song tracker. Not affiliated with or endorsed by K-LOVE.",
          actionCard: {
            title: "Official songs page",
            linkUrl: "https://www.klove.com/music/songs",
            linkLabel: "klove.com ↗",
            description: "Open the official K-LOVE songs page to browse recent, top, and new songs directly from the source.",
            iconText: "↗",
          },
        }}
      />
    </main>
  );
}
