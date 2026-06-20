import { SongDashboard } from "@/components/song-dashboard";
import { getSongData } from "@/lib/song-data";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  inLanguage: "en-US",
  about: ["KSBJ", "radio playlist", "Christian music"],
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
  mainEntity: {
    "@type": "ItemList",
    name: "KSBJ recently played songs",
    description: "Recently played songs and most-played tracks on KSBJ.",
  },
};

export default async function Home() {
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
