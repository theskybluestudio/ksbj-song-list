import Link from "next/link";
import type { Metadata } from "next";
import { getArtistSummaries } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artists | Sky Blue Studio Music Tracker",
  description:
    "Browse artists appearing across the KSBJ and K-LOVE music trackers, including total observed plays, song counts, and source coverage.",
  alternates: {
    canonical: "/artists",
  },
  openGraph: {
    title: "Artists | Sky Blue Studio Music Tracker",
    description:
      "Browse artists appearing across the KSBJ and K-LOVE music trackers, including total observed plays, song counts, and source coverage.",
    url: "/artists",
  },
  twitter: {
    title: "Artists | Sky Blue Studio Music Tracker",
    description:
      "Browse artists appearing across the KSBJ and K-LOVE music trackers, including total observed plays, song counts, and source coverage.",
  },
};

function formatUpdated(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

const structuredDataBase = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Artists | Sky Blue Studio Music Tracker",
  description:
    "Browse artists appearing across the KSBJ and K-LOVE music trackers, including total observed plays, song counts, and source coverage.",
  url: `${siteUrl}/artists`,
  inLanguage: "en-US",
};

export default async function ArtistsPage() {
  const artists = await getArtistSummaries();
  const structuredData = {
    ...structuredDataBase,
    mainEntity: {
      "@type": "ItemList",
      name: "Tracked artists",
      itemListElement: artists.slice(0, 100).map((artist, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: artist.name,
        url: `${siteUrl}/artists/${artist.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-lg shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Artist catalog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Tracked artists</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
            Browse artists observed across the KSBJ and K-LOVE dashboards, with song counts, total play counts, and latest activity.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 shadow-sm">
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-100">Artists</h2>
            <p className="text-sm text-slate-400">{artists.length.toLocaleString()} artist pages available</p>
          </div>
          <div className="divide-y divide-slate-800">
            {artists.map((artist) => (
              <Link
                key={artist.slug}
                href={`/artists/${artist.slug}`}
                className="grid gap-3 px-5 py-4 transition hover:bg-slate-800/80 md:grid-cols-[minmax(0,2fr)_120px_120px_160px] md:items-center"
              >
                <div>
                  <div className="text-base font-medium text-slate-100">{artist.name}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {artist.sources.map((source) => source.toUpperCase()).join(" • ")}
                  </div>
                </div>
                <div className="text-sm text-slate-300">{artist.songCount.toLocaleString()} songs</div>
                <div className="text-sm text-slate-300">{artist.totalSeenCount.toLocaleString()} plays</div>
                <div className="text-sm text-slate-400">Updated {formatUpdated(artist.latestPlayedAt)}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

