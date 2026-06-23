import type { Metadata } from "next";
import Link from "next/link";
import { SongIndex } from "@/components/song-index";
import { getSongSummaries } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Songs | Sky Blue Studio Music Tracker",
  description:
    "Browse tracked songs across the KSBJ and K-LOVE dashboards, including artists, total observed plays, and source coverage.",
  alternates: { canonical: "/songs" },
  openGraph: {
    title: "Songs | Sky Blue Studio Music Tracker",
    description:
      "Browse tracked songs across the KSBJ and K-LOVE dashboards, including artists, total observed plays, and source coverage.",
    url: "/songs",
  },
  twitter: {
    title: "Songs | Sky Blue Studio Music Tracker",
    description:
      "Browse tracked songs across the KSBJ and K-LOVE dashboards, including artists, total observed plays, and source coverage.",
  },
};

export default async function SongsPage() {
  const songs = await getSongSummaries();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Songs | Sky Blue Studio Music Tracker",
    description:
      "Browse tracked songs across the KSBJ and K-LOVE dashboards, including artists, total observed plays, and source coverage.",
    url: `${siteUrl}/songs`,
    inLanguage: "en-US",
    mainEntity: {
      "@type": "ItemList",
      name: "Tracked songs",
      itemListElement: songs.slice(0, 100).map((song, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${song.title} — ${song.artist}`,
        url: `${siteUrl}/songs/${song.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">Home</Link>
          <span className="px-2">/</span>
          <span className="text-slate-200">Songs</span>
        </nav>
        <section className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-lg shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Song catalog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Tracked songs</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
            Browse songs observed across the KSBJ and K-LOVE dashboards, with artists, total play counts, and latest activity.
          </p>
        </section>
        <SongIndex songs={songs} />
      </div>
    </main>
  );
}
